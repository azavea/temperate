from itertools import zip_longest

from django.test import TestCase

from planit_data.utils import apportion_counts


class TestApportionCounts(TestCase):
    def assertIteratorEqual(self, actuals, expecteds):
        sentinel = object()
        pairs = zip_longest(actuals, expecteds, fillvalue=sentinel)
        for num, (actual, expected) in enumerate(pairs):
            if actual == sentinel or expected == sentinel:
                self.fail("Both lists are not same length.")
            self.assertEqual(actual, expected)

    def test_empty(self):
        result = apportion_counts([], 5)
        self.assertIteratorEqual(result, [])

    def test_single(self):
        result = apportion_counts([1], 5)
        self.assertIteratorEqual(result, [(1, 5)])

    def test_split(self):
        # Splitting 5 across two items should associate 3 with the first and 2 with the second
        result = apportion_counts([1, 2], 5)
        self.assertIteratorEqual(result, [(1, 3), (2, 2)])

    def test_exhausted_count(self):
        # Splitting 2 across three itmes should associate 1 with first two but 0 with last
        result = apportion_counts([1, 2, 3], 2)
        self.assertIteratorEqual(result, [(1, 1), (2, 1), (3, 0)])
