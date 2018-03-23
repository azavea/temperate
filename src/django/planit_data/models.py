import logging
import uuid

from django.contrib.gis.db import models
from django.db import connection, transaction
from django.db.models import CASCADE, SET_NULL
from django.contrib.postgres.fields import ArrayField

from climate_api.wrapper import make_indicator_api_request
from action_steps.models import ActionCategory

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
    display_class = models.CharField(max_length=128, blank=True, default='')

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
    concern = models.ForeignKey('Concern', on_delete=SET_NULL, null=True, blank=True)
    indicators = models.ManyToManyField('Indicator', related_name='weather_events', blank=True)
    community_systems = models.ManyToManyField('CommunitySystem', through='DefaultRisk')
    display_class = models.CharField(max_length=128, blank=True, default='')
    description = models.TextField(blank=True, null=False, default='')

    def __str__(self):
        return self.name


class IndicatorManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class Indicator(models.Model):
    """A derived aggregate computation that provides some form of climate insight.

    See https://docs.climate.azavea.com/indicators.html for some concrete examples

    """
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)
    label = models.CharField(max_length=512, blank=False, null=False)
    description = models.TextField(blank=True, null=False, default='')

    objects = IndicatorManager()

    def __str__(self):
        return self.name

    def natural_key(self):
        return (self.name,)


class DefaultRisk(models.Model):
    """A through model used to relate WeatherEvent to a list of ordered CommunitySytems.

    Used to populate the starting list of risks when an Organization is created
    """

    weather_event = models.ForeignKey('WeatherEvent', null=False, blank=False)
    community_system = models.ForeignKey('CommunitySystem', null=False, blank=False)
    order = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = (('weather_event', 'community_system'), ('weather_event', 'order'))
        ordering = ['weather_event', 'order', 'community_system']

    def __str__(self):
        return "{} on {}".format(self.weather_event.name, self.community_system.name)


class OrganizationRisk(models.Model):
    """An evaluation of the risk a weather event poses on a community system.

    Organizations assess the impact of weather events to community systems and
    their adaptive capacity
    """

    class Directional:
        UNSURE = 'unsure'
        DECREASING = 'decreasing'
        NO_CHANGE = 'no change'
        INCREASING = 'increasing'

        CHOICES = (
            (UNSURE, 'Unsure'), (DECREASING, 'Decreasing'), (NO_CHANGE, 'No change'),
            (INCREASING, 'Increasing'),
        )

    class Relative:
        UNSURE = 'unsure'
        LOW = 'low'
        MODERATELY_LOW = 'mod low'
        MODERATE = 'moderate'
        MODERATELY_HIGH = 'mod high'
        HIGH = 'high'

        CHOICES = (
            (UNSURE, 'Unsure'), (LOW, 'Low'), (MODERATELY_LOW, 'Moderately low'),
            (MODERATE, 'Moderate'), (MODERATELY_HIGH, 'Moderately high'), (HIGH, 'High')
        )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    weather_event = models.ForeignKey('WeatherEvent', null=True, blank=True, default=None,
                                      on_delete=models.CASCADE)
    community_system = models.ForeignKey('CommunitySystem', null=True, blank=True, default=None,
                                         on_delete=models.CASCADE)
    organization = models.ForeignKey('users.PlanItOrganization', null=False, blank=False,
                                     on_delete=models.CASCADE)

    probability = models.CharField(max_length=16, blank=True, choices=Relative.CHOICES)
    frequency = models.CharField(max_length=16, blank=True, choices=Directional.CHOICES)
    intensity = models.CharField(max_length=16, blank=True, choices=Directional.CHOICES)

    impact_magnitude = models.CharField(max_length=16, blank=True, choices=Relative.CHOICES)
    impact_description = models.TextField(blank=True)

    adaptive_capacity = models.CharField(max_length=16, blank=True, choices=Relative.CHOICES)
    related_adaptive_values = ArrayField(models.CharField(max_length=150), default=list)
    adaptive_capacity_description = models.TextField(blank=True)

    class Meta:
        unique_together = ('weather_event', 'community_system', 'organization')

    def __str__(self):
        return "{}: {} on {}".format(
            self.organization.name,
            str(self.weather_event or "Any"),
            str(self.community_system or "Any"))


class OrganizationAction(models.Model):
    """A record of planned or potential adaptation actions an organization may take."""

    SINGLELINE_MAX_LENGTH = 1024

    class Visibility:
        PUBLIC = 'public'
        PRIVATE = 'private'

        CHOICES = (
            (PUBLIC, 'Public'),
            (PRIVATE, 'Private'),
        )

    id = models.UUIDField(primary_key=True,
                          default=uuid.uuid4,
                          editable=False)
    organization_risk = models.ForeignKey(OrganizationRisk, null=False, on_delete=models.CASCADE)
    name = models.CharField(max_length=SINGLELINE_MAX_LENGTH)
    action_type = models.CharField(max_length=SINGLELINE_MAX_LENGTH, blank=True)
    action_goal = models.CharField(max_length=SINGLELINE_MAX_LENGTH, blank=True)
    implementation_details = models.TextField(blank=True)
    visibility = models.CharField(max_length=16, blank=True,
                                  choices=Visibility.CHOICES, default=Visibility.PRIVATE)
    implementation_notes = models.TextField(blank=True)
    improvements_adaptive_capacity = models.TextField(blank=True)
    improvements_impacts = models.TextField(blank=True)
    collaborators = ArrayField(base_field=models.CharField(max_length=SINGLELINE_MAX_LENGTH,
                                                           blank=True), default=list)
    categories = models.ManyToManyField(ActionCategory,
                                        related_name='organization_actions',
                                        blank=True)
    funding = models.TextField(blank=True)

    def __str__(self):
        return str(self.organization_risk)


