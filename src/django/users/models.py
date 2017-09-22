from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.gis.db import models
from django.core.mail import send_mail
from django.db.models import CASCADE
from django.utils import timezone

from planit_data.models import (CommunitySystem,
                                Indicator,
                                WeatherEvent)


class PlanItUserManager(BaseUserManager):
    """Custom user manager, based on Django's UserManager"""

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

    objects = PlanItUserManager()

    # All fields below are copied from Django's AbstractUser
    first_name = models.CharField('first name', max_length=30, blank=True)
    last_name = models.CharField('last name', max_length=150, blank=True)
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

    # All methods below copied from Django's AbstractUser
    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)


class UserLocation(models.Model):
    geom = models.MultiPolygonField()
    user = models.ForeignKey(PlanItUser, on_delete=CASCADE, null=False)


class UserRisk(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)
    notes = models.TextField(null=False, blank=True, default='')
    location = models.ForeignKey(UserLocation, on_delete=CASCADE, null=False)
    community_system = models.ForeignKey(CommunitySystem, on_delete=CASCADE, null=False)
    weather_event = models.ForeignKey(WeatherEvent, on_delete=CASCADE, null=False)
    indicator = models.ForeignKey(Indicator, on_delete=CASCADE, null=False)
