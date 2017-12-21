from unittest import mock

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from planit_data.models import CommunitySystem, Concern, Indicator, WeatherEvent
from planit_data.serializers import (
    ConcernSerializer,
    OrganizationRiskCreateSerializer,
    OrganizationRiskSerializer
)

from users.models import PlanItLocation, PlanItOrganization, PlanItUser


class ConcernSerializerTestCase(TestCase):
    def setUp(self):
        self.user = PlanItUser.objects.create_user('mike@mike.phl', 'Mike', 'M',
                                                   password='mike12345')
        location = PlanItLocation.objects.create(api_city_id=14)
        org = PlanItOrganization.objects.create(name='Test', location=location)
        self.user.organizations.add(org)
        self.user.primary_organization = org
        self.user.save()

        self.request_factory = APIRequestFactory()
        self.request = self.request_factory.get('/blah/')
        self.request.user = self.user

        indicator = Indicator.objects.create(name='Foobar')
        self.concern = Concern.objects.create(indicator=indicator,
                                              tagline_positive='more',
                                              tagline_negative='less',
                                              is_relative=True)

    @mock.patch('planit_data.models.Concern.calculate')
    def test_context_requires_request(self, calculate_mock):
        """Ensure the Serializer raises an error if the context does not have a request"""
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'miles',
            'tagline': 'more'
        }

        serializer = ConcernSerializer(self.concern)
        with self.assertRaises(ValueError):
            serializer.data

    @mock.patch('planit_data.models.Concern.calculate')
    def test_context_works_with_request(self, calculate_mock):
        """Ensure the Serializer works if the context does have a request"""
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'miles',
            'tagline': 'more'
        }

        serializer = ConcernSerializer(self.concern, context={'request': self.request})
        # No exception
        serializer.data

    @mock.patch('planit_data.models.Concern.calculate')
    def test_context_request_can_be_set_afterwards(self, calculate_mock):
        """Ensure the Serializer works when the request is added after construction"""
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'miles',
            'tagline': 'more'
        }

        serializer = ConcernSerializer(self.concern)
        serializer.context['request'] = self.request

        # No exception
        serializer.data


class OrganizationRiskCreateSerializerTestCase(TestCase):
    def setUp(self):
        self.user = PlanItUser.objects.create_user('mike@mike.phl', 'Mike', 'M',
                                                   password='mike12345')
        location = PlanItLocation.objects.create(api_city_id=14)
        org = PlanItOrganization.objects.create(name='Test', location=location)
        self.user.organizations.add(org)
        self.user.primary_organization = org
        self.user.save()

        self.request_factory = APIRequestFactory()
        self.request = self.request_factory.get('/blah/')
        self.request.user = self.user

        self.weather_event = WeatherEvent.objects.create(name='Really hot days')
        self.community_system = CommunitySystem.objects.create(name='Old folks')

    def test_create_context_requires_request(self):
        """Ensure the Serializer raises an error if the context does not have a request"""
        serializer = OrganizationRiskCreateSerializer(data={'weatherEvent': self.weather_event.id,
                                                      'communitySystem': self.community_system.id})
        if not serializer.is_valid():
            print(serializer.errors)
        with self.assertRaises(ValueError):
            serializer.save()

    def test_create_context_works_with_request(self):
        """Ensure the Serializer works if the context does have a request"""
        serializer = OrganizationRiskCreateSerializer(data={'weatherEvent': self.weather_event.id,
                                                      'communitySystem': self.community_system.id},
                                                      context={'request': self.request})
        if not serializer.is_valid():
            print(serializer.errors)
        # No exception
        serializer.save()
