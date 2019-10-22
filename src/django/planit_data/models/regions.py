from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField


class GeoRegionManager(models.Manager):

    def get_for_point(self, point):
        return self.get_queryset().get(geom__intersects=point)


class GeoRegion(models.Model):
    """Geometries for the national climate assessment regions, version 3."""
    name = models.CharField(max_length=256, blank=False, null=False)
    geom = models.MultiPolygonField()

    objects = GeoRegionManager()

    def __str__(self):
        return self.name


class ClimateAssessmentRegion(models.Model):
    """Geometries for the national climate assessment regions, version 4.

    The 'indicators' field has related indicator data, from various sources.
    """
    name = models.CharField(max_length=256, blank=False, null=False)
    geom = models.MultiPolygonField()
    indicators = JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name


class CountyManager(GeoRegionManager):

    def get_state_fips(self, org):
        if org.bounds:
            org_counties = self.get_queryset().filter(geom__intersects=org.bounds)
        else:
            org_counties = self.get_queryset().filter(geom__contains=org.location.point)
        return org_counties.distinct().values_list('state_fips', flat=True)


class County(models.Model):
    """Geometries for US counties.

    The 'indicators' field has related indicator data, from various sources.
    """
    name = models.CharField(max_length=256, blank=False, null=False)
    state_fips = models.CharField(max_length=2, blank=False, null=False)
    geoid = models.CharField(max_length=5, blank=False, null=False)
    geom = models.MultiPolygonField()
    indicators = JSONField(default=dict)

    objects = CountyManager()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'counties'
