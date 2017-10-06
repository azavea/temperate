from django.test import TestCase
from planit_data.concerns import calculate_indicator_change


class IndicatorChangeTest(TestCase):
    def test_flat_rise(self):
        start_years = [2010]
        end_years = [2050]
        response = {
            'data': {
                '2010': {'avg': 15},
                '2050': {'avg': 30}
            }
        }

        result = calculate_indicator_change(response, start_years, end_years, False)
        self.assertEqual(result, 15.0)

    def test_relative_change(self):
        start_years = [2010]
        end_years = [2050]
        response = {
            'data': {
                '2010': {'avg': 15},
                '2050': {'avg': 30}
            }
        }

        result = calculate_indicator_change(response, start_years, end_years, True)
        self.assertEqual(result, 1.0)

    def test_ranges(self):
        start_years = [2010, 2011, 2012]
        end_years = [2050, 2051, 2052]
        response = {
            'data': {
                '2010': {'avg': 15},
                '2011': {'avg': 16},
                '2012': {'avg': 17},
                '2050': {'avg': 25},
                '2051': {'avg': 26},
                '2052': {'avg': 27}
            }
        }

        result = calculate_indicator_change(response, start_years, end_years, False)
        self.assertEqual(result, 10.0)
