import csv

from django.core.management.base import BaseCommand

from planit_data.models import CommunitySystem, WeatherEvent, DefaultRisk


class Command(BaseCommand):
    """Used to import data from https://docs.google.com/spreadsheets/d/1OIQaEE00E_QZDinKUT1z9BmwAzTiKFhO77q_NuICBGg/edit#gid=1638913143"""  # noqa

    help = 'imports default risks from a CSV'

    def add_arguments(self, parser):
        parser.add_argument('input_csv')

    def handle(self, *args, **options):
        with open(options['input_csv']) as csv_file:
            csv_reader = csv.reader(csv_file)
            for row in csv_reader:
                order, risk = row
                weather_event_name, community_system_name = risk.split(' on ', 1)
                community_system_name = community_system_name.capitalize()

                community_system, _ = CommunitySystem.objects \
                                                     .get_or_create(name=community_system_name)
                weather_event = WeatherEvent.objects.get(name=weather_event_name)

                DefaultRisk.objects.create(weather_event=weather_event,
                                           community_system=community_system, order=order)
