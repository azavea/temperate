from django.contrib.gis.db import models
from django.db.models import CASCADE

from users.models import PlanItUser


class GeoRegion(models.Model):
    name = models.CharField(max_length=256, blank=False, null=False)
    geom = models.MultiPolygonField()

    def __str__(self):
        return self.name


class CommunitySystem(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)

    def __str__(self):
        return self.name


class WeatherEvent(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)

    def __str__(self):
        return self.name


class Indicator(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)
    label = models.CharField(max_length=512, blank=False, null=False)
    description = models.TextField(blank=True, null=False, default='')

    def __str__(self):
        return self.name


class RiskTemplate(models.Model):
    community_system = models.ForeignKey(CommunitySystem, on_delete=CASCADE, null=False)
    weather_event = models.ForeignKey(WeatherEvent, on_delete=CASCADE, null=False)
    indicator = models.ForeignKey(Indicator, on_delete=CASCADE, null=False)
    regions = models.ManyToManyField('GeoRegion', related_name='risk')

    def __str__(self):
        return '{}, {}, {}'.format(self.community_system, self.weather_event, self.indicator)


class UserLocation(models.Model):
    name = models.CharField(max_length=256, blank=False, null=False)
    geom = models.MultiPolygonField()
    user = models.ForeignKey(PlanItUser, on_delete=CASCADE, null=False)

    def __str__(self):
        return self.name


class UserRisk(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)
    notes = models.TextField(null=False, blank=True, default='')
    location = models.ForeignKey(UserLocation, on_delete=CASCADE, null=False)
    community_system = models.ForeignKey(CommunitySystem, on_delete=CASCADE, null=False)
    weather_event = models.ForeignKey(WeatherEvent, on_delete=CASCADE, null=False)
    indicator = models.ForeignKey(Indicator, on_delete=CASCADE, null=False)

    def __str__(self):
        return '{}: {}'.format(self.location.user, self.name)
