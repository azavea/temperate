from unittest import mock

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from planit_data.models import Concern, Indicator
from planit_data.serializers import (
    ConcernSerializer,
    OrganizationRiskSerializer,
)
from planit_data.tests.factories import CommunitySystemFactory, WeatherEventFactory
from users.tests.factories import UserFactory, OrganizationFactory


class ConcernSerializerTestCase(TestCase):
    def setUp(self):
        self.user = UserFactory()

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


class OrganizationRiskSerializerTestCase(TestCase):
    def test_create_context_requires_organization(self):
        """Ensure the Serializer raises an error if the context does not have an organization."""
        weather_event = WeatherEventFactory()
        community_system = CommunitySystemFactory()

        serializer = OrganizationRiskSerializer(
            data={'weather_event': weather_event.id,
                  'community_system': community_system.id})

        self.assertTrue(serializer.is_valid())
        with self.assertRaises(ValueError):
            serializer.save()

    def test_create_context_works_with_organization(self):
        """Ensure the Serializer works when the context does have a organization"""
        weather_event = WeatherEventFactory()
        community_system = CommunitySystemFactory()
        org = OrganizationFactory()

        serializer = OrganizationRiskSerializer(
            data={'weather_event': weather_event.id,
                  'community_system': community_system.id},
            context={'organization': org.id})

        self.assertTrue(serializer.is_valid())

        # No exception
        serializer.save()
