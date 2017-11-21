from unittest import mock

from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.test import TestCase

from users.models import PlanItLocation, PlanItOrganization
from planit_data.models import GeoRegion, WeatherEvent, WeatherEventRank


class OrganizationTestCase(TestCase):
    def setUp(self):
        pass

    def test_import_weather_events_point_inside_geom_included(self):
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            location=PlanItLocation.objects.create(
                name="Test Location",
                point=Point(150, 150)
            )
        )
        event_rank = WeatherEventRank.objects.create(
            georegion=GeoRegion.objects.create(
                name="Test GeoRegion",
                geom=MultiPolygon(Polygon(((100, 100), (100, 200), (200, 200), (200, 100), (100, 100))))
            ),
            weather_event=WeatherEvent.objects.create(
                name="Test Weather Event"
            ),
            order=1
        )

        org.import_weather_events()
        self.assertSequenceEqual(org.weather_events.all(), [event_rank])

    def test_import_weather_events_point_outside_geom_excluded(self):
        org = PlanItOrganization.objects.create(
            name="Test Organization",
            location=PlanItLocation.objects.create(
                name="Test Location",
                point=Point(50, 50)
            )
        )
        GeoRegion.objects.create(
            name="Test GeoRegion",
            geom=MultiPolygon(Polygon(((0, 0), (0, 100), (100, 100), (100, 0), (0, 0))))
        ),
        WeatherEventRank.objects.create(
            georegion=GeoRegion.objects.create(
                name="Test GeoRegion",
                geom=MultiPolygon(Polygon(((100, 100), (100, 200), (200, 200), (200, 100), (100, 100))))
            ),
            weather_event=WeatherEvent.objects.create(
                name="Test Weather Event"
            ),
            order=1
        )

        org.import_weather_events()
        self.assertSequenceEqual(org.weather_events.all(), [])
