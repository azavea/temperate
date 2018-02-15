from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from planit_data.models import (
    CommunitySystem,
    OrganizationRisk
)


@receiver(post_save, sender='planit_data.OrganizationWeatherEvent')
def create_risks_for_org_weather_event(sender, **kwargs):
    """Create new OrgRisk community system <> weather event mappings if none exist."""
    created = kwargs.get('created', False)
    org_event = kwargs.get('instance', None)
    if created and org_event is not None:
        risks = OrganizationRisk.objects.filter(organization=org_event.organization,
                                                weather_event=org_event.weather_event)
        if risks.count() == 0:
            # TODO (#489): Replace random selection below with the list of community systems
            #              attached to the organization
            community_systems = CommunitySystem.objects.all()[:2]
            with transaction.atomic():
                org_risks = [OrganizationRisk(organization=org_event.organization,
                                              weather_event=org_event.weather_event,
                                              community_system=community_system)
                             for community_system in community_systems]
                OrganizationRisk.objects.bulk_create(org_risks)
