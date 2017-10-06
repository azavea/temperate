"""
Django settings for planit project.

Generated by 'django-admin startproject' using Django 1.11.5.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os
import requests

from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'secret')

# Set environment
ENVIRONMENT = os.getenv('DJANGO_ENV', 'Development')
VALID_ENVIRONMENTS = ('Production', 'Staging', 'Development')
if ENVIRONMENT not in VALID_ENVIRONMENTS:
    raise ImproperlyConfigured('Invalid ENVIRONMENT provided, must be one of {}'
                               .format(VALID_ENVIRONMENTS))

LOGLEVEL = os.getenv('DJANGO_LOG_LEVEL', 'INFO')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = (ENVIRONMENT == 'Development')

# Set ALLOWED_HOSTS
ALLOWED_HOSTS = [
    '.climate.azavea.com',
    '.elb.amazonaws.com',
    'localhost'
]

if ENVIRONMENT in ['Production', 'Staging']:
    # Within EC2, the Elastic Load Balancer HTTP health check will use the
    # target instance's private IP address for the Host header.
    #
    # The following steps lookup the current instance's private IP address
    # (via the EC2 instance metadata URL) and add it to the Django
    # ALLOWED_HOSTS configuration so that health checks pass.
    response = requests.get('http://169.254.169.254/latest/meta-data/local-ipv4')  # NOQA
    if response.ok:
        ALLOWED_HOSTS.append(response.text)
    else:
        raise ImproperlyConfigured('Unable to fetch instance metadata')

# Health checks

WATCHMAN_ERROR_CODE = 503
WATCHMAN_CHECKS = (
    'watchman.checks.databases',
)

# Application definition

INSTALLED_APPS = [
    # prioritized to override django core
    'users',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3rd party apps
    'django_extensions',
    'django.contrib.gis',
    'watchman',
    'rest_framework',
    'rest_framework.authtoken',
    'bootstrap3',

    # local apps
    'planit_data',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'rollbar.contrib.django.middleware.RollbarNotifierMiddleware',
]

# Django Debug Toolbar
if DEBUG:
    INSTALLED_APPS += [
        'debug_toolbar',
    ]
    INTERNAL_IPS = [
        '10.0.2.2',
        '0.0.0.0',
        '127.0.0.1',
        'localhost',
    ]

if not DEBUG:
    ROLLBAR = {
        'access_token': os.getenv('ROLLBAR_SERVER_SIDE_ACCESS_TOKEN'),
        'environment': ENVIRONMENT,
        'root': os.getcwd()
    }

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'PAGE_SIZE': 20,
}

ROOT_URLCONF = 'planit.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'planit.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('POSTGRES_HOST'),
        'PORT': os.getenv('POSTGRES_PORT')
    },
}

POSTGIS_VERSION = os.getenv('PG_VERSION')


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',  # NOQA
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',  # NOQA
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',  # NOQA
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',  # NOQA
    },
]

# Django-Registration
ACCOUNT_ACTIVATION_DAYS = 14
REGISTRATION_OPEN = True
AUTH_PROFILE_MODULE = 'registration.RegistrationProfile'

if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django_amazon_ses.backends.boto.EmailBackend'
DEFAULT_FROM_EMAIL = os.getenv('CC_FROM_EMAIL', 'noreply@climate.azavea.com')
DEFAULT_TO_EMAIL = os.getenv('CC_TO_EMAIL', 'climate@azavea.com')
COMPANY_DOMAIN = '@azavea.com'


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/
STATIC_URL = '/static/'
STATIC_ROOT = '/static/'


AUTH_USER_MODEL = 'users.PlanItUser'

# LOGGING CONFIGURATION
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': LOGLEVEL
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'propagate': True,
        }
    }
}
