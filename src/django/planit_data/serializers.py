from collections import OrderedDict
from rest_framework import serializers

from action_steps.models import ActionCategory
from action_steps.serializers import ActionCategoryField
from planit_data.models import (
    CommunitySystem,
    Concern,
    OrganizationAction,
    OrganizationRisk,
    RelatedAdaptiveValue,
    WeatherEvent,
    WeatherEventRank,
)


class CommunitySystemSerializer(serializers.ModelSerializer):
    """Serialize community systems."""
    class Meta:
        model = CommunitySystem
        fields = ('id', 'name',)


class ConcernSerializer(serializers.ModelSerializer):
    """Serialize concerns."""
    indicator = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='name'
    )
    isRelative = serializers.BooleanField(source='is_relative')

    def to_representation(self, obj):
        if 'request' not in self.context:
            raise ValueError("Missing required 'request' context variable")
        if not self.context['request'].user.is_authenticated:
            raise ValueError("Requires authenticated user")
        organization = self.context['request'].user.primary_organization

        data = super().to_representation(obj)
        data.update(obj.calculate(organization))

        return data

    class Meta:
        model = Concern
        fields = ('id', 'indicator', 'isRelative',)


class WeatherEventSerializer(serializers.ModelSerializer):
    """Serialize weather events with only keys for related fields."""
    concern = serializers.PrimaryKeyRelatedField(
        many=False,
        queryset=Concern.objects.all()
    )
    coastalOnly = serializers.BooleanField(source='coastal_only')
    indicators = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    displayClass = serializers.CharField(source='display_class')

    class Meta:
        model = WeatherEvent
        fields = ('id', 'name', 'coastalOnly', 'concern', 'indicators', 'displayClass')


class WeatherEventWithConcernSerializer(WeatherEventSerializer):
    """Serialize weather events, with related concerns."""
    concern = ConcernSerializer()


class OrganizationRiskSerializer(serializers.ModelSerializer):
    """Serialize organization risks for viewing, with related models."""
    weatherEvent = WeatherEventSerializer(source='weather_event')
    communitySystem = CommunitySystemSerializer(source='community_system')

    impactMagnitude = serializers.ChoiceField(source='impact_magnitude',
                                              required=False, allow_blank=True, allow_null=True,
                                              choices=OrganizationRisk.Relative.CHOICES)
    impactDescription = serializers.CharField(source='impact_description',
                                              required=False, allow_blank=True, allow_null=True)
    adaptiveCapacity = serializers.ChoiceField(source='adaptive_capacity',
                                               required=False, allow_blank=True, allow_null=True,
                                               choices=OrganizationRisk.Relative.CHOICES)
    relatedAdaptiveValues = serializers.ListField(child=serializers.CharField(),
                                                  source='related_adaptive_values',
                                                  default=list, allow_null=True, required=False)
    adaptiveCapacityDescription = serializers.CharField(source='adaptive_capacity_description',
                                                        required=False, allow_blank=True,
                                                        allow_null=True)

    class Meta:
        model = OrganizationRisk
        fields = ('id', 'weatherEvent', 'communitySystem', 'probability', 'frequency',
                  'intensity', 'impactMagnitude', 'impactDescription', 'adaptiveCapacity',
                  'relatedAdaptiveValues', 'adaptiveCapacityDescription')


class WeatherEventField(serializers.PrimaryKeyRelatedField):
    """Custom serializer field that accepts the pk and returns the related model."""

    def to_representation(self, value):
        pk = super().to_representation(value)
        try:
            item = WeatherEvent.objects.get(pk=pk)
            serializer = WeatherEventSerializer(item)
            return serializer.data
        except WeatherEvent.DoesNotExist:
            return None

    def get_choices(self, cutoff=None):
        queryset = self.get_queryset()
        if queryset is None:
            return {}

        return OrderedDict([(item.id, str(item)) for item in queryset])


class CommunitySystemField(serializers.PrimaryKeyRelatedField):
    """Custom serializer field that accepts the pk and returns the related model."""

    def to_representation(self, value):
        pk = super().to_representation(value)
        try:
            item = CommunitySystem.objects.get(pk=pk)
            serializer = CommunitySystemSerializer(item)
            return serializer.data
        except CommunitySystem.DoesNotExist:
            return None

    def get_choices(self, cutoff=None):
        queryset = self.get_queryset()
        if queryset is None:
            return {}

        return OrderedDict([(item.id, str(item)) for item in queryset])


