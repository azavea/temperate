from unittest import mock

from django.db.utils import IntegrityError
from django.test import TestCase

from planit_data.models import (
    ConcernValue,
    ConcernValueManager,
    OrganizationWeatherEvent
)
from planit_data.tests.factories import (
    ConcernFactory,
    ConcernValueFactory,
    WeatherEventFactory
)
from users.tests.factories import OrganizationFactory, LocationFactory


class ConcernTestCase(TestCase):
    def test_calculate(self):
        """Test that calculate uses output from get_calculated_values for non-static concerns."""
        org = OrganizationFactory()
        concern = ConcernFactory()
        indicator_units = mock.Mock()

        # Use a mock override for get_calculated_values
        concern.get_calculated_values = mock.Mock(return_value=(8.3, indicator_units))

        result = concern.calculate(org)

        self.assertDictEqual(result, {
            'tagline': concern.tagline_positive,
            'units': indicator_units,
            'value': 8.3,
        })
        concern.get_calculated_values.assert_called_with(org)

    def test_calculate_negative_value_tagline(self):
        """Test that calculate uses appropriate tagline for negative values."""
        concern = ConcernFactory()
        indicator_units = mock.Mock()

        # Use a lambda to override get_calculated_values
        concern.get_calculated_values = lambda organization: (-8.3, indicator_units)

        result = concern.calculate(None)

        self.assertDictEqual(result, {
            'tagline': concern.tagline_negative,
            'units': indicator_units,
            'value': -8.3,
        })

    def test_concern_no_indicator_uses_static_data(self):
        concern = ConcernFactory(
            indicator=None,
            tagline_positive='more',
            tagline_negative='less',
            static_value=10.0,
            static_units='F')
        data = concern.calculate(None)
        self.assertEqual(data, {
            'value': 10.0,
            'units': 'F',
            'tagline': 'more'
        })

    def test_relative_concern_static_units_none(self):
        concern = ConcernFactory(
            indicator=None,
            is_relative=True,
            static_units='F')
        data = concern.calculate(None)
        self.assertEqual(data['units'], None)

    @mock.patch('planit_data.models.make_indicator_point_api_request')
    def test_concern_no_indicator_skips_api_request(self, api_request_mock):
        api_request_mock.side_effect = RuntimeError('Static concerns should not make API requests')

        concern = ConcernFactory(indicator=None)
        org = OrganizationFactory()
        concern.calculate(org)

    @mock.patch('planit_data.models.ConcernValueManager.for_location')
    def test_get_calculated_values(self, for_location_mock):
        """Test that get_calculated_values relays the output of for_location()."""
        concern = ConcernFactory()
        organization = OrganizationFactory()
        concernvalue = ConcernValueFactory(concern=concern, location=organization.location)
        for_location_mock.return_value = concernvalue

        result_value, result_units = concern.get_calculated_values(organization)

        self.assertEqual(result_value, concernvalue.value)
        self.assertEqual(result_units, concernvalue.units)


