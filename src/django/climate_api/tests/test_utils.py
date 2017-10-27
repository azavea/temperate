from django.test import TestCase

from climate_api.utils import serialize_years


class TestSerializeYears(TestCase):
    def test_empty(self):
        result = serialize_years([])
        self.assertEqual(result, "")

    def test_single(self):
        result = serialize_years([1])
        self.assertEqual(result, "1")

    def test_range(self):
        result = serialize_years([range(2050, 2060)])
        self.assertEqual(result, "2050:2059")

    def test_combo(self):
        result = serialize_years([2048, range(2050, 2060)])
        self.assertEqual(result, "2048,2050:2059")
