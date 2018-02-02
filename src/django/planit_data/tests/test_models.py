from django.db.utils import IntegrityError
from django.test import TestCase

from planit_data.models import CommunitySystem, DefaultRisk, OrganizationWeatherEvent, WeatherEvent

from planit_data.tests.factories import (
    OrganizationFactory,
    WeatherEventFactory
)


class DefaultRiskManager(TestCase):
    def test_top_risks(self):
        WeatherEvent.objects.bulk_create([
            WeatherEvent(name="Hail"),
            WeatherEvent(name="Rain"),
            WeatherEvent(name="Sleet"),
            WeatherEvent(name="Snow"),
        ])
        CommunitySystem.objects.bulk_create([
            CommunitySystem(name="Roads"),
            CommunitySystem(name="Bridges"),
            CommunitySystem(name="Airports"),
            CommunitySystem(name="Canals"),
        ])

        weather_events = {we.name: we for we in WeatherEvent.objects.all()}
        community_systems = {cs.name: cs for cs in CommunitySystem.objects.all()}

        default_risks = DefaultRisk.objects.bulk_create([
            DefaultRisk(weather_event=weather_events['Hail'],
                        community_system=community_systems['Roads'], order=1),
            DefaultRisk(weather_event=weather_events['Hail'],
                        community_system=community_systems['Bridges'], order=2),
            DefaultRisk(weather_event=weather_events['Rain'],
                        community_system=community_systems['Roads'], order=1),
            DefaultRisk(weather_event=weather_events['Sleet'],
                        community_system=community_systems['Roads'], order=1),
            DefaultRisk(weather_event=weather_events['Sleet'],
                        community_system=community_systems['Bridges'], order=2),
            DefaultRisk(weather_event=weather_events['Snow'],
                        community_system=community_systems['Bridges'], order=1),
            DefaultRisk(weather_event=weather_events['Snow'],
                        community_system=community_systems['Canals'], order=2),
        ])

        starting_risks = DefaultRisk.objects.top_risks(
            [weather_events['Hail'].id, weather_events['Sleet'].id, weather_events['Snow'].id],
            [community_systems['Roads'].id, community_systems['Bridges'].id],
            4
        )

        self.assertEqual(starting_risks, [
            default_risks[0], default_risks[1], default_risks[3], default_risks[5]
        ])


class OrganizationWeatherEventTestCase(TestCase):

    def test_default_ordering_when_first_insert(self):
        """Our custom method should assign a default order when no other objects exist."""
        OrganizationWeatherEvent.objects.all().delete()
        organization = OrganizationFactory()
        weather_event = WeatherEventFactory()

        org_we = OrganizationWeatherEvent(organization=organization,
                                          weather_event=weather_event)
        try:
            org_we.save()
        except IntegrityError:
            self.fail("OrganizationWeatherEvent.save() should set default order if not provided")

    def test_default_ordering(self):
        """Objects created without an explicit order should be added to the end of the list."""
        organization = OrganizationFactory()
        drought = WeatherEventFactory(name='drought')
        hurricanes = WeatherEventFactory(name='hurricanes')

        org_drought = OrganizationWeatherEvent(organization=organization,
                                               weather_event=drought,
                                               order=5)
        org_drought.save()

        org_hurricanes = OrganizationWeatherEvent(organization=organization,
                                                  weather_event=hurricanes)
        org_hurricanes.save()

        self.assertGreater(org_hurricanes.order, org_drought.order)

    def test_updates_shouldnt_update_default_order(self):
        """The save method should only implicitly set order on initial save."""
        OrganizationWeatherEvent.objects.all().delete()
        organization = OrganizationFactory()
        weather_event = WeatherEventFactory()

        org_we = OrganizationWeatherEvent(organization=organization,
                                          weather_event=weather_event)
        org_we.save()

        last_order = org_we.order
        org_we.save()
        self.assertEqual(org_we.order, last_order)
