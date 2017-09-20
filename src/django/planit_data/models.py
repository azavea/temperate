from django.contrib.gis.db import models
from django.db.models import CASCADE


class GeoRegion(models.Model):
    geom = models.MultiPolygonField()


class CommunitySystem(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)


class WeatherEvent(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)


class Indicator(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)
    label = models.CharField(max_length=512, blank=False, null=False)
    description = models.TextField(blank=True, null=False, default='')


class RiskTemplate(models.Model):
    community_system = models.ForeignKey(CommunitySystem, on_delete=CASCADE, null=False)
    weather_event = models.ForeignKey(WeatherEvent, on_delete=CASCADE, null=False)
    indicator = models.ForeignKey(Indicator, on_delete=CASCADE, null=False)
    regions = models.ManyToManyField('GeoRegion', related_name='risk')
