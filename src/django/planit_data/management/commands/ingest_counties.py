import csv
import json
import logging
from os import path

from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry
from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError

from planit_data.models import County


logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    """Used to import geometries for US counties"""

    help = 'Used to import geometries for US counties from GeoJSON'

    def handle(self, *args, **options):
        counties_json = path.join(settings.BASE_DIR, 'planit_data', 'data', 'counties.geojson')
        with open(counties_json) as f:
            data = json.load(f)
            for feature in data['features']:
                County.objects.update_or_create(
                    name=feature['properties']['NAME'],
                    state_fips=feature['properties']['STATEFP'],
                    geoid=feature['properties']['GEOID'],
                    defaults={'geom': GEOSGeometry(json.dumps(feature['geometry']))},
                )
