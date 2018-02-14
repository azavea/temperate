from django.contrib import admin

from .models import (
    CommunitySystem,
    Concern,
    DefaultRisk,
    GeoRegion,
    Indicator,
    OrganizationAction,
    OrganizationRisk,
    OrganizationWeatherEvent,
    RelatedAdaptiveValue,
    WeatherEvent,
    WeatherEventRank,
)

for Model in (CommunitySystem,
              Concern,
              DefaultRisk,
              GeoRegion,
              Indicator,
              OrganizationAction,
              OrganizationRisk,
              RelatedAdaptiveValue,
              WeatherEvent,
              WeatherEventRank,
              ):
    admin.site.register(Model)


@admin.register(OrganizationWeatherEvent)
class OrganizationWeatherEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_weather_event_name', 'order',)
    list_editable = ('order',)

    def get_weather_event_name(self, obj):
        return obj.weather_event.name
