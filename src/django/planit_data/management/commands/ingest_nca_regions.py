import json
import logging
from os import path

from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon
from django.core.management.base import BaseCommand

from planit_data.models import ClimateAssessmentRegion


logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    """Used to import geometries for NCA regions"""

    help = """Used to import geometries for states from GeoJSON.
    State geometries are used to construct the regions used by the National Climate Assessment."""

    def handle(self, *args, **options):
        states_json = path.join(settings.BASE_DIR, 'planit_data', 'data', 'states.geojson')

        ClimateAssessmentRegion.objects.all().delete()
        with open(states_json) as f:
            data = json.load(f)
            for feature in data['features']:
                region_name = feature['properties']['region']
                geom = GEOSGeometry(json.dumps(feature['geometry']))
                try:
                    nca_region = ClimateAssessmentRegion.objects.get(name=region_name)
                    merged_geom = nca_region.geom.union(geom)
                    if merged_geom.geom_type == 'Polygon':
                        merged_geom = MultiPolygon(merged_geom)
                    nca_region.geom = merged_geom
                    nca_region.save()
                except ClimateAssessmentRegion.DoesNotExist:
                    ClimateAssessmentRegion.objects.create(name=region_name, geom=geom)
