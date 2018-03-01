import logging

from datetime import timedelta

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.utils import timezone

from rest_framework.authtoken.models import Token

from climate_api.wrapper import make_token_api_request
from planit_data.models import (
    CommunitySystem,
    DefaultRisk,
    GeoRegion,
    OrganizationRisk,
    OrganizationWeatherEvent,
    WeatherEventRank,
)
from planit_data.utils import apportion_counts


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
        HOURLY = 'hourly'
        CUSTOM = 'custom'

        CHOICES = (
            (FREE_TRIAL, 'Free Trial',),
            (BASIC, 'Basic',),
            (REVIEW, 'Review',),
            (INSIGHTS, 'Insights',),
            (GUIDANCE, 'Guidance',),
            (HOURLY, 'Pay as you go',),
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
    subscription_end_date = models.DateTimeField(null=True, blank=True)
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

        # Divide the number to add as evenly as possible across all weather events
        for weather_event, count in apportion_counts(weather_event_ids, num_to_add):
            logger.debug("Importing {} Risks for {}".format(count, weather_event))
            community_systems = self._get_sample_community_systems(weather_event, count)

            OrganizationRisk.objects.bulk_create(
                OrganizationRisk(organization=self, weather_event_id=weather_event,
                                 community_system_id=community_system)
                for community_system in community_systems
            )

    def _get_sample_community_systems(self, weather_event, count):
        """Produce count number of community systems for weather event based on priority rules."""
        def short_circuit_queryset_sequence(count, querysets):
            """Convert a series of querysets into a single sequence of values, stopping at count.

            Uses array slicing so Django can limit database queries to only potentially needed
            results.
            """
            for qs in querysets:
                if count <= 0:
                    return
                result = list(qs[:count])
                count -= len(result)
                yield from result

        return short_circuit_queryset_sequence(count, [
            # Start with any of the user's community systems
            self.community_systems.values_list('id', flat=True),

            # If we want more values, prioritize non-preferred DefaultRisks
            DefaultRisk.objects.filter(
                weather_event=weather_event
            ).exclude(
                community_system__organizations__id=self.id
            ).values_list('community_system_id', flat=True).order_by('order'),

            # If there aren't enough organization Community Systems or DefaultRisks for this Weather
            # Event, use remaining Community Systems to pad out.
            # This is necessary since if the user picks no Community Systems and the Weather Event
            # has no Default Risks, it'll be perpetually empty and inflate the counts for other
            # Weather Events.
            CommunitySystem.objects.exclude(
                defaultrisk__weather_event=weather_event
            ).exclude(
                organizations__id=self.id
            ).values_list('id', flat=True)
        ])

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
                                           related_name='users')
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
            'user': self,
            'url': settings.PLANIT_APP_HOME,
            'support_email': settings.SUPPORT_EMAIL
        }
        self.email_user('registration_complete_email', context)

    def email_user(self, template_prefix, context={}, from_email=settings.DEFAULT_FROM_EMAIL):
        """Send an email to this user.

        Required method on user for use of django-registration.
        Signature modified here to support multi-part HTML email.
        Only used by django-registration to send activation email, which we override.

        `template_prefix` is the path and start of file name for the three email templates.
        For example, the template_prefix 'greetings/hello_world' would look for an email
        subject template at 'users/templates/greetings/hello_world_subject.txt',
        a text email template at 'users/templates/greetings/hello_world.txt', and
        an HTML email template at 'users/templates/greetings/hello_world_subject.html'.
        """
        subject = render_to_string(template_prefix + "_subject.txt", context)
        # Force subject to a single line to avoid header-injection issues.
        subject = ''.join(subject.splitlines())
        message_text = render_to_string(template_prefix + ".txt", context)
        message_html = render_to_string(template_prefix + ".html", context)
        msg = EmailMultiAlternatives(subject, message_text, from_email, [self.email])
        msg.attach_alternative(message_html, "text/html")
        msg.send()

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
