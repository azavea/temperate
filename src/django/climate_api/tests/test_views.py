from unittest import mock

from requests import Response

from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from climate_api.models import APIToken


class ClimateAPIProxyViewTestCase(APITestCase):

    def setUp(self):
        user_class = get_user_model()
        self.user = user_class.objects.create_user('user', 'user@example.com',
                                                   'password')
        self.client.force_authenticate(user=self.user)

    @mock.patch('climate_api.views.requests')
    def test_proxy_success(self, requests_mock):
        """Call should be made to Climate API if route passes whitelist."""

        def requests_mock_get(*args, **kwargs):
            response = Response()
            response.status_code = status.HTTP_200_OK
            response.headers = {'content-type': 'application/json'}
            return response

        APIToken.objects.create(token='123abc')
        requests_mock.get = mock.Mock(side_effect=requests_mock_get)
        test_settings = {
            'CCAPI_HOST': 'https://app.climate.azavea.com',
            'CCAPI_ROUTE_WHITELIST': ('/api/indicator', )
        }
        with self.settings(**test_settings):
            url = reverse('climate-api-proxy', kwargs={'route': 'api/indicator/'})
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(requests_mock.get.called)

    @mock.patch('climate_api.views.requests')
    def test_proxy_whitelisting(self, requests_mock):
        """No call to API if the route fails the whitelist check."""
        requests_mock.get.return_value = {
            'status_code': status.HTTP_404_NOT_FOUND
        }
        test_settings = {
            'CCAPI_HOST': 'https://app.climate.azavea.com',
            'CCAPI_ROUTE_WHITELIST': ('/api/indicator', )
        }
        with self.settings(**test_settings):
            url = reverse('climate-api-proxy', kwargs={'route': 'api/shouldntpass/'})
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
            self.assertFalse(requests_mock.get.called)
