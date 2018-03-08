from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender='planit_data.OrganizationWeatherEvent')
def create_risks_for_org_weather_event(sender, **kwargs):
    """Create new OrgRisk community system <> weather event mappings if none exist."""
    created = kwargs.get('created', False)
    org_event = kwargs.get('instance', None)
    if created and org_event is not None:
        org_event.organization.import_risks()
