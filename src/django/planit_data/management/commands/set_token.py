import logging

import boto3
import os
import requests
import json

from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)

TFVARS_BUCKET = 'staging-us-east-1-climate-config'
TFVARS_KEY = 'terraform/planit/terraform.tfvars'


class Command(BaseCommand):

    help = 'refreshes and saves a CC API token'

    def handle(self, *args, **options):
        client = boto3.client('s3')
        import ipdb;ipdb.set_trace()
        response = client.get_object(Bucket=TFVARS_BUCKET,Key=TFVARS_KEY)
        byte_data = response['Body'].read()
        #json_data = json.loads(byte_data.decode(encoding='utf-8'))

        environment = os.getenv('DJANGO_ENV')
        if environment == 'development':
            URL = 'https://app.staging.climate.azavea.com'#'http://localhost:8080'
        elif environment == 'production':
            URL = 'https://app.climate.azavea.com'
        elif environment == 'staging':
            URL = 'https://app.staging.climate.azavea.com'
        else:
            logger.info('Did not update API token')
            return

        print (environment, URL)

        data = [
            ('email', 'jfung@azavea.com'),
            ('password', 'adminadmin'),
        ]
        # Get token
        request = requests.post(URL + '/api-token-auth/', data=data, verify=False)
        current_token = json.loads(request.text)['token']

        header = {'Authorization': 'Token ' + current_token}
        request2 = requests.post(URL + '/accounts/api/new_token/', headers=header, verify=False)
        import ipdb;ipdb.set_trace()
        print (request2)
