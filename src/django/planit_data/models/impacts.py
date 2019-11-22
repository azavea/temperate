from django.contrib.gis.db import models
from django.core.validators import RegexValidator

from .regions import County, ClimateAssessmentRegion
from .risks import CommunitySystem, WeatherEvent


class Impact(models.Model):
    """
    An impact of climate change, that may have an associated impact indicator value or map layer.
    """

    class Region:
        COUNTY = 'county'
        NCA_REGION = 'nca'

        CHOICES = (
            (COUNTY, 'County'),
            (NCA_REGION, 'National Climate Assessment region'),
        )

    label = models.CharField(max_length=256, unique=True)
    external_download_link = models.URLField(blank=True)
    community_systems = models.ManyToManyField(CommunitySystem, through='ImpactCommunitySystemRank')
    weather_events = models.ManyToManyField(WeatherEvent, through='ImpactWeatherEventRank')

    # Optional values used for calculating impact indicators
    tagline_positive = models.CharField(max_length=256, blank=True)
    tagline_negative = models.CharField(max_length=256, blank=True)
    tagline_no_change = models.CharField(max_length=256, blank=True)
    attribute = models.CharField(max_length=256, blank=True)
    region = models.CharField(max_length=10, choices=Region.CHOICES, blank=True)

    class Meta:
        ordering = ['label']

    def tagline(self, organization):
        region = self._get_region(organization)
        if region is None or self.attribute not in region.indicators:
            return None

        indicator_data = region.indicators[self.attribute]
        indicator_data['region_name'] = region.name

        if indicator_data['value'] > 0:
            tagline = self.tagline_positive
        elif indicator_data['value'] < 0:
            tagline = self.tagline_negative
            indicator_data['value'] = -indicator_data['value']
        else:
            tagline = self.tagline_no_change

        return tagline.format(**indicator_data)

    def _get_region(self, organization):
        point = organization.location.point
        if self.region == Impact.Region.COUNTY:
            try:
                return County.objects.get(geom__contains=point)
            except County.DoesNotExist:
                return None
        elif self.region == Impact.Region.NCA_REGION:
            try:
                return ClimateAssessmentRegion.objects.get(geom__contains=point)
            except ClimateAssessmentRegion.DoesNotExist:
                return None
        return None

    def __str__(self):
        return self.label


class ImpactMapLayer(models.Model):
    """
    An impact visualized through a map layer
    """

    class LayerType:
        COUNTY_GEOJSON = "county"
        IMAGE_ARCGIS_REST = "arcgis"
        VECTOR_TILE = "vectortile"
        ALL = [
            (COUNTY_GEOJSON, COUNTY_GEOJSON),
            (IMAGE_ARCGIS_REST, IMAGE_ARCGIS_REST),
            (VECTOR_TILE, VECTOR_TILE),
        ]

    impact = models.OneToOneField(Impact, on_delete=models.CASCADE, related_name='map_layer')
    layer_type = models.CharField(max_length=20, choices=LayerType.ALL)
    attribution = models.CharField(max_length=256)
    url = models.URLField(blank=True)
    attribute = models.CharField(max_length=256, blank=True)
    max_zoom = models.IntegerField(blank=True, null=True)
    show_borders_at = models.IntegerField(blank=True, null=True)
    external_link = models.URLField(blank=True)
    state_fips = models.CharField(max_length=2, blank=True, default='')

    def __str__(self):
        return self.impact.label


class ImpactMapLegendRow(models.Model):
    impact_layer = models.ForeignKey(ImpactMapLayer, related_name='legend',
                                     on_delete=models.CASCADE)
    color = models.CharField(max_length=7,
                             validators=[RegexValidator(r"^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$")])
    label = models.CharField(max_length=100, blank=True)
    min_value = models.IntegerField(blank=True, null=True)
    max_value = models.IntegerField(blank=True, null=True)
    order = models.IntegerField()

    class Meta:
        ordering = ['impact_layer', 'order']

    def __str__(self):
        return '{} {}'.format(self.impact_layer, self.color)


class ImpactCommunitySystemRank(models.Model):
    """A ranking of severity of impacts per georegion as they relate to community systems.

    These rankings are used by the "Top Impacts" feature of the app.
    """
    georegion = models.ForeignKey(ClimateAssessmentRegion, on_delete=models.CASCADE)
    community_system = models.ForeignKey(CommunitySystem, on_delete=models.CASCADE)
    impact = models.ForeignKey(Impact, on_delete=models.CASCADE,
                               related_name='community_system_ranks')
    order = models.IntegerField()

    class Meta:
        unique_together = ('georegion', 'community_system', 'order')
        ordering = ['georegion', 'community_system']

    def __str__(self):
        return '{}: {}: {}'.format(self.georegion.name, self.order, self.community_system)


class ImpactWeatherEventRank(models.Model):
    """A ranking of severity of impacts per georegion as they relate to weather events.

    These rankings are used by the "Top Impacts" feature of the app.
    """
    georegion = models.ForeignKey(ClimateAssessmentRegion, on_delete=models.CASCADE)
    weather_event = models.ForeignKey(WeatherEvent, on_delete=models.CASCADE)
    impact = models.ForeignKey(Impact, on_delete=models.CASCADE,
                               related_name='weather_event_ranks')
    order = models.IntegerField()

    class Meta:
        unique_together = ('georegion', 'weather_event', 'order')
        ordering = ['georegion', 'weather_event']

    def __str__(self):
        return '{}: {}: {}'.format(self.georegion.name, self.order, self.weather_event)
