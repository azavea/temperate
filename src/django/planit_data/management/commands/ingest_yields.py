import csv
import logging
from os import path

from django.conf import settings
from django.core.management.base import BaseCommand

from planit_data.models import ClimateAssessmentRegion


logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    """Used to import yield data from EPA Climate Damage exports"""

    help = 'Used to import data from EPA Climate Damage exports'

    def handle(self, *args, **options):
        crops = ['barley', 'corn', 'cotton', 'hay', 'potato', 'rice', 'sorghum',
                 'soybean', 'wheat']
        indicators = [crop + '_yields' for crop in crops]
        regions = {region.name: region for region in ClimateAssessmentRegion.objects.all()}

        for indicator in indicators:
            csv_path = path.join(settings.BASE_DIR, 'planit_data', 'data', indicator + '.csv')

            with open(csv_path) as csv_file:
                csv_rows = list(csv.DictReader(csv_file, delimiter='\t'))

            for row in csv_rows:
                region_name = row['region']
                if region_name == 'SouthernGreatPlains':
                    region_name = 'Southern Great Plains'
                elif region_name == 'NorthernGreatPlains':
                    region_name = 'Northern Great Plains'
                years = [str(year) for year in range(2005, 2120, 5)]
                values = {year: float(row[year]) for year in years}
                regions[region_name].indicators[indicator] = values

        for region in regions.values():
            region.save()
