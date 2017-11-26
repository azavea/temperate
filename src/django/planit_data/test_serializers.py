from unittest import mock

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from planit_data.models import Concern, Indicator
from planit_data.serializers import ConcernSerializer
from users.models import PlanItLocation, PlanItOrganization, PlanItUser


class ConcernSerializerTestCase(TestCase):
    def setUp(self):
        self.user = PlanItUser.objects.create_user('mike@mike.phl', 'Mike', 'M', password='mike12345')
        location = PlanItLocation.objects.create(api_city_id=14)
        org = PlanItOrganization.objects.create(name='Test', location=location)
        self.user.organizations.add(org)
        self.user.primary_organization = org
        self.user.save()

        self.request_factory = APIRequestFactory()
        self.request = self.request_factory.get('/blah/')
        self.request.user = self.user

    @mock.patch('planit_data.models.Concern.calculate')
    @mock.patch('planit_data.models.Concern.get_default_units')
    def test_context_requires_request(self, default_units_mock, calculate_mock):
        """Ensure the Serializer raises an error if the does not have a request"""
        calculate_mock.return_value = 5.3
        default_units_mock.return_value = 'miles'

        indicator = Indicator.objects.create(name='Foobar')
        concern = Concern.objects.create(indicator=indicator,
                                         tagline_positive='more',
                                         tagline_negative='less',
                                         is_relative=True)

        # Serializer should require request to be passed as a context variable
        serializer = ConcernSerializer(concern)
        with self.assertRaises(ValueError):
            serializer.data

        serializer.context['request'] = self.request
        # No exception
        serializer.data
