from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models
from django.db.models import CASCADE

from planit_data.models import (CommunitySystem,
                                Indicator,
                                WeatherEvent)


class PlanItUser(AbstractUser):
    pass


class UserLocation(models.Model):
    geom = models.MultiPolygonField()
    user = models.ForeignKey(PlanItUser, on_delete=CASCADE, null=False)


class UserRisk(models.Model):
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)
    notes = models.TextField(null=False, blank=True, default='')
    location = models.ForeignKey(UserLocation, on_delete=CASCADE, null=False)
    community_system = models.ForeignKey(CommunitySystem, on_delete=CASCADE, null=False)
    weather_event = models.ForeignKey(WeatherEvent, on_delete=CASCADE, null=False)
    indicator = models.ForeignKey(Indicator, on_delete=CASCADE, null=False)
