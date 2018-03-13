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
        org = OrganizationFactory()
        api_indicator_mock.return_value = {
            'data': {
                '2050': {'avg': 10},
                '2051': {'avg': 17}
            }}

        concern = mock.Mock()
        concern.ERA_LENGTH = 10

        scenario = 'historical'
        result = Concern.get_average_value(concern, org, scenario, 1990, 'in')

        self.assertEqual(result, 13.5)
        api_indicator_mock.assert_called_with(
            concern.indicator,
            org.location.api_city_id,
            scenario,
            params={
                'years': [range(1990, 2000)],
                'units': 'in'
            })

    def test_calculate(self):
        org = OrganizationFactory()
        concern = ConcernFactory()

        # Use a lambda for get_average_value to give different values for the times it is called
        concern.get_average_value = (lambda organization, scenario, year, units: {
            # Give one number as the result of calculating the start value
            concern.START_SCENARIO: 7.3,
            # Another for the end value
            concern.END_SCENARIO: 15.6
        }.get(scenario))
        concern.get_units = mock.Mock()

        result = concern.calculate(org)

        self.assertDictEqual(result, {
            'tagline': concern.tagline_positive,
            'units': concern.get_units.return_value,
            'value': 8.3,
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
