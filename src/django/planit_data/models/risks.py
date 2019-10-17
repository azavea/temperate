import uuid

from django.contrib.gis.db import models
from django.db.models import SET_NULL
from django.contrib.postgres.fields import ArrayField

from action_steps.models import ActionCategory


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
        REQUEST_PUBLIC = 'request'
        PRIVATE = 'private'

        CHOICES = (
            (PUBLIC, 'Public'),
            (REQUEST_PUBLIC, 'Requested Public'),
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
