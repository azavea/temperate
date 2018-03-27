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
              RelatedAdaptiveValue,
              WeatherEventRank,
              ):
    admin.site.register(Model)


class OrganizationTypeFilter(admin.SimpleListFilter):
    title = 'type'
    parameter_name = 'type'
    is_import = 'created_by__isnull'

    class Choices:
        CUSTOMER = 'Customer created'
        IMPORT = 'Imported'

    def lookups(self, request, model_admin):
        return [(OrganizationTypeFilter.Choices.CUSTOMER, OrganizationTypeFilter.Choices.CUSTOMER),
                (OrganizationTypeFilter.Choices.IMPORT, OrganizationTypeFilter.Choices.IMPORT)]

    def queryset(self, request, queryset):
        if self.value() == OrganizationTypeFilter.Choices.CUSTOMER:
            return queryset.filter(**{self.is_import: False})
        if self.value() == OrganizationTypeFilter.Choices.IMPORT:
            return queryset.filter(**{self.is_import: True})
        return queryset.all()


class OrganizationTypeRiskFilter(OrganizationTypeFilter):
    is_import = 'organization__created_by__isnull'


class OrganizationTypeActionFilter(OrganizationTypeFilter):
    is_import = 'organization_risk__organization__created_by__isnull'


@admin.register(CommunitySystem)
class CommunitySystemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'display_class',)
    list_editable = ('display_class',)


@admin.register(DefaultRisk)
class DefaultRiskAdmin(admin.ModelAdmin):
    list_display = ('id', 'weather_event', 'community_system', 'order',)
    list_editable = ('order',)


@admin.register(OrganizationRisk)
class OrganizationRiskAdmin(admin.ModelAdmin):
    list_filter = (OrganizationTypeRiskFilter, 'weather_event', 'community_system')
    list_select_related = ('organization', 'weather_event', 'community_system')
    ordering = ('organization__name', 'weather_event__name', 'community_system__name')
    search_fields = ('name', 'organization__name',)


@admin.register(OrganizationAction)
class OrganizationActionAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'name', 'visibility')
    list_editable = ('visibility',)
    list_filter = (OrganizationTypeActionFilter,
                   'visibility',
                   'organization_risk__weather_event',
                   'organization_risk__community_system')
    list_select_related = ('organization_risk',
                           'organization_risk__organization',
                           'organization_risk__weather_event',
                           'organization_risk__community_system')
    ordering = ('organization_risk__organization__name',
                'organization_risk__weather_event__name',
                'organization_risk__community_system__name',
                'name')
    search_fields = ('name',
                     'organization_risk__organization__name',
                     'organization_risk__organization__location__name')


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
