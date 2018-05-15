import logging

from datetime import timedelta

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from annoying.fields import AutoOneToOneField
from bitfield import BitField
from rest_framework.authtoken.models import Token

from climate_api.wrapper import make_token_api_request
from planit_data.models import (
    DefaultRisk,
    GeoRegion,
    OrganizationRisk,
    OrganizationWeatherEvent,
    WeatherEventRank,
)
from planit_data.utils import apportion_counts, send_html_email


logger = logging.getLogger(__name__)


class PlanItLocationManager(models.Manager):

    @transaction.atomic
    def from_api_city(self, api_city_id):
        location, created = PlanItLocation.objects.get_or_create(api_city_id=api_city_id)
        if created:
            city = make_token_api_request('/api/city/{}/'.format(api_city_id))
            location.name = city['properties']['name']
            location.admin = city['properties']['admin']
            location.point = GEOSGeometry(str(city['geometry']))
            location.georegion = GeoRegion.objects.get_for_point(location.point)
            location.is_coastal = city['properties']['proximity']['ocean']
            location.save()
        return location

    def get_by_natural_key(self, api_city_id):
        """Get or create the location based on its API City ID."""
        return self.from_api_city(api_city_id)


class PlanItLocation(models.Model):
    name = models.CharField(max_length=256, null=False, blank=True)
    admin = models.CharField(max_length=16, null=False, blank=True)
    api_city_id = models.IntegerField(null=True, blank=True)
    point = models.PointField(srid=4326, null=True, blank=True)
    georegion = models.ForeignKey(GeoRegion, null=True, blank=True)
    is_coastal = models.BooleanField(default=False)

    objects = PlanItLocationManager()

    class Meta:
        verbose_name = 'location'

    def natural_key(self):
        return (self.api_city_id,)

    def __str__(self):
        if self.admin:
            return "{}, {}".format(self.name, self.admin)
        else:
            return self.name


