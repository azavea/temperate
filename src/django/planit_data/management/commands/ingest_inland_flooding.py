from collections import defaultdict
import csv
import logging
from os import path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError

from planit_data.models import ClimateAssessmentRegion


logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    """Used to import inland flooding data from EPA Climate Damage exports"""

    help = 'Used to import data from EPA Climate Damage exports'

    def handle(self, *args, **options):
        regions = {region.name: region for region in ClimateAssessmentRegion.objects.all()}

        csv_path = path.join(settings.BASE_DIR, 'planit_data', 'data',
                             'inland_flooding_annual_damages.csv')

        with open(csv_path) as csv_file:
            csv_rows = list(csv.DictReader(csv_file))

        region_values = defaultdict(dict)
        for row in csv_rows:
            year = row['Year']
            for region_name in regions.keys():
                if region_name in row:
                    region_values[region_name][year] = float(row[region_name])

        for region in regions.values():
            if region.name in region_values:
                region.indicators['inland_flooding_annual_damages'] = region_values[region.name]
                region.save()
