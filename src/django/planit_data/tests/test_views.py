from unittest import mock

from django.contrib.gis.geos import Point
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from planit_data.views import WeatherEventRankView
from planit_data.tests.factories import (
    ConcernFactory,
    GeoRegionFactory,
    OrganizationRiskFactory,
    WeatherEventRankFactory
)
from users.tests.factories import UserFactory, LocationFactory


class ConcernViewSetTestCase(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_concern_list_empty(self):
        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], [])

    @mock.patch('planit_data.models.Concern.calculate')
    def test_concern_list_nonempty(self, calculate_mock):
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'farthing',
            'tagline': 'more'
        }
        concern = ConcernFactory(
            tagline_positive='more',
            tagline_negative='less',
            is_relative=True)

        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertDictEqual(
            dict(response.data['results'][0]),
            {'id': concern.id,
             'indicator': concern.indicator.name,
             'tagline': 'more',
             'isRelative': True,
             'value': 5.3,
             'units': 'farthing'})

    def test_concern_list_nonauth(self):
        """Ensure that unauthenticated users receive a 401 Unauthorized response."""
        self.client.logout()
        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @mock.patch('planit_data.models.Concern.calculate')
    def test_concern_detail(self, calculate_mock):
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'miles',
            'tagline': 'more'
        }

        concern = ConcernFactory(
            tagline_positive='more',
            tagline_negative='less',
            is_relative=True)

        url = reverse('concern-detail', kwargs={'pk': concern.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data,
                             {'id': concern.id, 'indicator': concern.indicator.name,
                              'tagline': 'more', 'isRelative': True, 'value': 5.3,
                              'units': 'miles'})
        calculate_mock.assert_called_with(self.user.primary_organization)

    def test_concern_detail_invalid(self):
        url = reverse('concern-detail', kwargs={'pk': 999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_concern_detail_nonauth(self):
        self.client.logout()
        url = reverse('concern-detail', kwargs={'pk': 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class WeatherEventRankViewTestCase(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_weather_event_rank_list(self):
        organization = self.user.primary_organization
        organization.location = LocationFactory(coords=(2, 2))

        # Create a georegion centered around our location's coordinates
        georegion = GeoRegionFactory(bounds=[[1, 1], [1, 3], [3, 3], [3, 1], [1, 1]])

        # Create a WeatherEventRank that will be associated with our organization
        weathereventank = WeatherEventRankFactory(georegion=georegion)
        organization.weather_events.add(weathereventank)

        # Create additional WeatherEventRanks for the same georegion that are not associated
        WeatherEventRankFactory.create_batch(2, georegion=georegion)

        url = reverse('weather-event-rank-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = WeatherEventRankView.serializer_class([weathereventank], many=True)
        self.assertEqual(response.json(), serializer.data)


class OrganizationRiskTestCase(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_list_organization_risks(self):
        org_risk = OrganizationRiskFactory(organization=self.user.primary_organization)

        url = reverse('organizationrisk-list')
        response = self.client.get(url)

        self.assertEqual(response.json(), [{
            'adaptiveCapacity': '',
            'adaptiveCapacityDescription': '',
            'communitySystem': {
                'id': org_risk.community_system.id,
                'name': org_risk.community_system.name
            },
            'frequency': '',
            'id': str(org_risk.id),
            'impactDescription': '',
            'impactMagnitude': '',
            'intensity': '',
            'probability': '',
            'relatedAdaptiveValues': [],
            'weatherEvent': {
                'coastalOnly': False,
                'concern': None,
                'displayClass': '',
                'id': org_risk.weather_event.id,
                'indicators': [],
                'name': org_risk.weather_event.name
            }}])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