class PlanItOrganization(models.Model):
    """Users belong to one or more organizations."""
    DEFAULT_FREE_TRIAL_DAYS = 15

    METRIC = 'METRIC'
    IMPERIAL = 'IMPERIAL'
    UNITS_CHOICES = ((IMPERIAL, 'imperial'),
                     (METRIC, 'metric'),)

    class Subscription:
        FREE_TRIAL = 'free_trial'
        BASIC = 'basic'
        REVIEW = 'review'
        INSIGHTS = 'insights'
        GUIDANCE = 'guidance'
        CUSTOM = 'custom'

        CHOICES = (
            (FREE_TRIAL, 'Free Trial',),
            (BASIC, 'Basic',),
            (REVIEW, 'Review',),
            (INSIGHTS, 'Insights',),
            (GUIDANCE, 'Guidance',),
            (CUSTOM, 'Custom',),
        )

    name = models.CharField(max_length=256, blank=False, null=False)
    units = models.CharField(max_length=16, choices=UNITS_CHOICES, default=IMPERIAL)
    location = models.ForeignKey(PlanItLocation, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('users.PlanItUser', null=True, default=None,
                                   on_delete=models.SET_NULL)

    subscription = models.CharField(max_length=16,
                                    choices=Subscription.CHOICES,
                                    default=Subscription.FREE_TRIAL)
    subscription_end_date = models.DateTimeField(null=True, blank=True, db_index=True)
    subscription_pending = models.BooleanField(default=False)

    plan_due_date = models.DateField(null=True, blank=True)
    plan_name = models.CharField(max_length=256, blank=True)
    plan_hyperlink = models.URLField(blank=True)
    plan_setup_complete = models.BooleanField(default=False)
    community_systems = models.ManyToManyField('planit_data.CommunitySystem',
                                               blank=True,
                                               related_name='organizations')

    class Meta:
        unique_together = (("name", "location"),)
        verbose_name = 'organization'

    def __str__(self):
        return "{} - {}".format(self.name, str(self.location))

    def save(self, *args, **kwargs):
        self._set_subscription()
        super().save(*args, **kwargs)

    def import_weather_events(self):
        georegion = GeoRegion.objects.get_for_point(self.location.point)
        weather_event_ranks = WeatherEventRank.objects.filter(georegion=georegion)

        if not self.location.is_coastal:
            # For cities not on the coast, exclude Weather Events that only apply to coastal areas
            weather_event_ranks = weather_event_ranks.filter(weather_event__coastal_only=False)

        OrganizationWeatherEvent.objects.bulk_create(
            OrganizationWeatherEvent(organization=self,
                                     weather_event=weather_event_rank.weather_event,
                                     order=weather_event_rank.order)
            for weather_event_rank in weather_event_ranks
        )

    @transaction.atomic
    def update_weather_events(self, weather_event_ids):
        self.weather_events.all().delete()

        OrganizationWeatherEvent.objects.bulk_create(
            OrganizationWeatherEvent(weather_event_id=event_id, organization_id=self.pk,
                                     order=index + 1)
            for index, event_id in enumerate(weather_event_ids)
        )

        if self.plan_setup_complete:
            self.import_risks()

    def import_risks(self):
        # Get IDs for all Weather Events that don't currently have any Risks
        weather_event_ids = self.weather_events.all().exclude(
            weather_event__organizationrisk__organization__id=self.id
        ).values_list('weather_event_id', flat=True)

        # Create a Risk for every Community System, but at least 2 in case the user picked none
        risks_per = max(2, self.community_systems.count())
        num_to_add = risks_per * len(weather_event_ids)
        logger.debug("Importing {} risks per hazard, {} total".format(risks_per, num_to_add))

        if not self.organizationrisk_set.exists():
            # For initial population, make sure to create at least 15 Risks overall
            num_to_add = max(num_to_add, settings.STARTING_RISK_AMOUNT)
            logger.debug("First import, set number to import to {}".format(num_to_add))

        # Produce a list of (weather_event, community_system) pairs
        sample_risk_tuples = self._get_sample_risks(weather_event_ids, num_to_add)

        # Turn the (weather_event, community_system) pairs into OrganizationRisk objects
        OrganizationRisk.objects.bulk_create(
            OrganizationRisk(
                organization=self,
                weather_event_id=weather_event,
                community_system_id=community_system
            ) for weather_event, community_system in sample_risk_tuples
        )

    def _get_sample_risks(self, weather_events, total):
        community_systems = self.community_systems.values_list('id', flat=True)
        for weather_event, count in apportion_counts(weather_events, total):
            # Start with any of the user's community systems
            for community_system in community_systems:
                yield (weather_event, community_system)

            # If we need more sample risks, take from the DefaultRisk objects
            count -= len(community_systems)
            if count > 0:
                default_risk_community_systems = DefaultRisk.objects.filter(
                    weather_event=weather_event
                ).exclude(
                    community_system__organizations__id=self.id
                ).values_list('community_system_id', flat=True).order_by('order')

                for community_system in default_risk_community_systems[:count]:
                    yield (weather_event, community_system)

    def _set_subscription(self):
        # Ensure that free trials always have an end date, defaulting to DEFAULT_FREE_TRIAL_DAYS
        # rounded up to the start of the following day
        if self.subscription == self.Subscription.FREE_TRIAL and self.subscription_end_date is None:
            trial_start = self.created_at or timezone.now()
            trial_end = trial_start + timedelta(days=self.DEFAULT_FREE_TRIAL_DAYS + 1)
            # Hour 7 UTC is ~ middle of night in US, pushing it there limits impact and chance of
            #   a user signing up right around the cutoff
            trial_end_rounded = trial_end.replace(hour=7, minute=0, second=0, microsecond=0)
            self.subscription_end_date = trial_end_rounded
        # Automatically update plan end date to one year from now when we switch to a paid plan
        elif self.subscription != self.Subscription.FREE_TRIAL:
            try:
                last_subscription = PlanItOrganization.objects.get(id=self.id).subscription
                if last_subscription != self.subscription:
                    now = timezone.now()
                    self.subscription_end_date = now.replace(year=now.year + 1)
                    self.subscription_pending = True
            except PlanItOrganization.DoesNotExist:
                pass


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """Create auth token upon new user creation.

    Account access still requires email verification.
    """
    if created:
        Token.objects.create(user=instance)


class PlanItUserManager(BaseUserManager):
    """Custom user manager, based on Django's UserManager."""

    @transaction.atomic
    def _create_user(self, email, first_name, last_name, password, **extra):
        if not email:
            raise ValueError('Email must be set')

        email = self.normalize_email(email)
        user = PlanItUser(email=email, first_name=first_name, last_name=last_name, **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        # Add the user's primary organization to their organizations list
        # Need to do this after user.save() since many-to-many fields need a database object
        if 'primary_organization' in extra:
            # Check if a primary organization was explicitly provided
            primary_org = extra['primary_organization']
            user.organizations.add(primary_org)

        return user

    def create(self, *args, **kwargs):
        """Alias of create_user for DRF serializer use."""
        return self.create_user(*args, **kwargs)

    def create_user(self, email, first_name, last_name, password=None, **extra):
        extra.setdefault('is_staff', False)
        extra.setdefault('is_superuser', False)
        return self._create_user(email, first_name, last_name, password, **extra)

    def create_superuser(self, email, first_name, last_name, password, **extra):
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)

        if extra.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, first_name, last_name, password, **extra)


