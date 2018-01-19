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
        fields = ('id', 'indicator', 'is_relative',)


class WeatherEventSerializer(serializers.ModelSerializer):
    """Serialize weather events with only keys for related fields."""
    concern = serializers.PrimaryKeyRelatedField(
        many=False,
        queryset=Concern.objects.all()
    )
    indicators = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = WeatherEvent
        fields = ('id', 'name', 'coastal_only', 'concern', 'indicators', 'display_class')


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
    weather_event = WeatherEventField(
        many=False,
        queryset=WeatherEvent.objects.all(),
    )
    community_system = CommunitySystemField(
        many=False,
        queryset=CommunitySystem.objects.all(),
    )
    action = serializers.PrimaryKeyRelatedField(
        many=False,
        source='organizationaction',
        read_only=True
    )

    def create(self, validated_data):
        # Organization is implied from the request's user, not the data, so we use the
        # serializer's context to pass it through.
        if 'organization' not in self.context:
            raise ValueError("Missing required 'organization' context variable")
        organization = self.context['organization']
        return OrganizationRisk.objects.create(organization_id=organization, **validated_data)

    class Meta:
        model = OrganizationRisk
        fields = ('id', 'action', 'weather_event', 'community_system', 'probability', 'frequency',
                  'intensity', 'impact_magnitude', 'impact_description', 'adaptive_capacity',
                  'related_adaptive_values', 'adaptive_capacity_description')


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

    def validate_risk(self, value):
        if value.organization.id != self.context['organization']:
            raise serializers.ValidationError("Risk does not belong to user's organization")
        return value

    class Meta:
        model = OrganizationAction
        fields = ('id', 'risk', 'name', 'action_type', 'action_goal',
                  'implementation_details', 'visibility', 'implementation_notes',
                  'improvements_adaptive_capacity', 'improvements_impacts', 'collaborators',
                  'categories', 'funding')


class RelatedAdaptiveValueSerializer(serializers.ModelSerializer):

    class Meta:
        model = RelatedAdaptiveValue
        fields = ('name',)


class WeatherEventRankSerializer(serializers.ModelSerializer):
    """Serialize weather events by rank."""
    weather_event = WeatherEventWithConcernSerializer()

    class Meta:
        model = WeatherEventRank
        fields = ('weather_event', 'order',)
