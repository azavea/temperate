from unittest import mock

from django.test import TestCase
from planit_data.models import Concern


class IndicatorChangeTest(TestCase):
    def test_get_concern_start_value(self):
        concern_mock = mock.Mock(spec=Concern)
        indicator_value_mock = mock.Mock()
        indicator_value_mock.return_value = 5.3
        concern_mock.get_indicator_average_value = indicator_value_mock
        concern_mock.START_YEAR = 1990
        concern_mock.ERA_LENGTH = 10

        city_id = 17
        end_value = Concern.get_start_value(concern_mock, city_id)

        self.assertEqual(end_value, 5.3)
        indicator_value_mock.assert_called_with(city_id, concern_mock.START_SCENARIO,
                                                range(1990, 2000))

    def test_get_concern_end_value(self):
        concern_mock = mock.Mock(spec=Concern)
        indicator_value_mock = mock.Mock()
        indicator_value_mock.return_value = 5.3
        concern_mock.get_indicator_average_value = indicator_value_mock
        concern_mock.END_YEAR = 2050
        concern_mock.ERA_LENGTH = 10

        city_id = 17
        end_value = Concern.get_end_value(concern_mock, city_id)

        self.assertEqual(end_value, 5.3)
        indicator_value_mock.assert_called_with(city_id, concern_mock.END_SCENARIO,
                                                range(2050, 2060))

    def test_calculate_indicator_average(self):
        response = {'data': {
                    '2050': {'avg': 15},
                    '2051': {'avg': 30}
                    }}

        result = Concern.calculate_indicator_average(response)

        self.assertEqual(result, 22.5)

    def test_calculate(self):
        concern_mock = mock.Mock(spec=Concern)
        concern_mock.is_relative = False

        start_value_mock = mock.Mock()
        start_value_mock.return_value = 7.3
        concern_mock.get_start_value = start_value_mock

        end_value_mock = mock.Mock()
        end_value_mock.return_value = 15.7
        concern_mock.get_end_value = end_value_mock

        city_id = 17
        result = Concern.calculate(concern_mock, city_id)

        self.assertAlmostEqual(result, 8.4)
        start_value_mock.assert_called_with(city_id)
        end_value_mock.assert_called_with(city_id)
