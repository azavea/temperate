import logging

from django.core.management.base import BaseCommand

from users.models import PlanItLocation
from planit_data.models import GeoRegion

logger = logging.getLogger('users')


class Command(BaseCommand):

    help = 'updates all PlanItLocations to foreign key to their GeoRegion'

    def handle(self, *args, **options):
        logger.info("Populating locations...")
        for georegion in GeoRegion.objects.all():
            logger.info("Updating georegion {}".format(georegion.name))
            count = PlanItLocation.objects.filter(
                georegion__isnull=True,
                point__contained=georegion.geom
            ).update(georegion=georegion)
            logger.info("Changed {} PlanItLocation objects".format(count))
        logger.info("Done!")
