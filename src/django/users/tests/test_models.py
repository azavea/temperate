from unittest import mock

from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.test import TestCase

from users.models import PlanItLocation, PlanItOrganization
from planit_data.models import GeoRegion, WeatherEvent, WeatherEventRank


class OrganizationTestCase(TestCase):
    def setUp(self):
        pass

    def test_import_weather_events_point_inside_geom_included(self):
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            location=PlanItLocation.objects.create(
                name="Test Location",
                point=Point(150, 150)
            )
        )
        event_rank = WeatherEventRank.objects.create(
            georegion=GeoRegion.objects.create(
                name="Test GeoRegion",
                geom=MultiPolygon(Polygon(((100, 100), (100, 200), (200, 200), (200, 100), (100, 100))))
            ),
            weather_event=WeatherEvent.objects.create(
                name="Test Weather Event"
            ),
            order=1
        )

        org.import_weather_events()
        self.assertSequenceEqual(org.weather_events.all(), [event_rank])

    def test_import_weather_events_point_outside_geom_excluded(self):
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            location=PlanItLocation.objects.create(
                name="Test Location",
                point=Point(50, 50)
            )
        )
        GeoRegion.objects.create(
            name="Test GeoRegion",
            geom=MultiPolygon(Polygon(((0, 0), (0, 100), (100, 100), (100, 0), (0, 0))))
        ),
        WeatherEventRank.objects.create(
            georegion=GeoRegion.objects.create(
                name="Test GeoRegion",
                geom=MultiPolygon(Polygon(((100, 100), (100, 200), (200, 200), (200, 100), (100, 100))))
            ),
            weather_event=WeatherEvent.objects.create(
                name="Test Weather Event"
            ),
            order=1
        )

        org.import_weather_events()
        self.assertSequenceEqual(org.weather_events.all(), [])


class LocationManagerTestCase(TestCase):
    api_city_response = {
        "id": 7,
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                -75.16379,
                39.95233
            ]
        },
        "properties": {
            "datasets": [
                "NEX-GDDP",
                "LOCA"
            ],
            "name": "Philadelphia",
            "admin": "PA",
            "population": 1526006,
            "region": 11
        }
    }

    def setUp(self):
        pass

    @mock.patch('users.models.make_token_api_request')
    def test_from_api_city_no_location(self, api_wrapper_mock):
        """Ensure calling from_api_city makes an API call and parses response correctly."""
        api_wrapper_mock.return_value = self.api_city_response

        result = PlanItLocation.objects.from_api_city(7)

        self.assertEqual(result.api_city_id, 7)
        self.assertEqual(result.point.coords, (-75.16379, 39.95233))

    @mock.patch('users.models.make_token_api_request')
    def test_from_api_city_existing_location(self, api_wrapper_mock):
        """Ensure calling from_api_city with an existing Location does not make an API call."""
        location = PlanItLocation.objects.create(
            name='Test Location',
            api_city_id=7,
            point=Point(0, 0, srid=4326)
        )

        result = PlanItLocation.objects.from_api_city(7)

        self.assertEqual(result, location)
        self.assertFalse(api_wrapper_mock.called)
