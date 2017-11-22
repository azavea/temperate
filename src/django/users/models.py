from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from django.core.mail import send_mail
from django.utils import timezone

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from climate_api.wrapper import make_token_api_request
from planit_data.models import GeoRegion, WeatherEventRank


class PlanItLocationManager(models.Manager):

    def from_api_city(self, api_city_id):
        location, created = PlanItLocation.objects.get_or_create(api_city_id=api_city_id)
        if created:
            city = make_token_api_request('/api/city/{}/'.format(api_city_id))
            location.name = city['properties']['name']
            location.point = GEOSGeometry(str(city['geometry']))
            location.is_coastal = city['properties']['is_coastal']
            location.save()
        return location


class PlanItLocation(models.Model):
    name = models.CharField(max_length=256, null=True, blank=True)
    api_city_id = models.IntegerField(null=True, blank=True)
    point = models.PointField(srid=4326, null=True, blank=True)
    is_coastal = models.BooleanField(default=False)

    objects = PlanItLocationManager()


class PlanItOrganization(models.Model):
    """Users belong to one or more organizations."""
    METRIC = 'METRIC'
    IMPERIAL = 'IMPERIAL'
    UNITS_CHOICES = ((IMPERIAL, 'imperial'),
                     (METRIC, 'metric'),)

    # created by data migration and assigned to users by default
    DEFAULT_ORGANIZATION = 'User Organization'

    name = models.CharField(max_length=256, blank=False, null=False, unique=True)
    units = models.CharField(max_length=16, choices=UNITS_CHOICES, default=IMPERIAL)
    location = models.ForeignKey(PlanItLocation, on_delete=models.SET_NULL, null=True, blank=True)
    weather_events = models.ManyToManyField('planit_data.WeatherEventRank')

    def __str__(self):
        return self.name

    def import_weather_events(self):
        georegion = GeoRegion.objects.get_for_point(self.location.point)
        weather_events = WeatherEventRank.objects.filter(georegion=georegion)

        if not self.location.is_coastal:
            # For cities not on the coast, exclude Weather Events that only apply to coastal areas
            weather_events = weather_events.filter(weather_event__coastal_only=False)

        # Use the many-to-many field's through model to bulk create the weather events this
        # organization should have by default
        ThroughModel = self.weather_events.through
        ThroughModel.objects.bulk_create(
            ThroughModel(planitorganization_id=self.id, weathereventrank_id=event.id)
            for event in weather_events
        )


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """Create auth token upon new user creation.

    Account access still requires email verification.
    """
    if created:
        Token.objects.create(user=instance)


class PlanItUserManager(BaseUserManager):
    """Custom user manager, based on Django's UserManager."""

    def _create_user(self, email, first_name, last_name, password, **extra):
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)
        user = PlanItUser(email=email, first_name=first_name, last_name=last_name, **extra)
        user.set_password(password)
        user.save()
        return user

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
                                           related_name='user_organizations')
    primary_organization = models.ForeignKey('PlanItOrganization', null=True, blank=True)

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

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)
