from unittest import mock

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.test import TestCase

from users.models import PlanItLocation, PlanItOrganization, PlanItUser
from planit_data.models import GeoRegion, OrganizationWeatherEvent, WeatherEvent, WeatherEventRank


class OrganizationTestCase(TestCase):
    def test_import_weather_events_point_inside_geom_included(self):
        """Ensure that import_weather_events imports objects in organization's georegion."""
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
                geom=MultiPolygon(Polygon(((100, 100), (100, 200), (200, 200),
                                           (200, 100), (100, 100))))
            ),
            weather_event=WeatherEvent.objects.create(
                name="Test Weather Event"
            ),
            order=1
        )

        org.import_weather_events()

        org_weather_event = OrganizationWeatherEvent.objects.get(
            organization=org,
            weather_event=event_rank.weather_event,
            order=event_rank.order
        )
        self.assertSequenceEqual(org.weather_events.all(), [org_weather_event])

    def test_import_weather_events_point_outside_geom_excluded(self):
        """Ensure that import_weather_events excludes objects for outside regions."""
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
                geom=MultiPolygon(Polygon(((100, 100), (100, 200), (200, 200),
                                          (200, 100), (100, 100))))
            ),
            weather_event=WeatherEvent.objects.create(
                name="Test Weather Event"
            ),
            order=1
        )

        org.import_weather_events()
        self.assertSequenceEqual(org.weather_events.all(), [])

    def test_import_weather_events_non_coastal_city_exclude_coastal_only(self):
        """Ensure that it does not copy coastal_only objects for non-coastal location."""
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            location=PlanItLocation.objects.create(
                name="Test Location",
                is_coastal=False,
                point=Point(150, 150)
            )
        )
        WeatherEventRank.objects.create(
            georegion=GeoRegion.objects.create(
                name="Test GeoRegion",
                geom=MultiPolygon(Polygon(((100, 100), (100, 200), (200, 200),
                                           (200, 100), (100, 100))))
            ),
            weather_event=WeatherEvent.objects.create(
                name="Test Weather Event",
                coastal_only=True
            ),
            order=1
        )

        org.import_weather_events()
        self.assertSequenceEqual(org.weather_events.all(), [])

    def test_import_weather_events_coastal_city_include_coastal_only(self):
        """Ensure that it does copy coastal_only objects for coastal locations."""
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            location=PlanItLocation.objects.create(
                name="Test Location",
                is_coastal=True,
                point=Point(150, 150)
            )
        )
        event_rank = WeatherEventRank.objects.create(
            georegion=GeoRegion.objects.create(
                name="Test GeoRegion",
                geom=MultiPolygon(Polygon(((100, 100), (100, 200), (200, 200),
                                           (200, 100), (100, 100))))
            ),
            weather_event=WeatherEvent.objects.create(
                name="Test Weather Event",
                coastal_only=True
            ),
            order=1
        )

        org.import_weather_events()

        org_weather_event = OrganizationWeatherEvent.objects.get(
            organization=org,
            weather_event=event_rank.weather_event,
            order=event_rank.order
        )
        self.assertSequenceEqual(org.weather_events.all(), [org_weather_event])


class LocationManagerTestCase(TestCase):
    @mock.patch('users.models.make_token_api_request')
    def test_from_api_city_no_location(self, api_wrapper_mock):
        """Ensure calling from_api_city makes an API call and parses response correctly."""
        api_wrapper_mock.return_value = {
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
                "proximity": {
                    "ocean": False
                },
                "population": 1526006,
                "region": 11
            }
        }

        result = PlanItLocation.objects.from_api_city(7)

        self.assertEqual(result.api_city_id, 7)
        self.assertEqual(result.point.coords, (-75.16379, 39.95233))
        self.assertFalse(result.is_coastal)

    @mock.patch('users.models.make_token_api_request')
    def test_from_api_city_no_location_is_coastal(self, api_wrapper_mock):
        """Ensure calling from_api_city makes an API call and parses is_coastal correctly."""
        api_wrapper_mock.return_value = {
            "id": 2,
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -118.24368,
                    34.05223
                ]
            },
            "properties": {
                "datasets": [
                    "NEX-GDDP",
                    "LOCA"
                ],
                "name": "Los Angeles",
                "admin": "CA",
                "proximity": {
                    "ocean": True
                },
                "population": 3792621,
                "region": 18
            }
        }

        result = PlanItLocation.objects.from_api_city(2)

        self.assertTrue(result.is_coastal)

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


class PlanItUserTestCase(TestCase):
    def test_default_user_model(self):
        """Ensure PlanItUser is the default user models

        `./manage.py createsuperuser` uses get_user_model to determine what class to invoke
        create_superuser on, this ensures the command will be directed to the correct class.
        """
        UserModel = get_user_model()
        self.assertTrue(issubclass(UserModel, PlanItUser))

    def test_createuser(self):
        user_data = {
            'email': 'test@azavea.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'sooperseekrit'
        }
        user = PlanItUser.objects.create_user(**user_data)

        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_staff)

    def test_createsuperuser(self):
        user_data = {
            'email': 'test@azavea.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'sooperseekrit'
        }
        user = PlanItUser.objects.create_superuser(**user_data)

        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_active)

        # check user has no organizations
        self.assertEqual(0, user.organizations.all().count(), 'User should have no organizations')
        self.assertEqual(user.primary_organization, None,
                         'User should have no primary organization')
