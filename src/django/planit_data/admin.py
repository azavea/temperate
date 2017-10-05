from django.contrib import admin

from .models import (
    CommunitySystem,
    GeoRegion,
    Indicator,
    RiskTemplate,
    UserLocation,
    UserRisk,
    WeatherEvent,
)

for Model in (CommunitySystem,
              GeoRegion,
              Indicator,
              RiskTemplate,
              UserLocation,
              UserRisk,
              WeatherEvent,):
    admin.site.register(Model)
