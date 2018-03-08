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

for Model in (Concern,
              GeoRegion,
              Indicator,
              OrganizationAction,
              OrganizationRisk,
              RelatedAdaptiveValue,
              WeatherEventRank,
              ):
    admin.site.register(Model)


@admin.register(CommunitySystem)
class CommunitySystemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'display_class',)
    list_editable = ('display_class',)


@admin.register(DefaultRisk)
class DefaultRiskAdmin(admin.ModelAdmin):
    list_display = ('id', 'weather_event', 'community_system', 'order',)
    list_editable = ('order',)


@admin.register(WeatherEvent)
class WeatherEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'display_class',)
    list_editable = ('display_class',)


@admin.register(OrganizationWeatherEvent)
class OrganizationWeatherEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_weather_event_name', 'order',)
    list_editable = ('order',)

    def get_weather_event_name(self, obj):
        return obj.weather_event.name