class Concern(models.Model):
    """A configurable object used to intepret indicator results to convey anticipated changes.

    Each Concern maintains the information necessary to turn year-by-year projection data into a
    meaningful result like "3.4 more inches of rain/snow/sleet per year".
    """

    # Evaluate Concerns by averaging start and end values over a decade
    ERA_LENGTH = 10
    START_YEAR = 1990
    START_SCENARIO = 'historical'
    END_YEAR = 2025
    END_SCENARIO = 'RCP85'

    indicator = models.OneToOneField(Indicator, on_delete=CASCADE, blank=True, null=True)
    tagline_positive = models.CharField(max_length=256, blank=False, null=False)
    tagline_negative = models.CharField(max_length=256, blank=False, null=False)
    is_relative = models.BooleanField(default=False)
    # If indicator is null, display any set static value + unit with the normal
    #  positive/negative tagline instead
    static_value = models.FloatField(blank=True, null=True)
    static_units = models.CharField(max_length=16, blank=True, default='')

    def __str__(self):
        return '{} - {}'.format(self.indicator, self.tagline_positive)

    def calculate(self, organization):
        # Calculate data via indicator if we have one
        if self.indicator is not None:
            value, units = self.get_calculated_values(organization)
        # Otherwise use a static value + units
        else:
            value, units = self.get_static_values()
        tagline = self.tagline_positive if value >= 0 else self.tagline_negative

        return {
            'value': value,
            'tagline': tagline,
            'units': units,
        }

    def get_calculated_values(self, organization):
        start_avg, start_units = self.get_average_value(
            organization, self.START_SCENARIO, self.START_YEAR)

        if self.is_relative and start_avg == 0:
            # If the starting value is 0, abort and retry again as absolute difference
            try:
                self.is_relative = False
                return self.get_calculated_values(organization)
            finally:
                self.is_relative = True

        end_avg, end_units = self.get_average_value(organization, self.END_SCENARIO, self.END_YEAR)
        assert(start_units == end_units)
        difference = end_avg - start_avg

        if self.is_relative:
            return difference / start_avg, None
        else:
            return difference, start_units

    def get_static_values(self):
        value = self.static_value if self.static_value else 0
        units = self.static_units if self.static_units and not self.is_relative else None
        return value, units

    def get_average_value(self, organization, scenario, start_year):
        city_id = organization.location.api_city_id
        year_range = range(start_year, start_year + self.ERA_LENGTH)
        params = {'years': [year_range]}

        response = make_indicator_api_request(self.indicator, city_id, scenario,
                                              params=params)

        values = response['data'].values()
        average = sum(v['avg'] for v in values) / len(values)
        return average, response['units']


class RelatedAdaptiveValue(models.Model):
    """An enhancement or challenge to a city's overall adaptive capacity.

    Used to provide default values for OrganizationRisk.related_adaptive_values

    Examples include:
    - Access to basic services
    - Housing
    - Community engagement

    """
    name = models.CharField(max_length=256, unique=True, blank=False, null=False)

    def __str__(self):
        return self.name


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


class OrganizationWeatherEvent(models.Model):
    """Organization specific ranked weather events.

    To preserve user data, deleting an instance of this model will not delete any related
    OrganizationRisk objects.

    """
    organization = models.ForeignKey('users.PlanItOrganization', related_name='weather_events')
    weather_event = models.ForeignKey(WeatherEvent)
    order = models.IntegerField()

    def save(self, *args, **kwargs):
        if self.order is None:
            # Lock table to avoid race condition where two instances saved at about
            # the same time can end up attempting to save with the same order value
            with transaction.atomic(), connection.cursor() as cursor:
                lock_query = 'LOCK TABLE {} IN ACCESS EXCLUSIVE MODE'.format(
                    self._meta.db_table)
                cursor.execute(lock_query)

                self._assign_default_order()
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    def _assign_default_order(self):
        """Assign a simple default order such that new objects are inserted at end of list.

        When no order is provided. We'll need to address this differently if we ever want the user
        to be able to re-order their top concerns in the app UI.

        """
        last = (OrganizationWeatherEvent.objects.filter(organization=self.organization)
                                                .order_by('order')
                                                .last())
        self.order = last.order + 1 if last is not None else 1

    class Meta:
        unique_together = (('organization', 'order'),
                           ('organization', 'weather_event'))
        ordering = ['organization', 'order']

    def __str__(self):
        return '{}: {}: {}'.format(self.organization.name, self.order, self.weather_event)
