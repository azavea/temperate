from django.core.management.base import BaseCommand

from planit_data.models import APIToken


class Command(BaseCommand):

    help = 'refreshes and saves a CC API token via management cmd'

    def handle(self, *args, **options):
        APIToken.objects.refresh()
