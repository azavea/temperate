from django.contrib.auth import get_user_model
from django.contrib.gis.geos import MultiPolygon

from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from planit_data.models import UserLocation, Indicator, Concern


class PlanitApiTestCase(APITestCase):
    def setUp(self):
        user_class = get_user_model()
        self.user = user_class.objects.create_user('user', 'user@example.com',
                                                   'password')

        self.client.force_authenticate(user=self.user)

    def test_concern_list_empty(self):
        response = self.client.get('/api/concern/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], [])

    def test_concern_list_nonempty(self):
        indicator = Indicator.objects.create()
        Concern.objects.create(indicator=indicator, tagline='test', unit='t', is_relative=True)
        response = self.client.get('/api/concern/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_concern_list_nonauth(self):
        """Ensure that unauthenticated users receive a 403 Forbidden reponse."""
        client = APIClient()
        response = client.get('/api/concern/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_concern_detail(self):
        indicator = Indicator.objects.create()
        concern = Concern.objects.create(indicator=indicator,
                                         tagline='test',
                                         unit='t',
                                         is_relative=True)
        UserLocation.objects.create(name='Test', user=self.user, geom=MultiPolygon())

        response = self.client.get('/api/concern/{}'.format(concern.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_concern_detail_invalid(self):
        response = self.client.get('/api/concern/999')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_concern_detail_nonauth(self):
        client = APIClient()
        response = client.get('/api/concern/999')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