class WeatherEventWithConcernSerializer(WeatherEventSerializer):
    """Serialize weather events, with related concerns."""
    concern = ConcernSerializer()


class OrganizationRiskSerializer(serializers.ModelSerializer):
    """Serialize organization risks for viewing, with related models."""
    weatherEvent = WeatherEventField(
        many=False,
        queryset=WeatherEvent.objects.all(),
        source='weather_event'
    )
    communitySystem = CommunitySystemField(
        many=False,
        queryset=CommunitySystem.objects.all(),
        source='community_system'
    )
    action = serializers.PrimaryKeyRelatedField(
        many=False,
        source='organizationaction',
        read_only=True
    )

    impactMagnitude = serializers.ChoiceField(source='impact_magnitude',
                                              required=False, allow_blank=True,
                                              choices=OrganizationRisk.Relative.CHOICES)
    impactDescription = serializers.CharField(source='impact_description',
                                              required=False, allow_blank=True)
    adaptiveCapacity = serializers.ChoiceField(source='adaptive_capacity',
                                               required=False, allow_blank=True,
                                               choices=OrganizationRisk.Relative.CHOICES)
    relatedAdaptiveValues = serializers.ListField(child=serializers.CharField(),
                                                  source='related_adaptive_values',
                                                  default=list, required=False)
    adaptiveCapacityDescription = serializers.CharField(source='adaptive_capacity_description',
                                                        required=False, allow_blank=True)

    def create(self, validated_data):
        # Organization is implied from the request's user, not the data, so we use the
        # serializer's context to pass it through.
        if 'organization' not in self.context:
            raise ValueError("Missing required 'organization' context variable")
        organization = self.context['organization']
        return OrganizationRisk.objects.create(organization_id=organization, **validated_data)

    class Meta:
        model = OrganizationRisk
        fields = ('id', 'action', 'weatherEvent', 'communitySystem', 'probability', 'frequency',
                  'intensity', 'impactMagnitude', 'impactDescription', 'adaptiveCapacity',
                  'relatedAdaptiveValues', 'adaptiveCapacityDescription')


class OrganizationActionSerializer(serializers.ModelSerializer):
    risk = serializers.PrimaryKeyRelatedField(
        many=False,
        queryset=OrganizationRisk.objects.all(),
        source='organization_risk'
    )
    categories = ActionCategoryField(
        many=True,
        queryset=ActionCategory.objects.all()
    )
    actionType = serializers.CharField(source='action_type', required=False, allow_blank=True)
    actionGoal = serializers.CharField(source='action_goal', required=False, allow_blank=True)
    implementationDetails = serializers.CharField(
        source='implementation_details', required=False, allow_blank=True)
    implementationNotes = serializers.CharField(
        source='implementation_notes', required=False, allow_blank=True)
    improvementsAdaptiveCapacity = serializers.CharField(
        source='improvements_adaptive_capacity', required=False, allow_blank=True)
    immprovementsImpacts = serializers.CharField(
        source='immprovements_impacts', required=False, allow_blank=True)

    def validate_risk(self, value):
        if value.organization.id != self.context['organization']:
            raise serializers.ValidationError("Risk does not belong to user's organization")
        return value

    class Meta:
        model = OrganizationAction
        fields = ('id', 'risk', 'action', 'actionType', 'actionGoal',
                  'implementationDetails', 'visibility', 'implementationNotes',
                  'improvementsAdaptiveCapacity', 'immprovementsImpacts', 'collaborators',
                  'categories', 'funding')


class RelatedAdaptiveValueSerializer(serializers.ModelSerializer):

    class Meta:
        model = RelatedAdaptiveValue
        fields = ('name',)


class WeatherEventRankSerializer(serializers.ModelSerializer):
    """Serialize weather events by rank."""
    weatherEvent = WeatherEventWithConcernSerializer(source='weather_event')

    class Meta:
        model = WeatherEventRank
        fields = ('weatherEvent', 'order',)
