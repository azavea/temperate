import csv
import logging
from itertools import groupby
from collections import namedtuple

from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from django.db import transaction

from omgeo import Geocoder
from omgeo.places import PlaceQuery
from omgeo.postprocessors import AttrFilter
from omgeo.services import EsriWGS
import us

from planit_data.models import (
    GeoRegion,
    CommunitySystem,
    WeatherEvent,
    OrganizationRisk,
    OrganizationAction
)
from action_steps.models import ActionCategory
from users.models import PlanItOrganization, PlanItLocation

logger = logging.getLogger('planit_data')


def create_organizations(cities_file, esri_client_id=None, esri_secret=None):
    """All cities are represented as bare bones organizations."""

    states_dict = {s.name.lower(): s.abbr for s in us.STATES_AND_TERRITORIES}

    if esri_client_id and esri_secret:
        postprocessors = [AttrFilter(['Locality'], 'locator_type')]
        postprocessors += EsriWGS.DEFAULT_POSTPROCESSORS[1:]
        geocoder = Geocoder([('omgeo.services.EsriWGS', {
            'postprocessors': postprocessors,
            'settings': {
                'client_id': esri_client_id,
                'client_secret': esri_secret,
            }
        })])
    else:
        geocoder = None

    next(cities_file)  # skip headers
    city_reader = csv.reader(cities_file)

    logger.info('Creating organizations')
    org_count = 0
    for row in city_reader:
        stripped_row = (val.strip() for val in row)
        (city_name, state, is_coastal, lon, lat, date, plan_name, plan_hyperlink) = stripped_row
        state_abbr = states_dict[state.lower()]
        if not date:
            date = None

        point = None
        try:
            point = Point([float(lon), float(lat)])
        except ValueError:
            logger.info('No coordinates for {}, trying to geocode'.format(city_name))

            if geocoder is None:
                logger.warn('No geocoder. Please supply Esri client ID and secret.')
            else:
                try:
                    pq = PlaceQuery('{}, {}'.format(city_name, state_abbr), for_storage=True)
                    location = geocoder.get_candidates(pq)[0]
                    point = Point([location.x, location.y])
                except Exception as e:
                    logger.warn('Geocoding error: {}'.format(e))

        # location info is essential, so skip cities that don't geocode
        if point is None:
            logger.info('Organization not created for {}'.format(city_name))
            continue

        georegion = GeoRegion.objects.get_for_point(point)

        # We need locations because Orgs need them and risks and actions need Orgs,
        # but we want these to be independent from the actual cities loaded from the API,
        # so we'll only get ones that have a `source` set to `MISSY_IMPORTER`.
        try:
            org = PlanItOrganization.objects.get(name=city_name,
                                                 source=PlanItOrganization.Source.MISSY_IMPORTER)
            org.plan_due_date = date
            org.plan_name = plan_name
            org.plan_hyperlink = plan_hyperlink
            org.save()
        except PlanItOrganization.DoesNotExist:
            location, _ = PlanItLocation.objects.get_or_create(
                name=city_name,
                admin=state_abbr,
                api_city_id=None,
                defaults={
                    'point': point,
                    'is_coastal': is_coastal,
                    'georegion': georegion,
                })
            org = PlanItOrganization.objects.create(
                name=city_name,
                location=location,
                source=PlanItOrganization.Source.MISSY_IMPORTER,
                plan_due_date=date,
                plan_name=plan_name,
                plan_hyperlink=plan_hyperlink)
            org_count += 1

        # We copy edit risks & actions frequently enough that wiping and reloading upon import is
        # good house-keeping. It's baked into this script to minimize data deletion impacting users.
        delete_org_risks_and_actions(org)

    return org_count


def create_risks(org, events, systems):
    """A valid risk needs at minimum either a weather event or community system."""
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


def delete_org_risks_and_actions(org):
    """Delete all risks and actions for an organization."""
    return (OrganizationRisk.objects
            .filter(organization=org)
            .delete())


def create_risks_and_actions(actions_file):
    """Create an action for each associated risk combination."""
    next(actions_file)  # skip headers
    actions_reader = csv.reader(actions_file)

    action_count = 0

    stripped_rows = ((val.strip() for val in row) for row in actions_reader)

    # Convert index-based rows into a named tuple for easier handling
    NamedRow = namedtuple('NamedRow', [
        'city_name', 'strategy', 'weather_event', 'community_system', 'category', 'impact'
    ])
    named_rows = (NamedRow(*row) for row in stripped_rows)

    # We only care about a row if a weather event and/or community system are listed
    valid_rows = (row for row in named_rows if row.weather_event or row.community_system)

    # Group rows from the same city together so we can reuse the org object and limit logging noise
    for city_name, rows in groupby(valid_rows, lambda row: row.city_name):
        try:
            org = PlanItOrganization.objects.get(
                name=city_name,
                source=PlanItOrganization.Source.MISSY_IMPORTER,
            )
        except ObjectDoesNotExist:
            logger.warn('No organization for {}, skipping'.format(city_name))
            continue

        logger.info('Processing risks and actions for {}'.format(org))

        for row in rows:
            events = WeatherEvent.objects.filter(name__in=row.weather_event.split(';'))
            systems = CommunitySystem.objects.filter(name__in=row.community_system.split(';'))
            row_risks = create_risks(org, events, systems)

            for risk in row_risks:
                action, c = OrganizationAction.objects.get_or_create(
                    organization_risk=risk,
                    name=row.strategy,
                    visibility=OrganizationAction.Visibility.PUBLIC)

                # Unable to bulk add categories as a list and ".add" doesn't prevent duplicates
                if c:
                    action_count += 1
                    category_names = [cat.title() for cat in row.category.split(';')]
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

    help = ('Imports suggested actions data from CSVs. Looks for coordinates in the cities file, '
            'falling back to geocoding if any are missing.')

    def add_arguments(self, parser):
        parser.add_argument('cities_csv')
        parser.add_argument('actions_csv')

        parser.add_argument('--esri-client-id', help='Client ID of Esri account for geocoding')
        parser.add_argument('--esri-secret', help='Esri token for geocoding')

    @transaction.atomic
    def handle(self, *args, **options):
        with open(options['cities_csv']) as cities_file:
            org_count = create_organizations(cities_file, esri_client_id=options['esri_client_id'],
                                             esri_secret=options['esri_secret'])

        with open(options['actions_csv']) as actions_file:
            action_count = create_risks_and_actions(actions_file)

        logger.info('Ingest complete. Imported {} organizations and {} actions'.format(
            org_count, action_count))
