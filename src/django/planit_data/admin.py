from django.contrib import admin

from .models import (
    CommunitySystem,
    GeoRegion,
    Indicator,
    RiskTemplate,
    Concern,
    WeatherEvent,
    WeatherEventRank
)

for Model in (CommunitySystem,
              GeoRegion,
              Indicator,
              RiskTemplate,
              Concern,
              WeatherEvent,
              WeatherEventRank,):
    admin.site.register(Model)
