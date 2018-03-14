from unittest import mock

from django.db.utils import IntegrityError
from django.test import TestCase

from planit_data.models import OrganizationWeatherEvent
from planit_data.tests.factories import (
    ConcernFactory,
    OrganizationFactory,
    WeatherEventFactory
)


class ConcernTestCase(TestCase):

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
