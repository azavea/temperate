import csv
import logging

from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError

from planit_data.models import CommunitySystem, WeatherEvent, DefaultRisk


logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    """Used to import data from https://docs.google.com/spreadsheets/d/1OIQaEE00E_QZDinKUT1z9BmwAzTiKFhO77q_NuICBGg/edit#gid=1638913143"""  # noqa

    help = 'imports default risks from a CSV'

    def add_arguments(self, parser):
        parser.add_argument('input_csv')

    def handle(self, *args, **options):
        with open(options['input_csv']) as csv_file:
            csv_reader = csv.reader(csv_file)
            for row in csv_reader:
                order = row[0]
                risk = row[1]
                if not order:
                    order = None

                weather_event_name, community_system_name = risk.split(' on ', 1)
                weather_event_name = weather_event_name.strip()
                community_system_name = community_system_name.strip().capitalize()

                community_system, _ = (CommunitySystem.objects
                                                      .get_or_create(name=community_system_name))
                weather_event, _ = (WeatherEvent.objects
                                                .get_or_create(name=weather_event_name))

                try:
                    DefaultRisk.objects.create(weather_event=weather_event,
                                               community_system=community_system, order=order)
                except IntegrityError:
                    logger.warning('Failed to create DefaultRisk for: {} on {}'.format(
                        weather_event_name,
                        community_system_name
                    ))
