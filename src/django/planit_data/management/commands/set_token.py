import logging

import boto3
import os
import requests
import json
import re

from django.core.management.base import BaseCommand

from planit_data.models import APIToken

logger = logging.getLogger(__name__)

TFVARS_BUCKET = 'staging-us-east-1-climate-config'
TFVARS_KEY = 'terraform/planit/terraform.tfvars'
REGEX_EMAIL = 'CCAPI_email = "(.*?)\"'
REGEX_PASSWORD = 'CCAPI_password = "(.*?)\"'


class Command(BaseCommand):
    """Requires connection to the Azavea IP."""

    help = 'refreshes and saves a CC API token'

    def handle(self, *args, **options):
        client = boto3.client('s3')
        response = client.get_object(Bucket=TFVARS_BUCKET, Key=TFVARS_KEY)
        byte_data = response['Body'].read()

        match = re.search(REGEX_EMAIL, str(byte_data))
        email = match.groups(1)[0]

        match = re.search(REGEX_PASSWORD, str(byte_data))
        password = match.groups(1)[0]

        environment = os.getenv('DJANGO_ENV')
        if environment == 'production':
            url = 'https://app.climate.azavea.com'
        elif environment == 'development' or environment == 'staging':
            url = 'https://app.staging.climate.azavea.com'

        # Change to personal info to test against your account
        data = [
            ('email', email),  # test@azavea.com
            ('password', password),  # testtest
        ]

        # Get and set new token
        request = requests.post(url + '/api-refresh-token-auth/', data=data, verify=False)
        if request.status_code == 200:
            new_token = json.loads(request.text)['token']
            APIToken.objects.all().delete()
            APIToken.objects.create(token=new_token)
        else:
            print('Error refreshing token. {}: {}'.format(request.status_code, request.reason))
