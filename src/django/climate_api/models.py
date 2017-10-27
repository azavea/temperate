import requests
import logging

from django.db import models
from django.conf import settings

from climate_api.utils import get_api_url

logger = logging.getLogger(__name__)


class APITokenManager(models.Manager):

    def refresh(self):
        data = [
            ('email', settings.CCAPI_EMAIL),
            ('password', settings.CCAPI_PASSWORD),
        ]

        # Get and set new token
        url = get_api_url('api-token-auth/refresh/')
        request = requests.post(url, data=data, verify=False)
        if request.status_code == 200:
            new_token = request.json()['token']
            APIToken.objects.all().delete()
            APIToken.objects.create(token=new_token)
            logger.debug('Token is now {}'.format(self.current()))
        else:
            logger.warn('Error refreshing token. {}: {}'.format(request.status_code,
                                                                request.reason))

    def current(self):
        """Return current token as a string."""
        token = APIToken.objects.first()
        if token is None:
            raise ValueError('No CC API token.')
        return token.token


class APIToken(models.Model):
    """Store active token(s) for access to Azavea's Climate API."""

    objects = APITokenManager()

    token = models.CharField(max_length=256, unique=True, blank=False, null=False)
