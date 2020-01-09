from django.core.management import call_command
from django.core.management.base import BaseCommand

from .update_fixtures import FIXTURES


class Command(BaseCommand):
    help = 'updates data from fixtures'

    def handle(self, *args, **options):
        for project, output_fixtures in FIXTURES.items():
            for filename, model_list in output_fixtures:
                call_command('loaddata', filename)
