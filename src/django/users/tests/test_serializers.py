from unittest import mock

from django.contrib.gis.geos import Point
from django.test import TestCase

from users.models import PlanItLocation, PlanItOrganization
from users.serializers import OrganizationSerializer


class OrganizationSerializerTestCase(TestCase):
    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    @mock.patch.object(PlanItLocation.objects, 'from_api_city')
    def test_create_no_existing_data(self, from_api_city_mock, import_weather_events_mock):
        """Ensure a new location is created with its Location from from_api_city()."""
        from_api_city_mock.return_value = PlanItLocation.objects.create(name='Test Location')
        data = {
            'name': 'Test Org',
            'location': {
                'api_city_id': 7
            },
            'units': 'METRIC'
        }

        organization = OrganizationSerializer.create(None, dict(data))

        self.assertEqual(organization.name, data['name'])
        self.assertEqual(organization.units, data['units'])
        from_api_city_mock.assert_called_with(data['location']['api_city_id'])
        self.assertEqual(organization.location, from_api_city_mock.return_value)

    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    @mock.patch.object(PlanItLocation.objects, 'from_api_city')
    def test_create_import_weather_rank(self, from_api_city_mock, import_weather_events_mock):
        """Ensure that creating an Organization invokes import_weather_events()."""
        from_api_city_mock.return_value = PlanItLocation.objects.create(name='Test Location')
        data = {
            'name': 'Test Org',
            'location': {
                'api_city_id': 7
            },
            'units': 'METRIC'
        }
        organization = OrganizationSerializer.create(None, dict(data))

        # The function should succeed and create an organization
        self.assertIsNotNone(organization)
        # Should have told the organization to import all default weather events
        self.assertTrue(import_weather_events_mock.called)

    def test_create_existing_location_no_serializer_error(self):
        """Ensure OrganizationSerializer does not encounter an error with an existing location.

        If this test starts failing with:

        self.assertTrue(serializer.is_valid())
            AssertionError: False is not true

        You may have hit an issue where if any properties of the nested PlanItLocation object
        are unique in the DB, the serializer barfs. See:
        - https://github.com/encode/django-rest-framework/issues/2996
        - https://medium.com/django-rest-framework/dealing-with-unique-constraints-in-nested-serializers-dade33b831d9 # NOQA
        """
        PlanItLocation.objects.create(name='Test Location',
                                      api_city_id=7,
                                      point=Point(0, 0, srid=4326))
        request_mock = mock.Mock()
        data = {
            'name': 'Test Org',
            'location': {
                'api_city_id': 7
            },
            'units': 'METRIC'
        }
        serializer = OrganizationSerializer(data=data, context={"request": request_mock})

        # Serializer should not throw an error for the existing api_city_id
        self.assertTrue(serializer.is_valid())

    def test_create_no_location_specified(self):
        """Ensure the Serializer raises an error if no location value is set."""
        data = {
            'name': 'Test Org',
            'units': 'METRIC'
        }
        serializer = OrganizationSerializer(data=data)

        # Serializer should not allow an Organization to be created without a location
        self.assertFalse(serializer.is_valid())

    def test_create_no_api_city_id_specified(self):
        """Ensure the Serializer raises an error if the location does not have a valid entry."""
        data = {
            'name': 'Test Org',
            'location': {'foobar': 123},
            'units': 'METRIC'
        }
        serializer = OrganizationSerializer(data=data)

        # Serializer should not allow an Organization to be created without a valid location value
        self.assertFalse(serializer.is_valid())
        self.assertEqual(len(serializer.errors['location']), 1)
        self.assertEqual(serializer.errors['location'][0], "Location ID is required.")

    def test_org_plan_due_date_set(self):
        """Accept a valid year"""
        request_mock = mock.Mock()
        data = {
            'name': 'Test Org',
            'location': {
                'api_city_id': 7
            },
            'plan_due_date': '2500-01-30',
            'units': 'METRIC'
        }

        serializer = OrganizationSerializer(data=data, context={"request": request_mock})
        self.assertTrue(serializer.is_valid())

    def test_org_plan_due_date_not_required(self):
        """Allow plan due date to be unset"""
        request_mock = mock.Mock()
        data = {
            'name': 'Test Org',
            'location': {
                'api_city_id': 7
            },
            'plan_due_date': None,
            'units': 'METRIC'
        }

        # should be valid when set to nothing
        serializer = OrganizationSerializer(data=data, context={"request": request_mock})
        self.assertTrue(serializer.is_valid())

        # should also validate with field not set at all
        data.pop('plan_due_date')
        serializer = OrganizationSerializer(data=data, context={"request": request_mock})
        self.assertTrue(serializer.is_valid())

    def test_org_plan_due_date_must_be_date(self):
        """Should reject non-parseable date values via in-built field validation"""
        data = {
            'name': 'Test Org',
            'location': {
                'api_city_id': 7
            },
            'plan_due_date': 'garbage string',
            'units': 'METRIC'
        }

        serializer = OrganizationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertTrue(serializer.errors and 'plan_due_date' in serializer.errors)
        self.assertEqual(len(serializer.errors['plan_due_date']), 1)
        self.assertTrue(serializer.errors['plan_due_date'][0].startswith("Date has wrong format"))

    def test_org_plan_due_date_in_future(self):
        data = {
            'name': 'Test Org',
            'location': {
                'api_city_id': 7
            },
            'plan_due_date': '2018-01-20',
            'units': 'METRIC'
        }

        serializer = OrganizationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertTrue(serializer.errors and 'plan_due_date' in serializer.errors)
        self.assertEqual(len(serializer.errors['plan_due_date']), 1)
        self.assertEqual(serializer.errors['plan_due_date'][0],
                         "Plan due date cannot be in the past.")
