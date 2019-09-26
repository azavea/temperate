from collections import defaultdict
import csv
import logging
from os import path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError

from planit_data.models import County


logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    """Used to import coastal flooding data from EPA CLimate Damage CSV exports"""

    help = 'Used to import coastal flooding data from EPA CLimate Damage CSV exports'

    def handle(self, *args, **options):
        indicators = ['coastal_property_damage_adaptation',
                      'coastal_property_damage_no_adaptation']

        for indicator in indicators:
            csv_path = path.join(settings.BASE_DIR, 'planit_data', 'data',
                                indicator + '.csv')

            with open(csv_path) as csv_file:
                csv_rows = list(csv.DictReader(csv_file))

            county_values = defaultdict(dict)
            for row in csv_rows:
                geoid = row['County FIPS']
                years = [str(year) for year in range(2000, 2101)]
                # Values are in millions of dollars, convert to dollars
                values = {year: float(row[year]) * 1000000 for year in years}

                county = County.objects.get(geoid=geoid)
                county.indicators[indicator] = values
                county.save()
