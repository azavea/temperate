from random import choice
import logging

from django.core.management.base import BaseCommand
from django.conf import settings

from planit_data.models import OrganizationRisk, OrganizationWeatherEvent

HAZARD_FIELDS = [
    "probability",
    "frequency",
    "intensity",
]
RISK_FIELDS = [
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
            field: '' for field in RISK_FIELDS
        })

        assessed_count = 0
        for risk in unassessed_risks.iterator():
            for field in RISK_FIELDS:
                if not getattr(risk, field):
                    options = risk._meta.get_field(field).choices
                    selection = choice(options)[0]
                    logger.debug("Setting <{}>.{} to {}".format(risk, field, selection))
                    setattr(risk, field, selection)
            risk.save()
            assessed_count += 1

        logger.info("Assessed {} risks".format(assessed_count))

        unassessed_hazards = OrganizationWeatherEvent.objects.filter(**{
            field: '' for field in HAZARD_FIELDS
        })

        assessed_count = 0
        for hazard in unassessed_hazards.iterator():
            for field in HAZARD_FIELDS:
                if not getattr(hazard, field):
                    options = hazard._meta.get_field(field).choices
                    selection = choice(options)[0]
                    logger.debug("Setting <{}>.{} to {}".format(hazard, field, selection))
                    setattr(hazard, field, selection)
            hazard.save()
            assessed_count += 1

        logger.info("Assessed {} hazards".format(assessed_count))
