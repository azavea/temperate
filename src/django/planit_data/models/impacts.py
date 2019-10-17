from django.contrib.gis.db import models

from .regions import ClimateAssessmentRegion
from .risks import CommunitySystem, WeatherEvent


class Impact(models.Model):
    """
    An impact of climate change, that may have an associated impact indicator value or map layer.

    """
    name = models.CharField(max_length=256, unique=True)
    external_link = models.URLField(blank=True)
    community_systems = models.ManyToManyField(CommunitySystem, through='ImpactCommunitySystemRank')
    weather_events = models.ManyToManyField(WeatherEvent, through='ImpactWeatherEventRank')

    def __str__(self):
        return self.name


class ImpactCommunitySystemRank(models.Model):
    """A ranking of severity of impacts per georegion as they relate to community systems.

    These rankings are used by the "Top Impacts" feature of the app.
    """
    georegion = models.ForeignKey(ClimateAssessmentRegion, on_delete=models.CASCADE)
    community_system = models.ForeignKey(CommunitySystem, on_delete=models.CASCADE)
    impact = models.ForeignKey(Impact, on_delete=models.CASCADE)
    order = models.IntegerField()

    class Meta:
        unique_together = ('georegion', 'community_system', 'order')
        ordering = ['georegion', 'community_system', 'order']

    def __str__(self):
        return '{}: {}: {}'.format(self.georegion.name, self.order, self.community_system)


class ImpactWeatherEventRank(models.Model):
    """A ranking of severity of impacts per georegion as they relate to weather events.

    These rankings are used by the "Top Impacts" feature of the app.
    """
    georegion = models.ForeignKey(ClimateAssessmentRegion, on_delete=models.CASCADE)
    weather_event = models.ForeignKey(WeatherEvent, on_delete=models.CASCADE)
    impact = models.ForeignKey(Impact, on_delete=models.CASCADE)
    order = models.IntegerField()

    class Meta:
        unique_together = ('georegion', 'weather_event', 'order')
        ordering = ['georegion', 'weather_event', 'order']

    def __str__(self):
        return '{}: {}: {}'.format(self.georegion.name, self.order, self.weather_event)
