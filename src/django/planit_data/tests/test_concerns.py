from unittest import mock

from django.test import TestCase
from planit_data.models import Concern
from users.models import PlanItLocation, PlanItOrganization


class IndicatorChangeTest(TestCase):
    @mock.patch('planit_data.models.make_indicator_api_request')
    def test_get_average_value(self, api_indicator_mock):
        api_indicator_mock.return_value = {
            'data': {
                '2050': {'avg': 10},
                '2051': {'avg': 17}
            }}

        concern = mock.Mock()
        concern.ERA_LENGTH = 10

        scenario = 'historical'
        result = Concern.get_average_value(concern, 14, scenario, 1990, 'in')

        self.assertEqual(result, 13.5)
        api_indicator_mock.assert_called_with(concern.indicator, 14, scenario,
                                              params={'years': [range(1990, 2000)],
                                                      'units': 'in'})

    def test_calculate(self):
        location = PlanItLocation.objects.create(api_city_id=14)
        org = PlanItOrganization.objects.create(name='Test', location=location)

        concern_mock = mock.Mock(spec=Concern)
        concern_mock.is_relative = False

        # Mock Concern.get_average_value to avoid calling a real API instance or needing to invent
        # a ton of fake data
        value_mock = mock.Mock()
        concern_mock.get_average_value = value_mock
        # Use a lambda to give different values for the two times get_average_value is called
        value_mock.side_effect = (lambda organization, scenario, year, units: {
            # Give one number as the result of calculating the start value
            concern_mock.START_SCENARIO: 7.3,
            # Another for the end value
            concern_mock.END_SCENARIO: 15.6
        }.get(scenario))

        result = Concern.calculate(concern_mock, org)

        self.assertAlmostEqual(result['value'], 8.3)
        value_mock.assert_has_calls([
            # Ensure that our get_average_value mock was called for start data and end data
            mock.call(location.api_city_id, concern_mock.START_SCENARIO,
                      concern_mock.START_YEAR, concern_mock.get_units()),
            mock.call(location.api_city_id, concern_mock.END_SCENARIO,
                      concern_mock.END_YEAR, concern_mock.get_units())
        ], any_order=True)
