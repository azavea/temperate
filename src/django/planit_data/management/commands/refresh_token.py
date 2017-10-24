import logging

import requests
import json

from django.conf import settings
from django.core.management.base import BaseCommand

from planit_data.models import APIToken

logger = logging.getLogger(__name__)


class Command(BaseCommand):

    help = 'refreshes and saves a CC API token'

    def handle(self, *args, **options):
        environment = settings.ENVIRONMENT.lower()
        if environment == 'production':
            url = 'https://app.climate.azavea.com'
        elif environment == 'development' or environment == 'staging':
            url = 'https://app.staging.climate.azavea.com'

        data = [
            ('email', settings.CCAPI_EMAIL),
            ('password', settings.CCAPI_PASSWORD),
        ]

        # Get and set new token
        request = requests.post(url + '/api-token-auth/refresh/', data=data, verify=False)
        if request.status_code == 200:
            new_token = json.loads(request.text)['token']
            APIToken.objects.all().delete()
            APIToken.objects.create(token=new_token)
            logger.debug('Token is now {}'.format(APIToken.objects.all()[0].token))
        else:
            logger.debug('Error refreshing token. {}: {}'.format(request.status_code,
                                                                 request.reason))
