from django.contrib import admin
from django.contrib.postgres.fields import JSONField

from jsoneditor.forms import JSONEditor

from .models import (
    ClimateAssessmentRegion,
    CommunitySystem,
    Concern,
    County,
    DefaultRisk,
    GeoRegion,
    Impact,
    ImpactCommunitySystemRank,
    ImpactMapLayer,
    ImpactMapLegendRow,
    ImpactWeatherEventRank,
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
              Impact,
              Indicator,
              RelatedAdaptiveValue,
              WeatherEventRank,
              ):
    admin.site.register(Model)


class ImpactCommunitySystemInline(admin.TabularInline):
    model = ImpactCommunitySystemRank
    extra = 1


class ImpactWeatherEventInline(admin.TabularInline):
    model = ImpactWeatherEventRank
    extra = 1


class ImpactMapLegendInline(admin.TabularInline):
    model = ImpactMapLegendRow
    extra = 1


@admin.register(ClimateAssessmentRegion)
class ClimateAssessmentRegionAdmin(admin.ModelAdmin):
    list_display = ('name',)
    exclude = ['geom']
    formfield_overrides = {
        JSONField: {'widget': JSONEditor},
    }
    inlines = [ImpactCommunitySystemInline, ImpactWeatherEventInline]


@admin.register(CommunitySystem)
class CommunitySystemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'display_class',)
    list_editable = ('display_class',)


@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    list_display = ('geoid', 'name', 'state_fips',)
    search_fields = ('name',)
    formfield_overrides = {
        JSONField: {'widget': JSONEditor},
    }


@admin.register(ImpactMapLayer)
class ImpactMapLayerAdmin(admin.ModelAdmin):
    inlines = [ImpactMapLegendInline]


@admin.register(DefaultRisk)
class DefaultRiskAdmin(admin.ModelAdmin):
    list_display = ('id', 'weather_event', 'community_system', 'order',)
    list_editable = ('order',)


@admin.register(OrganizationRisk)
class OrganizationRiskAdmin(admin.ModelAdmin):
    list_filter = ('organization__source', 'weather_event', 'community_system')
    list_select_related = ('organization', 'weather_event', 'community_system')
    ordering = ('organization__name', 'weather_event__name', 'community_system__name')
    search_fields = ('name', 'organization__name',)


@admin.register(OrganizationAction)
class OrganizationActionAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'name', 'visibility')
    list_editable = ('visibility',)
    list_filter = ('organization_risk__organization__source',
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

    # Need to select_related for Organization Risk or it will make entirely too many SQL queries
    # Unfortunately not straight-forward to do for FK fields
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        qs = form.base_fields["organization_risk"].queryset
        qs = qs.select_related("organization", "weather_event", "community_system")
        form.base_fields["organization_risk"].queryset = qs
        return form


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
