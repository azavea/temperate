from unittest import mock

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from planit_data.models import Indicator, Concern


class PlanitApiTestCase(APITestCase):
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

    def test_concern_detail(self):
        calculate_value = mock.patch('planit_data.concerns.get_indicator_average_value')
        calculate_value.return_value = 5.3

        self.user.api_city_id = 14

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
        calculate_value.assert_called_with(concern, 14)

    def test_concern_detail_invalid(self):
        url = reverse('concern-detail', kwargs={'pk': 999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_concern_detail_nonauth(self):
        self.client.logout()
        url = reverse('concern-detail', kwargs={'pk': 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
