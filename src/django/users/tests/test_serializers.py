from unittest import mock

from django.contrib.gis.geos import Point
from django.test import TestCase

from users.models import PlanItLocation, PlanItOrganization
from users.serializers import OrganizationSerializer


class OrganizationSerializerTestCase(TestCase):

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

    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    @mock.patch('users.models.make_token_api_request')
    def test_create_no_existing_data(self, api_wrapper_mock, import_weather_events_mock):
        """Ensure a new location is created and API call made."""
        api_wrapper_mock.return_value = self.api_city_response
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
        self.assertEqual(organization.location.api_city_id, data['location']['api_city_id'])
        self.assertIsNotNone(organization.location.point)

    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    @mock.patch('users.models.make_token_api_request')
    def test_create_existing_location_no_api(self, api_wrapper_mock, import_weather_events_mock):
        """Ensure existing location is used and API call not made."""
        location = PlanItLocation.objects.create(name='Test Location',
                                                 api_city_id=7,
                                                 point=Point(0, 0, srid=4326))
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
        # Should have used the existing PlanItLocation
        self.assertEqual(organization.location, location)
        # Shouldn't have made external api request here for City data -- location already exists
        self.assertFalse(api_wrapper_mock.called)

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
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data, data)
