import logging

from django.contrib.gis.db import models
from django.db.models import CASCADE

from climate_api.wrapper import make_indicator_api_request

logger = logging.getLogger(__name__)


class GeoRegionManager(models.Manager):

    def get_for_point(self, point):
        return self.get_queryset().get(geom__intersects=point)


class GeoRegion(models.Model):
    """A user-agnostic, arbitrary region of interest."""
    name = models.CharField(max_length=256, blank=False, null=False)
    geom = models.MultiPolygonField()

    objects = GeoRegionManager()

    def __str__(self):
        return self.name


class CommunitySystem(models.Model):
    """A group of people, structures or assets that could be affected by climate change.

    Examples include:
    - Hospitals
    - Energy delivery
    - Food supply

    """
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)

    def __str__(self):
        return self.name


class WeatherEvent(models.Model):
    """A natural event that could be affected by climate change.

    Examples include:
    - Storm surge from a hurricane
    - River flood
    - Insect infestation

    """
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)
    coastal_only = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Indicator(models.Model):
    """A derived aggregate computation that provides some form of climate insight.

    See https://docs.climate.azavea.com/indicators.html for some concrete examples

    """
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)
    label = models.CharField(max_length=512, blank=False, null=False)
    description = models.TextField(blank=True, null=False, default='')

    def __str__(self):
        return self.name


class RiskTemplate(models.Model):
    """A generic template for a Climate Risk, not attached to any particular app user.
    When a user requests insight about a particular location in the app, these templates
    are used to generate new user-specific UserRisk objects that the user can then
    modify directly.
    """
    community_system = models.ManyToManyField('CommunitySystem', related_name='risk', blank=True)
    weather_event = models.ForeignKey(WeatherEvent, null=False)
    indicator = models.ManyToManyField('Indicator', related_name='climate_risk', blank=True)
    regions = models.ManyToManyField('GeoRegion', related_name='risk')

    def __str__(self):
        return '{}'.format(self.weather_event)


class Concern(models.Model):
    """A configurable object used to intepret indicator results to convey anticipated changes.

    Each Concern maintains the information necessary to turn year-by-year projection data into a
    meaningful result like "3.4 more inches of rain/snow/sleet per year".
    """

    # Evaluate Concerns by averaging start and end values over a decade
    ERA_LENGTH = 10
    START_YEAR = 1990
    START_SCENARIO = 'historical'
    END_YEAR = 2050
    END_SCENARIO = 'RCP85'

    indicator = models.OneToOneField(Indicator, on_delete=CASCADE, null=False)
    tagline_positive = models.CharField(max_length=256, blank=False, null=False)
    tagline_negative = models.CharField(max_length=256, blank=False, null=False)
    is_relative = models.BooleanField(default=False)

    def __str__(self):
        return '{} - {}'.format(self.indicator, self.tagline_positive)

    def calculate(self, city_id):
        start_avg = self.get_average_value(city_id, self.START_SCENARIO, self.START_YEAR)
        end_avg = self.get_average_value(city_id, self.END_SCENARIO, self.END_YEAR)

        difference = end_avg - start_avg
        if self.is_relative:
            return difference / start_avg
        else:
            return difference

    def tagline(self, city_id):
        value = self.calculate(city_id)
        if value >= 0:
            return self.tagline_positive
        else:
            return self.tagline_negative

    def get_average_value(self, city_id, scenario, start_year):
        year_range = range(start_year, start_year + self.ERA_LENGTH)

        response = make_indicator_api_request(self.indicator, city_id, scenario,
                                              params={'years': [year_range]})

        values = (result['avg'] for result in response['data'].values())
        return sum(values) / len(response['data'])


class WeatherEventRank(models.Model):
    """A ranking of severity of weather events per georegion.

    This model holds the default rankings for all organizations, which are used by the
    "Top Concerns" feature of the app.

    """
    georegion = models.ForeignKey(GeoRegion, null=False)
    weather_event = models.ForeignKey(WeatherEvent)
    order = models.IntegerField()

    class Meta:
        unique_together = (('georegion', 'order'),
                           ('georegion', 'weather_event'))
        ordering = ['georegion', 'order']

    def __str__(self):
        return '{}: {}: {}'.format(self.georegion.name, self.order, self.weather_event)
