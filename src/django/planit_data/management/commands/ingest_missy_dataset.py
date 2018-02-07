import csv
import logging

from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry


from geopy.geocoders import GoogleV3

from planit_data.models import CommunitySystem, WeatherEvent, OrganizationRisk, OrganizationAction
from action_steps.models import ActionCategory
from users.models import PlanItOrganization, PlanItLocation

logger = logging.getLogger('planit_data')


def create_organizations(cities_file):
    """All cities are represented as bare bones organizations."""
    next(cities_file)  # skip headers
    geo = GoogleV3()
    city_reader = csv.reader(cities_file)

    for row in city_reader:
        date = row[3] or None

        # location info is essential, so skip cities that don't geocode
        try:
            location = geo.geocode('{} {}'.format(row[0], row[1]))
            point = {"type": 'Point',
                     "coordinates": [location.longitude, location.latitude]}
            formatted_point = GEOSGeometry(str(point))

            temperate_location, c = PlanItLocation.objects.get_or_create(point=formatted_point,
                                                                         name=row[0],
                                                                         is_coastal=row[2])
        except Exception:
            continue

        org, c = PlanItOrganization.objects.update_or_create(name=row[0],
                                                             defaults={
                                                             'plan_due_date': date,
                                                             'plan_name': row[4],
                                                             'plan_hyperlink': row[5],
                                                             'location': temperate_location
                                                             })


def create_risks(org, events, systems):
    """A valid risk needs at minumum either a weather event or community system."""
    risks = []
    for event in events:
        if systems:
            for system in systems:
                risk, c = OrganizationRisk.objects.get_or_create(organization=org,
                                                                 community_system=system,
                                                                 weather_event=event)
                risks.append(risk)
        else:
            risk, c = OrganizationRisk.objects.get_or_create(organization=org,
                                                             weather_event=event,
                                                             community_system__isnull=True)
            risks.append(risk)
    if len(events) == 0:
        for system in systems:
            risk, c = OrganizationRisk.objects.get_or_create(organization=org,
                                                             community_system=system,
                                                             weather_event__isnull=True)
            risks.append(risk)

    return risks


def create_risks_and_actions(actions_file):
    """Create an action for each associated risk combination."""
    next(actions_file)  # skip headers
    actions_reader = csv.reader(actions_file)

    for row in actions_reader:
        # We only care about a row if a weather event and/or community system are listed
        if row[2] or row[3]:
            try:
                org = PlanItOrganization.objects.get(name=row[0])
            except ObjectDoesNotExist:
                logger.info('No organization for {}, skipping'.format(row[0]))
                continue

            logger.info('Creating risks for {}'.format(org))
            events = WeatherEvent.objects.filter(name__in=row[2].split(';'))
            systems = CommunitySystem.objects.filter(name__in=row[3].split(';'))
            row_risks = create_risks(org, events, systems)

            logger.info('Creating actions for {}'.format(org))
            for risk in row_risks:
                action, c = OrganizationAction.objects.get_or_create(
                    organization_risk=risk,
                    name=row[1],
                    visibility=OrganizationAction.Visibility.PUBLIC)

                # Unable to bulk add categories and ".add" doesn't prevent duplicates
                if c:
                    category_names = [cat.title() for cat in row[4].split(';')]
                    categories = ActionCategory.objects.filter(name__in=category_names)
                    for cat in categories:
                        action.categories.add(cat.id.hex)


class Command(BaseCommand):
    """Used to import data from Missy's dataset.

    city csv:
    docs.google.com/spreadsheets/d/1ryNBsNDQ7Nc7mIpIZl0PLbT4kLzMd3yKW6LFz3xsYAI/edit#gid=489883855
    actions csv:
    docs.google.com/spreadsheets/d/1ryNBsNDQ7Nc7mIpIZl0PLbT4kLzMd3yKW6LFz3xsYAI/edit#gid=1370719142
    """

    help = 'imports default from a CSV'

    def add_arguments(self, parser):
        parser.add_argument('cities_csv')
        parser.add_argument('actions_csv')

    def handle(self, *args, **options):
        with open(options['cities_csv']) as cities_file:
            create_organizations(cities_file)

        with open(options['actions_csv']) as actions_file:
            create_risks_and_actions(actions_file)
