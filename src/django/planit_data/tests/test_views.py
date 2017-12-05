from unittest import mock

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import MultiPolygon, Point, Polygon
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from planit_data.models import Concern, GeoRegion, Indicator, WeatherEvent, WeatherEventRank
from planit_data.views import WeatherEventRankView
from users.models import PlanItLocation, PlanItOrganization


class ConcernViewSetTestCase(APITestCase):
    def setUp(self):
        user_class = get_user_model()
        self.user = user_class.objects.create_user('user', 'user@example.com',
                                                   'password')

        self.client.force_authenticate(user=self.user)

        location = PlanItLocation.objects.create(api_city_id=14)
        org = PlanItOrganization.objects.create(name='Test', location=location)
        self.user.organizations.add(org)
        self.user.primary_organization = org
        self.user.save()

    def test_concern_list_empty(self):
        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], [])

    @mock.patch('planit_data.models.Concern.calculate')
    def test_concern_list_nonempty(self, calculate_mock):
        indicator = Indicator.objects.create(name='Foobar')
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'farthing',
            'tagline': 'more'
        }
        concern = Concern.objects.create(indicator=indicator,
                                         tagline_positive='more',
                                         tagline_negative='less',
                                         is_relative=True)

        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertDictEqual(dict(response.data['results'][0]),
                             {'id': concern.id, 'indicator': 'Foobar', 'tagline': 'more',
                              'isRelative': True, 'value': 5.3, 'units': 'farthing'})

    def test_concern_list_nonauth(self):
        """Ensure that unauthenticated users receive a 403 Forbidden response."""
        self.client.logout()
        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @mock.patch('planit_data.models.Concern.calculate')
    def test_concern_detail(self, calculate_mock):
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'miles',
            'tagline': 'more'
        }

        indicator = Indicator.objects.create(name='Foobar')
        concern = Concern.objects.create(indicator=indicator,
                                         tagline_positive='more',
                                         tagline_negative='less',
                                         is_relative=True)

        url = reverse('concern-detail', kwargs={'pk': concern.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data,
                             {'id': concern.id, 'indicator': 'Foobar',
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

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class WeatherEventRankViewTestCase(APITestCase):

    def setUp(self):
        user_class = get_user_model()
        self.user = user_class.objects.create_user('user', 'user@example.com',
                                                   'password')

        self.client.force_authenticate(user=self.user)

    def test_weather_event_rank_list(self):
        location = PlanItLocation.objects.create(name='test location', point=Point(1, 1))
        organization = PlanItOrganization.objects.create(name='test org', location=location)
        self.user.organizations.add(organization)
        self.user.primary_organization = organization
        self.user.save()

        geom = MultiPolygon(Polygon([[0, 0], [0, 4], [4, 4], [4, 0], [0, 0]]))
        georegion = GeoRegion.objects.create(name='test geom', geom=geom)

        rrr1 = WeatherEventRank.objects.create(
            georegion=georegion,
            weather_event=WeatherEvent.objects.create(
                name='Heat Events'
            ),
            order=1
        )
        WeatherEventRank.objects.create(
            georegion=georegion,
            weather_event=WeatherEvent.objects.create(
                name='Hurricanes'
            ),
            order=2
        )

        # Add rrr1 but not rrr2
        organization.weather_events.add(rrr1)

        url = reverse('weather-event-rank-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = WeatherEventRankView.serializer_class([rrr1], many=True)
        self.assertEqual(response.json(), serializer.data)
