from unittest import mock

from django.test import TestCase
from planit_data.concerns import (calculate_indicator_average_value,
                                  get_concern_end_value,
                                  get_concern_start_value)


class IndicatorChangeTest(TestCase):
    def test_get_concern_start_value(self):
        average_mock = mock.patch('concerns.get_indicator_average_value')
        average_mock.return_value = 5.3

        concern = mock.Mock()
        city_id = 17
        end_value = get_concern_start_value(concern, city_id)

        self.assertEqual(end_value, 5.3)
        average_mock.assert_called_with(concern, city_id, 'historical', range(1990, 2000))

    def test_get_concern_end_value(self):
        average_mock = mock.patch('planit_data.concerns.get_indicator_average_value')
        average_mock.return_value = 5.3

        concern = mock.Mock()
        city_id = 17
        end_value = get_concern_end_value(concern, city_id)

        self.assertEqual(end_value, 5.3)
        average_mock.assert_called_with(concern, city_id, 'RCP85', range(2050, 2060))

    def test_calculate_indicator_average_value(self):
        response = {'data': {'2050': {'avg': 15}, '2051': {'avg': 30}}}
        indicator_average = calculate_indicator_average_value(response)
        self.assertEqual(indicator_average, 22.5)
