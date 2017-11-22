from unittest import mock

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import MultiPolygon, Point, Polygon
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from planit_data.models import Concern, GeoRegion, Indicator, WeatherEvent
from planit_data.views import WeatherEventRankView
from users.models import PlanItLocation, PlanItOrganization


class ConcernViewSetTestCase(APITestCase):
    def setUp(self):
        user_class = get_user_model()
        self.user = user_class.objects.create_user('user', 'user@example.com',
                                                   'password')

        self.client.force_authenticate(user=self.user)

    def test_concern_list_empty(self):
        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], [])

    def test_concern_list_nonempty(self):
        indicator = Indicator.objects.create(name='Foobar')
        concern = Concern.objects.create(indicator=indicator, tagline='test', is_relative=True)

        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertDictEqual(response.data['results'][0],
                             {'id': concern.id, 'indicator': 'Foobar',
                              'tagline': 'test', 'is_relative': True})

    def test_concern_list_nonauth(self):
        """Ensure that unauthenticated users receive a 403 Forbidden response."""
        self.client.logout()
        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @mock.patch('planit_data.models.Concern.calculate')
    def test_concern_detail(self, calculate_mock):
        calculate_mock.return_value = 5.3

        location = PlanItLocation.objects.create(api_city_id=14)
        org = PlanItOrganization.objects.create(name='Test', location=location)
        self.user.organizations.add(org)
        self.user.primary_organization = org
        self.user.save()

        indicator = Indicator.objects.create(name='Foobar')
        concern = Concern.objects.create(indicator=indicator,
                                         tagline='test',
                                         is_relative=True)

        url = reverse('concern-detail', kwargs={'pk': concern.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data,
                             {'id': concern.id, 'indicator': 'Foobar', 'tagline': 'test',
                              'is_relative': True, 'value': 5.3})
        calculate_mock.assert_called_with(self.user.get_current_location().api_city_id)

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

    def _create_data(self):
        location = PlanItLocation.objects.create(name='test location', point=Point(1, 1))
        organization = PlanItOrganization.objects.create(name='test org', location=location)
        self.user.organizations.add(organization)
        self.user.primary_organization = organization
        self.user.save()

        geom = MultiPolygon(Polygon([[0, 0], [0, 4], [4, 4], [4, 0], [0, 0]]))
        georegion = GeoRegion.objects.create(name='test geom', geom=geom)
        we1 = WeatherEvent.objects.create(name='Heat Events')
        we2 = WeatherEvent.objects.create(name='Hurricanes')
        self.rrr1 = WeatherEventRankView.model_class.objects.create(georegion=georegion,
                                                                    weather_event=we1,
                                                                    order=1)
        self.rrr2 = WeatherEventRankView.model_class.objects.create(georegion=georegion,
                                                                    weather_event=we2,
                                                                    order=2)

    def test_weather_event_rank_list(self):
        self._create_data()

        url = reverse('weather-event-rank-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = WeatherEventRankView.serializer_class([self.rrr1, self.rrr2], many=True)
        self.assertEqual(response.json(), serializer.data)

    def test_weather_event_rank_list_no_location(self):
        self._create_data()
        PlanItLocation.objects.all().delete()
        self.user.primary_organization.refresh_from_db()

        url = reverse('weather-event-rank-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
