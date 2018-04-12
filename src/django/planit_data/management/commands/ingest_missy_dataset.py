import csv
import logging

from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from django.db import transaction

from omgeo import Geocoder
from omgeo.places import PlaceQuery
from omgeo.postprocessors import AttrFilter
from omgeo.services import EsriWGS
import us

from planit_data.models import CommunitySystem, WeatherEvent, OrganizationRisk, OrganizationAction
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

        # We need locations because Orgs need them and risks and actions need Orgs,
        # but we want these to be independent from the actual cities loaded from the API,
        # so we'll only get ones that have a null `api_city_id`.
        # The 'admin' value might make more sense in the filter rather than the defaults, but
        # this script was run on production without saving 'admin' values, so we want to update
        # the existing instances.  The name and lack of API ID should be enough to uniquely
        # identify an existing instance.
        temperate_location, c = PlanItLocation.objects.update_or_create(
            name=city_name,
            is_coastal=is_coastal,
            api_city_id=None,
            defaults={
                'admin': state_abbr,
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

        # We copy edit actions frequently enough that wiping and reloading upon import is good
        # house-keeping. It's baked into this script to minimize data deletion impacting users.
        delete_org_actions(org)

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


def delete_org_actions(org):
    return (OrganizationAction.objects
            .filter(organization_risk__organization=org)
            .delete())


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
