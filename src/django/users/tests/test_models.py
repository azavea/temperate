from unittest import mock

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.test import TestCase
from django.utils import timezone

from users.models import PlanItLocation, PlanItOrganization, PlanItUser
from planit_data.models import GeoRegion, OrganizationWeatherEvent, WeatherEvent, WeatherEventRank
from planit_data.tests.factories import GeoRegionFactory


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

    def test_subscription_end_date_set_on_freetrial_save(self):
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            subscription=PlanItOrganization.Subscription.FREE_TRIAL,
            subscription_end_date=None
        )
        self.assertIsNotNone(org.subscription_end_date)

    def test_subscription_end_date_set_on_paid_plan_save(self):
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            subscription=PlanItOrganization.Subscription.FREE_TRIAL,
            subscription_end_date=None
        )
        now = timezone.now()
        org.subscription = PlanItOrganization.Subscription.BASIC
        org.save()
        self.assertGreater(org.subscription_end_date, now.replace(year=now.year + 1))

    def test_subscription_end_date_unchanged_when_paid_plan_created(self):
        now = timezone.now()
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            subscription=PlanItOrganization.Subscription.BASIC,
            subscription_end_date=now
        )
        self.assertEqual(org.subscription_end_date, now)

    def test_subscription_end_date_unchanged_when_paid_plan_updated(self):
        now = timezone.now()
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            subscription=PlanItOrganization.Subscription.BASIC,
            subscription_end_date=now
        )
        org.name = 'A New Organization'
        org.save()
        self.assertEqual(org.subscription_end_date, now)


class LocationManagerTestCase(TestCase):
    @mock.patch('users.models.make_token_api_request')
    @mock.patch('planit_data.models.GeoRegionManager.get_for_point')
    def test_from_point_no_location(self, get_for_point_mock, api_wrapper_mock):
        """Ensure calling from_point makes an API call and parses response correctly."""
        get_for_point_mock.return_value = GeoRegionFactory()
        point = Point(0, 0, srid=4326)
        api_wrapper_mock.return_value = [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [0, 0]
            },
            "properties": {
                "datasets": ["NEX-GDDP"],
                "distance_meters": 10,
                "proximity": {
                    "ocean": False
                }
            }
        }]

        result = PlanItLocation.objects.from_point('Test', 'ABC', point)

        self.assertEqual(result.point.coords, point.coords)
        self.assertEqual(result.georegion, get_for_point_mock.return_value)
        self.assertFalse(result.is_coastal)

    @mock.patch('users.models.make_token_api_request')
    @mock.patch('planit_data.models.GeoRegionManager.get_for_point')
    def test_from_point_no_location_is_coastal(self, get_for_point_mock, api_wrapper_mock):
        """Ensure calling from_point makes an API call and parses is_coastal correctly."""
        get_for_point_mock.return_value = GeoRegionFactory()
        api_wrapper_mock.return_value = [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [0, 0]
            },
            "properties": {
                "datasets": ["NEX-GDDP", "LOCA"],
                "distance_meters": 0,
                "proximity": {
                    "ocean": True
                }
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [0, 0]
            },
            "properties": {
                "datasets": ["NEX-GDDP", "LOCA"],
                "distance_meters": 1000,
                "proximity": {
                    "ocean": False
                }
            }
        }]

        result = PlanItLocation.objects.from_point('Test', 'ABC', Point(0, 0, srid=4326))

        self.assertTrue(result.is_coastal)

    @mock.patch('users.models.make_token_api_request')
    @mock.patch('planit_data.models.GeoRegionManager.get_for_point')
    def test_from_point_uses_matching_georegion(self, get_for_point_mock, api_wrapper_mock):
        """Ensure calling from_point calls GeoRegionManager.get_for_point."""
        get_for_point_mock.return_value = GeoRegionFactory()
        api_wrapper_mock.return_value = [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [0, 0]
            },
            "properties": {
                "datasets": ["NEX-GDDP"],
                "distance_meters": 1000,
                "proximity": {
                    "ocean": True
                }
            }
        }]

        result = PlanItLocation.objects.from_point('Test', 'ABC', Point(0, 0, srid=4326))

        get_for_point_mock.assert_called_with(result.point)

    @mock.patch('users.models.make_token_api_request')
    def test_from_point_existing_location(self, api_wrapper_mock):
        """Ensure calling from_point with an existing Location does not make an API call."""
        location = PlanItLocation.objects.create(
            name='Test Location',
            admin='ABC',
            point=Point(0, 0, srid=4326)
        )

        result = PlanItLocation.objects.from_point(location.name, location.admin, location.point)

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
        self.assertFalse(user.can_create_multiple_organizations)

    def test_createsuperuser(self):
        user_data = {
            'email': 'test@azavea.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'sooperseekrit',
            'can_create_multiple_organizations': True
        }
        user = PlanItUser.objects.create_superuser(**user_data)

        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_active)
        self.assertTrue(user.can_create_multiple_organizations)

        # check user has no organizations
        self.assertEqual(0, user.organizations.all().count(), 'User should have no organizations')
        self.assertEqual(user.primary_organization, None,
                         'User should have no primary organization')
