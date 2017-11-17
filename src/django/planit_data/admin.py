from django.contrib import admin

from .models import (
    CommunitySystem,
    GeoRegion,
    Indicator,
    RiskTemplate,
    Concern,
    WeatherEvent,
    RegionalRiskRank
)

for Model in (CommunitySystem,
              GeoRegion,
              Indicator,
              RiskTemplate,
              Concern,
              WeatherEvent,
              RegionalRiskRank,):
    admin.site.register(Model)
