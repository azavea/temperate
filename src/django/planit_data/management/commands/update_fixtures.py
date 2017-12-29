import os

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.conf import settings

FIXTURES = [
    # Organized (filename, model_list)
    ('communitysystems.json', ['planit_data.communitysystem']),
    ('concerns.json', ['planit_data.concern']),
    ('defaultrisks.json', ['planit_data.defaultrisk']),
    ('georegions.json', ['planit_data.georegion']),
    ('indicators.json', ['planit_data.indicator']),
    ('weathereventrank.json', ['planit_data.weathereventrank']),
    ('weatherevents.json', ['planit_data.weatherevent'])
]


class Command(BaseCommand):
    help = 'dumps base data to fixtures'

    def handle(self, *args, **options):
        for filename, model_list in FIXTURES:
            output_path = os.path.join(settings.BASE_DIR, 'planit_data', 'fixtures', filename)
            call_command(
                'dumpdata',
                *model_list,
                output=output_path,
                indent=4,
                natural_foreign=True,
                natural_primary=True
            )
