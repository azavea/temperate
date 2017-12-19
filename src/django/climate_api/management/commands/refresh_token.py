import logging

from django.core.management.base import BaseCommand

from climate_api.models import APIToken

logger = logging.getLogger('climate_api')


class Command(BaseCommand):

    help = 'refreshes and saves a CC API token via management cmd'

    def handle(self, *args, **options):
        logger.info("Starting refresh...")
        try:
            token = APIToken.objects.refresh()
            logger.info('Token is now {}'.format(token.token))
        except Exception:
            logger.exception('Error refreshing token')
