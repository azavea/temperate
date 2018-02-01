import csv
import datetime
import logging

from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry

from geopy.geocoders import Nominatim

from planit_data.models import (CommunitySystem, WeatherEvent, OrganizationRisk, OrganizationAction,
                                GeoRegion, WeatherEventRank)
from action_steps.models import ActionCategory
from users.models import PlanItOrganization, PlanItLocation

logger = logging.getLogger('missy_data')

class Command(BaseCommand):
    """Used to import data from Missy's dataset"""

    help = 'imports default from a CSV'

    def add_arguments(self, parser):
        parser.add_argument('cities_csv')
        parser.add_argument('actions_csv')

    def handle(self, *args, **options):
        hazards = WeatherEvent.objects.all()
        community_systems = CommunitySystem.objects.all()
        categories = ActionCategory.objects.all()
        geo = Nominatim()

        # with open(options['cities_csv']) as cities_file:
        #     next(cities_file)  # skip headers
        #     city_reader = csv.reader(cities_file)
        #     for row in city_reader:
        #         if row[2]:
        #             date = datetime.datetime.strptime(row[2], '%m/%d/%Y').isoformat().split('T')[0]
        #         else:
        #             date = None

        #         try:
        #             location = geo.geocode('{} {}'.format(row[0], row[1]))
        #             point = {"type": 'Point',
        #                      "coordinates": [location.longitude, location.latitude]}
        #             point = GEOSGeometry(str(point))

        #             temperate_location, c = PlanItLocation.objects.get_or_create(point=point,
        #                                                                          name=row[0])
        #         except:
        #             break

        #         org, c = PlanItOrganization.objects.update_or_create(name=row[0],
        #                                                              defaults={
        #                                                              'plan_due_date': date,
        #                                                              'plan_name': row[3],
        #                                                              'plan_hyperlink': row[4],
        #                                                              'location': temperate_location
        #                                                              })
        #         try:
        #             georegion = GeoRegion.objects.get_for_point(point)
        #             event_ranks = WeatherEventRank.objects.filter(georegion=georegion)
        #             for event in event_ranks:
        #                 org.weather_events.add(event)
        #         except:
        #             continue

        with open(options['actions_csv']) as actions_file:
            next(actions_file)  # skip headers
            actions_reader = csv.reader(actions_file)
            for row in actions_reader:
                if row[2] and row[3]:
                    org, created = PlanItOrganization.objects.get_or_create(name=row[0])
                    logger.info('Adding info for {}'.format(org))
                    events = []
                    systems = []
                    risks = []
                    # parse hazard and cs combos
                    for event in row[2].split(';'):
                        if event:
                            try:
                                hazards.get(name=event)
                                events.append(hazards.get(name=event))
                            except:
                                continue
                    for system in row[3].split(';'):
                        if system:
                            try:
                                community_systems.get(name=system)
                                systems.append(community_systems.get(name=system))
                            except:
                                continue
                    # create risks
                    logger.info('Risks for {}'.format(org))
                    for event in events:
                        if systems:
                            for system in systems:
                                new_risk, c = OrganizationRisk.objects.get_or_create(organization=org,
                                                                                     community_system=system,
                                                                                     weather_event=event)
                                if c is True:
                                    risks.append(new_risk)
                        else:
                            new_risk, c = OrganizationRisk.objects.get_or_create(organization=org,
                                                                                 weather_event=event,
                                                                                 community_system__isnull=True)
                            if c is True:
                                risks.append(new_risk)

                    logger.info('Actions for {}'.format(org))
                    # create action for each risk
                    for risk in risks:
                        action, c = OrganizationAction.objects.get_or_create(organization_risk=risk,
                                                                             name=row[1],
                                                                             visibility='public')
                        # parse and add categories
                        if c is True:
                            for cat in row[4].split(';'):
                                try:
                                    action.categories.add(categories.get(name=cat.title()).id.hex)
                                except:
                                    continue
                else:
                    continue
