import logging

from django.contrib.gis.db import models
from django.db.models import CASCADE

from climate_api.utils import IMPERIAL_TO_METRIC
from climate_api.wrapper import make_indicator_api_request, make_token_api_request

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
    concern = models.ForeignKey('Concern', null=True, blank=True)
    indicators = models.ManyToManyField('Indicator', related_name='weather_events', blank=True)
    community_systems = models.ManyToManyField('CommunitySystem', through='DefaultRisk')

    DISPLAY_CHOICES = (
        ('precipitation', 'Precipitation'),
        ('heat', 'Heat'),
        ('extreme-events', 'Extreme Events')
    )
    display_class = models.CharField(max_length=32, choices=DISPLAY_CHOICES)

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


class DefaultRisk(models.Model):
    """A through model used to relate WeatherEvent to a list of ordered CommunitySytems.

    Used to populate the starting list of risks when an Organization is created
    """

    weather_event = models.ForeignKey('WeatherEvent', null=False, blank=False)
    community_system = models.ForeignKey('CommunitySystem', null=False, blank=False)
    order = models.IntegerField()

    class Meta:
        unique_together = (('weather_event', 'community_system'), ('weather_event', 'order'))
        ordering = ['weather_event', 'order']


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

    def calculate(self, organization):
        city_id = organization.location.api_city_id
        units = self.get_units(organization)

        start_avg = self.get_average_value(city_id, self.START_SCENARIO, self.START_YEAR, units)
        end_avg = self.get_average_value(city_id, self.END_SCENARIO, self.END_YEAR, units)
        difference = end_avg - start_avg

        value = difference / start_avg if self.is_relative else difference
        tagline = self.tagline_positive if value >= 0 else self.tagline_negative

        return {
            'value': value,
            'tagline': tagline,
            'units': units,
        }

    def get_average_value(self, city_id, scenario, start_year, units=None):
        year_range = range(start_year, start_year + self.ERA_LENGTH)
        params = {'years': [year_range]}
        if units is not None:
            params['units'] = units

        response = make_indicator_api_request(self.indicator, city_id, scenario,
                                              params=params)

        values = (result['avg'] for result in response['data'].values())
        return sum(values) / len(response['data'])

    def get_units(self, organization):
        # If the value is relative, we can use the default unit for calculations
        # which will save an API call
        if self.is_relative:
            return None

        # Delayed import to break circular dependency
        from users.models import PlanItOrganization
        response = make_token_api_request('api/indicator/{}/'.format(self.indicator))
        default_units = response['default_units']

        # The API default units are either Imperial or don't need to be converted
        if default_units not in IMPERIAL_TO_METRIC:
            return default_units
        if organization.units == PlanItOrganization.IMPERIAL:
            return default_units
        return IMPERIAL_TO_METRIC[default_units]


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
