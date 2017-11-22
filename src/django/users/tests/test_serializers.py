from unittest import mock

from django.contrib.gis.geos import Point
from django.test import TestCase

from users.models import PlanItLocation, PlanItOrganization
from users.serializers import OrganizationSerializer


class OrganizationSerializerTestCase(TestCase):
    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    @mock.patch.object(PlanItLocation.objects, 'from_api_city')
    def test_create_no_existing_data(self, from_api_city_mock, import_weather_events_mock):
        """Ensure a new location is created and API call made."""
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

    def test_create_existing_location_no_serializer_error(self):
        """Ensure creating a Organization for an existing location does not cause a serialier error.

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
        data = {
            'name': 'Test Org',
            'location': {
                'api_city_id': 7
            },
            'units': 'METRIC'
        }
        serializer = OrganizationSerializer(data=data)

        # Serializer should not throw an error for the existing api_city_id
        self.assertTrue(serializer.is_valid())
        # Should validate the data as is
        self.assertEqual(serializer.validated_data, data)

    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    @mock.patch.object(PlanItLocation.objects, 'from_api_city')
    def test_create_import_weather_rank(self, from_api_city_mock, import_weather_events_mock):
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