class PlanItUser(AbstractBaseUser, PermissionsMixin):
    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    email = models.EmailField('email address', unique=True)
    organizations = models.ManyToManyField('PlanItOrganization',
                                           related_name='users',
                                           blank=True)
    primary_organization = models.ForeignKey('PlanItOrganization', null=True, blank=True,
                                             on_delete=models.SET_NULL)

    objects = PlanItUserManager()

    # All fields below are copied from Django's AbstractUser
    first_name = models.CharField('first name', max_length=30)
    last_name = models.CharField('last name', max_length=150)
    is_staff = models.BooleanField(
        'staff status',
        default=False,
        help_text='Designates whether the user can log into this admin site.',
    )
    is_active = models.BooleanField(
        'active',
        default=True,
        help_text=(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )
    date_joined = models.DateTimeField('date joined', default=timezone.now)
    trial_end_notified = models.BooleanField(
        default=False,
        help_text=(
            'Indicates if the user has been notified about an upcoming trial expiration'
        )
    )

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def get_current_location(self):
        """Return the appropriate PlanItLocation for this user."""
        return self.primary_organization.location

    def has_required_fields(self):
        return all(getattr(self, attr, False) for attr in PlanItUser.REQUIRED_FIELDS)

    def send_registration_complete_email(self):
        context = {
            'url': settings.PLANIT_APP_HOME,
            'support_email': settings.SUPPORT_EMAIL
        }
        self.email_user('registration_complete_email', context)

    def email_user(self, template_prefix, context={}, from_email=settings.DEFAULT_FROM_EMAIL,
                   **kwargs):
        """Send an email to this user.

        Required method on user for use of django-registration.
        Signature modified here to support multi-part HTML email.
        """
        context.setdefault('user', self)
        send_html_email(template_prefix, from_email, [self.email], context=context, **kwargs)

    # All methods below copied from Django's AbstractUser
    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name


class CityProfile(models.Model):
    """

    If its necessary to add a new choices class here and surface the options via the API,
    be sure to add a new property to the data returned by users.views.CityProfileOptionsView.

    """
    class EconomicSector:
        CHOICES = (
            ('Mining', 'Mining',),
            ('Construction', 'Construction',),
            ('Manufacturing', 'Manufacturing',),
            ('Utilities', 'Utilities',),
            ('Wholesale trade', 'Wholesale trade',),
            ('Retail trade', 'Retail trade',),
            ('Transportation and warehousing', 'Transportation and warehousing',),
            ('Information', 'Information',),
            ('Financial activities', 'Financial activities',),
            ('Professional and business services', 'Professional and business services',),
            ('Educational services', 'Educational services',),
            ('Healthcare and social assistance', 'Healthcare and social assistance',),
            ('Leisure and hospitality', 'Leisure and hospitality',),
            ('Agriculture', 'Agriculture',),
            ('Forestry', 'Forestry',),
            ('Fishing and hunting', 'Fishing and hunting',),
            ('Other', 'Other',),
        )

    class CommitmentStatus:
        EXISTS = 'exists'
        IN_PROGRESS = 'inprogress'
        DOES_NOT_EXIST = 'doesnotexist'
        NO_PLANS = 'noplanstoundertake'
        DO_NOT_KNOW = 'donotknow'

        CHOICES = (
            (EXISTS, 'Currently exists',),
            (IN_PROGRESS, 'In progress',),
            (DOES_NOT_EXIST, 'Does not exist, but intend to undertake',),
            (NO_PLANS, 'Does not exist, no plans to undertake',),
            (DO_NOT_KNOW, 'Do not know',),
        )

    class SectionStatus:
        YES = 'yes'
        NOT_YET = 'notyet'
        IN_PROGRESS = 'inprogress'
        DO_NOT_KNOW = 'donotknow'

        CHOICES = (
            (YES, 'Yes',),
            (NOT_YET, 'Not yet',),
            (IN_PROGRESS, 'It’s in progress',),
            (DO_NOT_KNOW, 'I don’t know',),
        )

    class AssessmentSectionStatus:
        YES = 'yes'
        NO = 'no'
        DO_NOT_KNOW = 'donotknow'

        CHOICES = (
            (YES, 'Yes',),
            (NO, 'Not yet',),
            (DO_NOT_KNOW, 'I don’t know',),
        )

    class AssessedHazards:
        NONE = 'none'
        AT_LEAST_ONE = 'oneormore'
        MULTIPLE = 'multiple'
        MULTIPLE_AND_EFFECTS = 'multipleandeffects'

        CHOICES = (
            (NONE, 'None'),
            (AT_LEAST_ONE, 'At least one'),
            (MULTIPLE, 'Multiple hazards and their effect on our city'),
            (MULTIPLE_AND_EFFECTS, 'Multiple hazards, including how they might affect one another'),
        )

    class AssessmentNumbers:
        NONE = 'none'
        SOME = 'some'
        ALL = 'all'
        ALL_PLUS = 'allplus'

        CHOICES = (
            (NONE, 'None'),
            (SOME, 'Some'),
            (ALL, 'All'),
            (ALL_PLUS, 'All, including their interdependencies'),
        )

    class PlanType:
        STANDALONE = 'standalone'
        GENERAL = 'general'
        SECTOR = 'sector'
        COMBINED = 'combined'
        NONE_OF_THE_ABOVE = 'none'

        CHOICES = (
            (STANDALONE, 'Standalone adaptation plan'),
            (GENERAL, 'Included in a general city plan'),
            (SECTOR, 'Included in a city sector plan'),
            (COMBINED, 'Addressed in a combined adaptation and mitigation climate action plan'),
            (NONE_OF_THE_ABOVE, 'None of these'),
        )

    class ActionPriorities:
        COST_BENEFIT = 'cost_benefit'
        COST_EFFECTIVENESS = 'cost_effectiveness'
        MULTIPLE = 'multiple_criteria'
        CONSENSUS = 'consensus'
        EXPERIMENT = 'experiment'

        CHOICES = (
            (COST_BENEFIT, 'Benefit-cost analysis',),
            (COST_EFFECTIVENESS, 'Cost-effectiveness',),
            (MULTIPLE, 'Multiple-criteria decision analysis',),
            (CONSENSUS, 'Stakeholder consensus decision-making',),
            (EXPERIMENT, 'Experiment and observe',),
        )

    organization = AutoOneToOneField('users.PlanItOrganization', related_name='city_profile')

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    about_economic_sector = models.CharField(max_length=256, choices=EconomicSector.CHOICES,
                                             blank=True, default='')
    about_operational_budget_usd = models.PositiveIntegerField(blank=True, null=True)
    about_adaptation_status = models.CharField(max_length=256, choices=CommitmentStatus.CHOICES,
                                               blank=True, default='')
    about_commitment_status = models.CharField(max_length=256, choices=CommitmentStatus.CHOICES,
                                               blank=True, default='')
    about_mitigation_status = models.CharField(max_length=256, choices=CommitmentStatus.CHOICES,
                                               blank=True, default='')
    about_sustainability_description = models.TextField(blank=True, default='')
    about_sustainability_progress = models.TextField(blank=True, default='')
    about_master_planning = models.TextField(blank=True, default='')

    assessment_status = models.CharField(max_length=128, choices=AssessmentSectionStatus.CHOICES,
                                         blank=True, default='')
    assessment_hazards_considered = models.CharField(max_length=32, choices=AssessedHazards.CHOICES,
                                                     blank=True, default='')
    assessment_assets_considered = models.CharField(max_length=32,
                                                    choices=AssessmentNumbers.CHOICES,
                                                    blank=True, default='')
    assessment_populations_identified = models.CharField(max_length=32,
                                                         choices=AssessmentNumbers.CHOICES,
                                                         blank=True, default='')

    plan_status = models.CharField(max_length=128, choices=SectionStatus.CHOICES,
                                   blank=True, default='')
    plan_type = models.CharField(max_length=32, choices=PlanType.CHOICES, blank=True, default='')

    action_status = models.CharField(max_length=128, choices=SectionStatus.CHOICES,
                                     blank=True, default='')
    action_prioritized_description = models.TextField(blank=True, default='')
    # default=0 explicitly sets all flags to false
    action_prioritized = BitField(flags=ActionPriorities.CHOICES, default=0)
