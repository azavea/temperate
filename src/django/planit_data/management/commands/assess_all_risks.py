from random import choice
import logging

from django.core.management.base import BaseCommand
from django.conf import settings

from planit_data.models import OrganizationRisk

FIELDS = [
    "probability",
    "frequency",
    "intensity",
    "impact_magnitude",
    "adaptive_capacity"
]

logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    help = """Helper command to populate all unassessed risks with random values
    - Note this cannot be reversed"""

    def handle(self, *args, **options):
        if settings.ENVIRONMENT != 'Development':
            logger.error('This action is blocked from running on staging or production')
            exit()

        unassessed_risks = OrganizationRisk.objects.filter(**{
            field: '' for field in FIELDS
        })

        assessed_count = 0
        for risk in unassessed_risks.iterator():
            for field in FIELDS:
                if not getattr(risk, field):
                    options = risk._meta.get_field(field).choices
                    selection = choice(options)[0]
                    logger.debug("Setting <{}>.{} to {}".format(risk, field, selection))
                    setattr(risk, field, selection)
            risk.save()
            assessed_count += 1

        logger.info("Assessed {} risks".format(assessed_count))
