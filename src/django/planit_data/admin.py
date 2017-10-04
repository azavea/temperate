from django.contrib import admin

from .models import (
    CommunitySystem,
    GeoRegion,
    Indicator,
    RiskTemplate,
    WeatherEvent,
)

for Model in (CommunitySystem, GeoRegion, Indicator, RiskTemplate, WeatherEvent,):
    admin.site.register(Model)
