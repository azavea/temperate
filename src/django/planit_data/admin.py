from django.contrib import admin

from .models import (
    CommunitySystem,
    Concern,
    DefaultRisk,
    GeoRegion,
    Indicator,
    OrganizationRisk,
    RelatedAdaptiveValue,
    WeatherEvent,
    WeatherEventRank,
)

for Model in (CommunitySystem,
              Concern,
              DefaultRisk,
              GeoRegion,
              Indicator,
              OrganizationRisk,
              RelatedAdaptiveValue,
              WeatherEvent,
              WeatherEventRank,
              ):
    admin.site.register(Model)
