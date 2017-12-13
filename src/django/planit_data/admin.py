from django.contrib import admin

from .models import (
    CommunitySystem,
    GeoRegion,
    Indicator,
    Concern,
    WeatherEvent,
    WeatherEventRank,
    DefaultRisk,
)

for Model in (CommunitySystem,
              GeoRegion,
              Indicator,
              Concern,
              WeatherEvent,
              WeatherEventRank,
              DefaultRisk,):
    admin.site.register(Model)
