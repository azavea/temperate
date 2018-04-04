import csv
import logging

from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point

import geopy

from planit_data.models import CommunitySystem, WeatherEvent, OrganizationRisk, OrganizationAction
from action_steps.models import ActionCategory
from users.models import PlanItOrganization, PlanItLocation

logger = logging.getLogger('planit_data')


def create_organizations(cities_file):
    """All cities are represented as bare bones organizations."""
    geo = geopy.geocoders.GoogleV3(domain='www.datasciencetoolkit.org', scheme='http',
                                   timeout=15)

    next(cities_file)  # skip headers
    city_reader = csv.reader(cities_file)

    logger.info('Creating organizations')
    org_count = 0
    for row in city_reader:
        stripped_row = (val.strip() for val in row)
        (city_name, state, is_coastal, lon, lat, date, plan_name, plan_hyperlink) = stripped_row
        if not date:
            date = None

        point = None
        try:
            point = Point([float(lon), float(lat)])
        except ValueError:
            logger.info('No coordinates for {}, trying to geocode'.format(city_name))

            try:
                location = geo.geocode('{}, {}'.format(city_name, state))
                point = Point([location.longitude, location.latitude])
            except geopy.exc.GeopyError as e:
                logger.warn('Geocoding error: {}'.format(e))

        # location info is essential, so skip cities that don't geocode
        if point is None:
            logger.info('Organization not created for {}'.format(city_name))
            continue

        temperate_location, c = PlanItLocation.objects.update_or_create(
            name=city_name,
            is_coastal=is_coastal,
            defaults={
                'point': point,
            })

        org, c = PlanItOrganization.objects.update_or_create(
            name=city_name,
            defaults={
                'plan_due_date': date,
                'plan_name': plan_name,
                'plan_hyperlink': plan_hyperlink,
                'location': temperate_location
            })
        if c:
            org_count += 1

    return org_count


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

    action_count = 0

    prev_org = None  # This is just to enable logging once per city rather than once per row
    for row in actions_reader:
        stripped_row = (val.strip() for val in row)
        (city_name, strategy, weather_event, community_system, category, impact) = stripped_row
        # We only care about a row if a weather event and/or community system are listed
        if weather_event or community_system:
            try:
                org = PlanItOrganization.objects.get(name=city_name)
                if org != prev_org:
                    logger.info('Processing risks and actions for {}'.format(org))
                    prev_org = org
            except ObjectDoesNotExist:
                logger.warn('No organization for {}, skipping'.format(city_name))
                continue

            events = WeatherEvent.objects.filter(name__in=weather_event.split(';'))
            systems = CommunitySystem.objects.filter(name__in=community_system.split(';'))
            row_risks = create_risks(org, events, systems)

            for risk in row_risks:
                action, c = OrganizationAction.objects.get_or_create(
                    organization_risk=risk,
                    name=strategy,
                    visibility=OrganizationAction.Visibility.PUBLIC)

                # Unable to bulk add categories as a list and ".add" doesn't prevent duplicates
                if c:
                    action_count += 1
                    category_names = [cat.title() for cat in category.split(';')]
                    categories = ActionCategory.objects.filter(name__in=category_names)
                    for cat in categories:
                        action.categories.add(cat.id.hex)

    return action_count


class Command(BaseCommand):
    """Used to import data from Missy's dataset.

    See main project README on where to get the appropriate version of the dataset.

    Usage similar to:
        ./scripts/manage ingest_missy_dataset <cities_csv> <strategies_csv>
    """

    help = 'imports suggested actions data from CSVs'

    def add_arguments(self, parser):
        parser.add_argument('cities_csv')
        parser.add_argument('actions_csv')

    def handle(self, *args, **options):
        with open(options['cities_csv']) as cities_file:
            org_count = create_organizations(cities_file)

        with open(options['actions_csv']) as actions_file:
            action_count = create_risks_and_actions(actions_file)

        logger.info('Ingest complete. Imported {} organizations and {} actions'.format(
            org_count, action_count))
