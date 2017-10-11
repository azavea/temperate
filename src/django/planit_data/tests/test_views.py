from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APITestCase, APIClient
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
        indicator = Indicator.objects.create()
        Concern.objects.create(indicator=indicator, tagline='test', is_relative=True)

        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_concern_list_nonauth(self):
        """Ensure that unauthenticated users receive a 403 Forbidden reponse."""
        client = APIClient()
        url = reverse('concern-list')
        response = client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_concern_detail(self):
        indicator = Indicator.objects.create()
        concern = Concern.objects.create(indicator=indicator,
                                         tagline='test',
                                         is_relative=True)

        url = reverse('concern-detail', kwargs={'pk': concern.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_concern_detail_invalid(self):
        url = reverse('concern-detail', kwargs={'pk': 999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_concern_detail_nonauth(self):
        client = APIClient()
        url = reverse('concern-detail', kwargs={'pk': 1})
        response = client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
