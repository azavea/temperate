from collections import defaultdict
import csv
import logging
from os import path

from django.conf import settings
from django.core.management.base import BaseCommand

from planit_data.models import County


logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    """Used to import data from CDC NEPHT CSV exports"""

    help = 'Used to import data from CDC NEPHT CSV exports'

    def handle(self, *args, **options):
        counties = County.objects.all()
        indicators = ['asthma_er_visits', 'drought_duration',
                      'extreme_precipitation_days', 'fema_floodzone_population']

        for indicator in indicators:
            csv_path = path.join(settings.BASE_DIR, 'planit_data', 'data',
                                 indicator + '.csv')

            with open(csv_path) as csv_file:
                csv_rows = list(csv.DictReader(csv_file))

            county_values = defaultdict(dict)
            for row in csv_rows:
                geoid = row['countyFIPS']
                year = row['Year']
                # Need to remove formatting from some values
                value = float(row['Value'].replace(',', ''))
                # Not every export has FIPS codes with the correct leading 0
                geoid = geoid.zfill(5)
                county_values[geoid][year] = value

            is_baseline = all(len(yearly_values) == 1
                              for yearly_values in county_values.values())
            # For baseline layers we don't need the year, only the value,
            # and can flatten the list
            if is_baseline:
                county_values = {geoid: yearly_values.popitem()[1]
                                 for geoid, yearly_values in county_values.items()}
            for county in counties:
                if county.geoid in county_values:
                    county.indicators[indicator] = county_values[county.geoid]
                elif indicator in county.indicators:
                    del county.indicators[indicator]

        for country in counties:
            country.save()
