from unittest import mock

from django.test import TestCase

from climate_api.wrapper import make_indicator_api_request, make_token_api_request


class ApiWrapperTestCase(TestCase):
    @mock.patch('climate_api.wrapper.make_token_api_request')
    def test_make_indicator_api_request(self, api_wrapper):
        indicator = mock.Mock()
        indicator.name = 'test_indicator'
        city = 17
        scenario = 'TEST'
        result = make_indicator_api_request(indicator, city, scenario)

        self.assertEqual(result, api_wrapper.return_value)
        api_wrapper.assert_called_with('api/climate-data/17/TEST/indicator/test_indicator/', {})

    @mock.patch('climate_api.utils.settings.CCAPI_REQUEST_TIMEOUT')
    @mock.patch('climate_api.wrapper.get_api_url')
    @mock.patch('climate_api.wrapper.APIToken')
    @mock.patch('climate_api.wrapper.requests')
    def test_make_token_api_request(self, requests_mock, token_mock, get_url_mock, timeout_mock):
        token_mock.objects.current.return_value = '123abc'
        params = {'hello': 'world'}
        route = 'foobar'

        make_token_api_request(route, params)

        get_url_mock.assert_called_with(route)
        requests_mock.get.assert_called_with(
            get_url_mock.return_value,
            headers={'Authorization': "Token 123abc"},
            params=params,
            timeout=timeout_mock)
