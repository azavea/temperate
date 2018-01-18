import factory

from django.contrib.gis.geos import MultiPolygon, Polygon

from users.tests.factories import OrganizationFactory
from planit_data.models import (
    CommunitySystem,
    Concern,
    GeoRegion,
    Indicator,
    OrganizationAction,
    OrganizationRisk,
    WeatherEvent,
    WeatherEventRank
)


class CommunitySystemFactory(factory.DjangoModelFactory):
    class Meta:
        model = CommunitySystem

    name = factory.Sequence(lambda n: 'Test CommunitySystem {}'.format(n))


class IndicatorFactory(factory.DjangoModelFactory):
    class Meta:
        model = Indicator

    name = 'test_indicator'


class ConcernFactory(factory.DjangoModelFactory):
    class Meta:
        model = Concern

    indicator = factory.SubFactory(IndicatorFactory)


class GeoRegionFactory(factory.DjangoModelFactory):
    class Meta:
        model = GeoRegion

    @classmethod
    def _adjust_kwargs(cls, **kwargs):
        # Wrap boundaries in GeoDjango types
        bounds = kwargs.pop('bounds', None)
        if bounds:
            kwargs['geom'] = MultiPolygon(Polygon(bounds))

        return kwargs

    name = 'Test GeoRegion'
    # Default georegion is a square bounding from 1,1 to 4,4 to exclude 0,0
    geom = MultiPolygon(Polygon([[1, 1], [1, 4], [4, 4], [4, 1], [1, 1]]))


class WeatherEventFactory(factory.DjangoModelFactory):
    class Meta:
        model = WeatherEvent

    name = factory.Sequence(lambda n: 'Test WeatherEvent {}'.format(n))


class WeatherEventRankFactory(factory.DjangoModelFactory):
    class Meta:
        model = WeatherEventRank

    georegion = factory.SubFactory(GeoRegionFactory)
    weather_event = factory.SubFactory(WeatherEventFactory)
    order = factory.Sequence(int)


class OrganizationRiskFactory(factory.DjangoModelFactory):
    class Meta:
        model = OrganizationRisk

    organization = factory.SubFactory(OrganizationFactory)
    weather_event = factory.SubFactory(WeatherEventFactory)
    community_system = factory.SubFactory(CommunitySystemFactory)


class OrganizationActionFactory(factory.DjangoModelFactory):
    class Meta:
        model = OrganizationAction

    organization_risk = factory.SubFactory(OrganizationRiskFactory)

    @factory.post_generation
    def categories(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            return

        if extracted:
            # A list of categories were passed in, use them
            for category in extracted:
                self.categories.add(category)