class ConcernValueTestCase(TestCase):
    def test_for_location_uses_existing_concern_value(self):
        """Test that for_location will use an existing ConcernValue object if available."""
        concern = ConcernFactory()
        location = LocationFactory()
        concernvalue = ConcernValueFactory(concern=concern, location=location)

        result = ConcernValue.objects.for_location(concern, location)

        self.assertEqual(result, concernvalue)

    @mock.patch('planit_data.models.ConcernValueManager.calculate_change')
    def test_for_location_creates_concern_value_if_missing(self, calculate_change):
        """Test that for_location will create a ConcernValue object if one does not exist."""
        concern = ConcernFactory()
        location = LocationFactory()
        calculate_change.return_value = (13.1, 'in')

        result = ConcernValue.objects.for_location(concern, location)

        concernvalue = ConcernValue.objects.get(concern=concern, location=location)
        self.assertEqual(result, concernvalue)
        self.assertEqual(result.value, 13.1)
        self.assertEqual(result.units, 'in')

    @mock.patch('planit_data.models.ConcernValueManager.get_average_value')
    def test_calculate_change_uses_get_average_value(self, get_average_value_mock):
        """calculate_change() uses get_average_value() for calculating difference."""
        location = LocationFactory()
        concern = ConcernFactory(is_relative=False)
        get_average_value_mock.return_value = (1, '')

        ConcernValue.objects.calculate_change(concern, location)

        get_average_value_mock.assert_has_calls([
            mock.call(concern, location,
                      ConcernValueManager.START_SCENARIO,
                      ConcernValueManager.START_YEAR),
            mock.call(concern, location,
                      ConcernValueManager.END_SCENARIO,
                      ConcernValueManager.END_YEAR),
        ])

    @mock.patch('planit_data.models.ConcernValueManager.get_average_value')
    def test_calculate_change_absolute_concern(self, get_average_value_mock):
        """calculate_change() uses simple difference for non-relative concerns."""
        location = LocationFactory()
        concern = ConcernFactory(is_relative=False)
        indicator_units = mock.Mock()

        # Mock get_average_value to return different values each time it's called
        get_average_value_mock.side_effect = lambda concern, location, scenario, start_year: {
            ConcernValueManager.START_SCENARIO: (7.3, indicator_units),
            ConcernValueManager.END_SCENARIO: (15.6, indicator_units)
        }.get(scenario)

        result_value, result_units = ConcernValue.objects.calculate_change(concern, location)

        self.assertEqual(result_value, 8.3)
        self.assertEqual(result_units, indicator_units)

    @mock.patch('planit_data.models.ConcernValueManager.get_average_value')
    def test_calculate_change_relative_concern(self, get_average_value_mock):
        """calculate_change() compares values for relative concerns by ratio."""
        location = LocationFactory()
        concern = ConcernFactory(is_relative=True)
        indicator_units = mock.Mock()

        # Mock get_average_value to return different values each time it's called
        get_average_value_mock.side_effect = lambda concern, location, scenario, start_year: {
            ConcernValueManager.START_SCENARIO: (7.8, indicator_units),
            ConcernValueManager.END_SCENARIO: (15.6, indicator_units)
        }.get(scenario)

        result_value, result_units = ConcernValue.objects.calculate_change(concern, location)

        self.assertEqual(result_value, 1)
        self.assertEqual(result_units, None)

    @mock.patch('planit_data.models.ConcernValueManager.get_average_value')
    def test_calculate_change_relative_concern_starting_zero(self, get_average_value_mock):
        """Relative concerns that start with a value of 0 fall back to absolute difference."""
        location = LocationFactory()
        concern = ConcernFactory(is_relative=True)
        indicator_units = mock.Mock()

        # Mock get_average_value to return different values each time it's called
        get_average_value_mock.side_effect = lambda concern, location, scenario, start_year: {
            ConcernValueManager.START_SCENARIO: (0, indicator_units),
            ConcernValueManager.END_SCENARIO: (15.6, indicator_units)
        }.get(scenario)

        result_value, result_units = ConcernValue.objects.calculate_change(concern, location)

        self.assertEqual(result_value, 15.6)
        self.assertEqual(result_units, indicator_units)

    @mock.patch('planit_data.models.make_indicator_point_api_request')
    def test_get_average_value(self, api_indicator_mock):
        """get_average_value should return the mean of values in Climate API request data."""
        location = LocationFactory()
        concern = ConcernFactory()
        indicator_units = mock.Mock()
        api_indicator_mock.return_value = {
            'data': {
                '2050': {'avg': 10},
                '2051': {'avg': 17}
            },
            'units': indicator_units}
        scenario = 'historical'

        result_value, result_units = ConcernValue.objects.get_average_value(
            concern, location, scenario, 1990)

        self.assertEqual(result_value, 13.5)
        self.assertEqual(result_units, indicator_units)
        api_indicator_mock.assert_called_with(
            concern.indicator,
            location.point,
            scenario,
            params={
                'years': [range(1990, 2000)],
                'dataset': 'LOCA'
            })


class OrganizationWeatherEventTestCase(TestCase):

    def test_default_ordering_when_first_insert(self):
        """Our custom method should assign a default order when no other objects exist."""
        OrganizationWeatherEvent.objects.all().delete()
        organization = OrganizationFactory()
        weather_event = WeatherEventFactory()

        org_we = OrganizationWeatherEvent(organization=organization,
                                          weather_event=weather_event)
        try:
            org_we.save()
        except IntegrityError:
            self.fail("OrganizationWeatherEvent.save() should set default order if not provided")

    def test_default_ordering(self):
        """Objects created without an explicit order should be added to the end of the list."""
        organization = OrganizationFactory()
        drought = WeatherEventFactory(name='drought')
        hurricanes = WeatherEventFactory(name='hurricanes')

        org_drought = OrganizationWeatherEvent(organization=organization,
                                               weather_event=drought,
                                               order=5)
        org_drought.save()

        org_hurricanes = OrganizationWeatherEvent(organization=organization,
                                                  weather_event=hurricanes)
        org_hurricanes.save()

        self.assertGreater(org_hurricanes.order, org_drought.order)

    def test_updates_shouldnt_update_default_order(self):
        """The save method should only implicitly set order on initial save."""
        OrganizationWeatherEvent.objects.all().delete()
        organization = OrganizationFactory()
        weather_event = WeatherEventFactory()

        org_we = OrganizationWeatherEvent(organization=organization,
                                          weather_event=weather_event)
        org_we.save()

        last_order = org_we.order
        org_we.save()
        self.assertEqual(org_we.order, last_order)
