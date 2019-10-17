from django.contrib.gis.db import models
from django.db import IntegrityError
from django.db.models import CASCADE

from climate_api.wrapper import make_indicator_point_api_request

from .regions import GeoRegion
from .risks import WeatherEvent


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


class Concern(models.Model):
    """A configurable object used to intepret indicator results to convey anticipated changes.

    Each Concern maintains the information necessary to turn year-by-year projection data into a
    meaningful result like "3.4 more inches of rain/snow/sleet per year".
    """

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
        result = ConcernValue.objects.for_location(self, organization.location)
        return result.value, result.units

    def get_static_values(self):
        value = self.static_value if self.static_value else 0
        units = self.static_units if self.static_units and not self.is_relative else None
        return value, units

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Clear any potentially invalidated ConcernValue objects
        ConcernValue.objects.filter(concern=self).delete()


class ConcernValueManager(models.Manager):
    # Evaluate Concerns by averaging start and end values over a decade
    ERA_LENGTH = 10
    START_YEAR = 1990
    START_SCENARIO = 'historical'
    END_YEAR = 2025
    END_SCENARIO = 'RCP85'

    def for_location(self, concern, location):
        try:
            return next(value for value in location.concernvalue_set.all()
                        if value.concern_id == concern.id)
        except StopIteration:
            return self.create_concern_value(concern, location)

    def create_concern_value(self, concern, location):
        value, units = self.calculate_change(concern, location)
        try:
            return ConcernValue.objects.create(
                concern=concern,
                location=location,
                value=value,
                units=units
            )
        except IntegrityError:
            # Try to load the offending row. If this fails somehow, we want the exception to
            # bubble up.
            return location.concernvalue_set.get(concern=concern)

    def calculate_change(self, concern, location):
        start_avg, start_units = self.get_average_value(
            concern, location, self.START_SCENARIO, self.START_YEAR)

        if concern.is_relative and start_avg == 0:
            # If the starting value is 0, abort and retry again as absolute difference
            try:
                concern.is_relative = False
                return self.calculate_change(concern, location)
            finally:
                concern.is_relative = True

        end_avg, end_units = self.get_average_value(
            concern, location, self.END_SCENARIO, self.END_YEAR)
        assert(start_units == end_units)
        difference = end_avg - start_avg

        if concern.is_relative:
            return difference / start_avg, None
        else:
            return difference, start_units

    def get_average_value(self, concern, location, scenario, start_year):
        year_range = range(start_year, start_year + self.ERA_LENGTH)
        # Prefer LOCA dataset, but fall-back to NEX-GDDP if it's not supported
        dataset = 'LOCA' if 'LOCA' in location.datasets else 'NEX-GDDP'
        params = {
            'years': [year_range],
            'dataset': dataset
        }

        response = make_indicator_point_api_request(concern.indicator, location.point, scenario,
                                                    params=params)

        values = [v['avg'] for v in response['data'].values()]
        average = sum(values) / len(values)
        return average, response['units']


class ConcernValue(models.Model):
    concern = models.ForeignKey(Concern)
    location = models.ForeignKey('users.PlanItLocation')
    value = models.FloatField()
    units = models.CharField(max_length=32, null=True)

    objects = ConcernValueManager()

    class Meta:
        unique_together = [('concern', 'location')]


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
