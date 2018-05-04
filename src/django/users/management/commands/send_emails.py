import datetime
import logging

from django.core.management.base import BaseCommand

from users.notifications import send_trial_end_notifications

logger = logging.getLogger('users')


class Command(BaseCommand):

    help = 'sends emails notifying users their trials are ending soon'

    def handle(self, *args, **options):
        logger.info("Notifying users...")

        send_trial_end_notifications(threshold_days=5)

        logger.info("Done!")
