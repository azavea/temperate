from unittest import mock

from django.db.utils import IntegrityError
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from planit_data.models import Concern, Indicator
from planit_data.serializers import (
    ConcernSerializer,
    OrganizationRiskSerializer,
)
from planit_data.tests.factories import CommunitySystemFactory, WeatherEventFactory
from users.tests.factories import UserFactory


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
        with self.assertRaises(KeyError):
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
    def setUp(self):
        self.user = UserFactory()

        self.request_factory = APIRequestFactory()
        self.request = self.request_factory.get('/blah/')
        self.request.user = self.user

    def test_create_requires_organization(self):
        """Ensure attempting to save fails if organization missing."""
        weather_event = WeatherEventFactory()
        community_system = CommunitySystemFactory()

        # unset primary organization for user
        self.request.user.primary_organization = None
        serializer = OrganizationRiskSerializer(
            data={'weather_event': weather_event.id,
                  'community_system': community_system.id},
            context={'request': self.request})

        # serializer is fine with missing org, because it looks to context for default
        self.assertTrue(serializer.is_valid())

        # saving serializer will error without the org, however
        with self.assertRaises(IntegrityError):
            serializer.save()

    def test_create_requires_community_system(self):
        """Ensure the Serializer raises a validation error if community system is missing
        from data.

        This is crucial safety wall for the front end/users since allowing the field to be
        nullable for the suggested actions feature."""
        weather_event = WeatherEventFactory()

        serializer = OrganizationRiskSerializer(
            data={'weather_event': weather_event.id},
            context={'request': self.request})

        self.assertFalse(serializer.is_valid())

    def test_create_requires_weather_event(self):
        """Ensure the Serializer raises a validation error if weather event is missing from data.

        This is crucial safety wall for the front end/users since allowing the field to be
        nullable for the suggested actions feature."""
        community_system = CommunitySystemFactory()

        serializer = OrganizationRiskSerializer(
            data={'community_system': community_system.id},
            context={'request': self.request})

        self.assertFalse(serializer.is_valid())

    def test_create_works_with_organization_weather_event_and_community_system(self):
        """Ensure the Serializer works when the data provided does have a organization, weather
        event and community system"""
        weather_event = WeatherEventFactory()
        community_system = CommunitySystemFactory()

        serializer = OrganizationRiskSerializer(
            data={'weather_event': weather_event.id,
                  'community_system': community_system.id},
            context={'request': self.request})

        self.assertTrue(serializer.is_valid())

        # No exception
        serializer.save()
