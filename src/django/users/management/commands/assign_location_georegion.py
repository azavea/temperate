import sys
import logging

from django.core.management.base import BaseCommand
from django.db.models import F

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
                point__intersects=georegion.geom
            ).update(georegion=georegion)
            logger.info("Changed {} PlanItLocation objects".format(count))

        unmapped_locations = PlanItLocation.objects.all().exclude(
            georegion__isnull=False,
            point__intersects=F('georegion__geom'))
        # Use len() instead of .exists() because they're equivalent in the happy case, and len()
        # is one fewer query in the bad case.
        if len(unmapped_locations):
            logger.error('Incorrectly mapped locations found!')
            for location in unmapped_locations:
                logger.info("{name} (Currently mapped with {mapped})".format(
                    name=str(location),
                    mapped=str(location.georegion)
                ))
            logger.error("Updating location georegions failed")
            sys.exit(1)

        logger.info("Done!")
