from unittest import mock

from django.db.utils import IntegrityError
from django.test import TestCase

from planit_data.models import Concern, OrganizationWeatherEvent
from planit_data.tests.factories import (
    ConcernFactory,
    OrganizationFactory,
    WeatherEventFactory
)


class ConcernTestCase(TestCase):
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
        org = OrganizationFactory()
        concern_mock = mock.Mock(spec=Concern)
        concern_mock.is_relative = False

        # Use a lambda for get_average_value to give different values for the times it is called
        concern_mock.get_average_value.side_effect = (lambda organization, scenario, year, units: {
            # Give one number as the result of calculating the start value
            concern_mock.START_SCENARIO: 7.3,
            # Another for the end value
            concern_mock.END_SCENARIO: 15.6
        }.get(scenario))

        result = Concern.calculate(concern_mock, org)

        self.assertAlmostEqual(result['value'], 8.3)
        concern_mock.get_average_value.assert_has_calls([
            # Ensure that our get_average_value mock was called for start data and end data
            mock.call(org.location.api_city_id, concern_mock.START_SCENARIO,
                      concern_mock.START_YEAR, concern_mock.get_units()),
            mock.call(org.location.api_city_id, concern_mock.END_SCENARIO,
                      concern_mock.END_YEAR, concern_mock.get_units())
        ], any_order=True)

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

    @mock.patch('planit_data.models.make_token_api_request')
    def test_concern_no_indicator_skips_api_request(self, api_request_mock):
        api_request_mock.side_effect = RuntimeError('Static concerns should not make API requests')

        concern = ConcernFactory(indicator=None)
        org = OrganizationFactory()
        concern.calculate(org)


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
