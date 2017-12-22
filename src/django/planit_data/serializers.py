from rest_framework import serializers

from planit_data.models import (
    CommunitySystem,
    Concern,
    OrganizationRisk,
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
        fields = ('id', 'name', 'coastalOnly', 'indicators', 'displayClass')


class WeatherEventWithConcernSerializer(WeatherEventSerializer):
    """Serialize weather events, with related concerns."""
    concern = ConcernSerializer()


class OrganizationRiskSerializer(serializers.ModelSerializer):
    """Serialize organization risks for viewing, with related models."""
    weatherEvent = WeatherEventSerializer(source='weather_event')
    communitySystem = CommunitySystemSerializer(source='community_system')

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

    class Meta:
        model = OrganizationRisk
        fields = ('id', 'weatherEvent', 'communitySystem', 'probability', 'frequency',
                  'intensity', 'impactMagnitude', 'impactDescription', 'adaptiveCapacity',
                  'relatedAdaptiveValues', 'adaptiveCapacityDescription')


class OrganizationRiskCreateSerializer(OrganizationRiskSerializer):
    """Serializer for creating and updating risks.

    Takes ID for related weather event and community system.
    """
    weatherEvent = serializers.PrimaryKeyRelatedField(
        many=False,
        queryset=WeatherEvent.objects.all(),
        source='weather_event'
    )
    communitySystem = serializers.PrimaryKeyRelatedField(
        many=False,
        queryset=CommunitySystem.objects.all(),
        source='community_system'
    )

    def create(self, validated_data):
        # Pulling the organization from the request instead of as a serialized field
        # ensures that users can't modify a different organization's risks
        if 'request' not in self.context:
            raise ValueError("Missing required 'request' context variable")
        if not self.context['request'].user.is_authenticated:
            raise ValueError("Requires authenticated user")
        organization = self.context['request'].user.primary_organization

        return OrganizationRisk.objects.create(organization=organization, **validated_data)


class WeatherEventRankSerializer(serializers.ModelSerializer):
    """Serialize weather events by rank."""
    weatherEvent = WeatherEventWithConcernSerializer(source='weather_event')

    class Meta:
        model = WeatherEventRank
        fields = ('weatherEvent', 'order',)
