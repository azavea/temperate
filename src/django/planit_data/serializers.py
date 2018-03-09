from collections import OrderedDict
from rest_framework import serializers

from action_steps.models import ActionCategory
from action_steps.serializers import ActionCategoryField
from planit_data.models import (
    CommunitySystem,
    Concern,
    OrganizationAction,
    OrganizationRisk,
    OrganizationWeatherEvent,
    RelatedAdaptiveValue,
    WeatherEvent,
)
from users.models import PlanItOrganization
from planit.fields import OneWayPrimaryKeyRelatedField


class CommunitySystemSerializer(serializers.ModelSerializer):
    """Serialize community systems."""
    class Meta:
        model = CommunitySystem
        fields = ('id', 'name', 'display_class',)


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


class WeatherEventField(OneWayPrimaryKeyRelatedField):
    """Custom serializer field that accepts the pk and returns the related model."""
    serializer = WeatherEventSerializer
    queryset = WeatherEvent.objects.all()


class CommunitySystemField(OneWayPrimaryKeyRelatedField):
    """Custom serializer field that accepts the pk and returns the related model."""
    serializer = CommunitySystemSerializer
    queryset = CommunitySystem.objects.all()


class WeatherEventWithConcernSerializer(WeatherEventSerializer):
    """Serialize weather events, with related concerns."""
    concern = ConcernSerializer()


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


class OrganizationRiskSerializer(serializers.ModelSerializer):
    """Serialize organization risks for viewing, with related models.

    Only show 1 action for MVP even though Risk:Action is 1:M."""
    weather_event = WeatherEventField(
        many=False,
        queryset=WeatherEvent.objects.all(),
    )
    community_system = CommunitySystemField(
        many=False,
        queryset=CommunitySystem.objects.all(),
    )

    action = serializers.SerializerMethodField()

    organization = serializers.PrimaryKeyRelatedField(
        many=False,
        queryset=PlanItOrganization.objects.all(),
        write_only=True
    )

    def get_action(self, obj):
        try:
            # Need to convert the queryset into a list because prefetch_related causes the related
            # manager's all() to return a non-iterable QuerySet
            action = list(obj.organizationaction_set.all())[0]
            return OrganizationActionSerializer(action).data
        except IndexError:
            return None

    class Meta:
        model = OrganizationRisk
        fields = ('id', 'action', 'weather_event', 'community_system', 'probability',
                  'frequency', 'intensity', 'impact_magnitude', 'impact_description',
                  'adaptive_capacity', 'related_adaptive_values', 'adaptive_capacity_description',
                  'organization')
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=OrganizationRisk.objects.all(),
                fields=('organization', 'weather_event', 'community_system'),
                message='There is already a Risk for this Hazard and Community System'
            )
        ]


class OrganizationWeatherEventSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        many=False,
        queryset=PlanItOrganization.objects.all(),
        write_only=True
    )
    weather_event = WeatherEventField(
        many=False,
        queryset=WeatherEvent.objects.all(),
    )
    order = serializers.IntegerField(read_only=True)

    class Meta:
        model = OrganizationWeatherEvent
        fields = ('id', 'organization', 'weather_event', 'order',)
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=OrganizationWeatherEvent.objects.all(),
                fields=('organization', 'weather_event',),
                message='There is already a OrganizationWeatherEvent for this Organization ' +
                        'and WeatherEvent'
            )
        ]


class SuggestedActionSerializer(serializers.ModelSerializer):
    categories = ActionCategoryField(
        many=True,
        read_only=True
    )
    plan_city = serializers.SerializerMethodField()
    plan_due_date = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()
    plan_hyperlink = serializers.SerializerMethodField()

    def get_plan_city(self, obj):
        return str(obj.organization_risk.organization.location)

    def get_plan_due_date(self, obj):
        return obj.organization_risk.organization.plan_due_date

    def get_plan_name(self, obj):
        return obj.organization_risk.organization.plan_name

    def get_plan_hyperlink(self, obj):
        return obj.organization_risk.organization.plan_hyperlink

    class Meta:
        model = OrganizationAction
        fields = ('id', 'name', 'categories', 'plan_city', 'plan_due_date', 'plan_name',
                  'plan_hyperlink', 'action_type', 'action_goal', 'implementation_details',
                  'implementation_notes', 'improvements_adaptive_capacity',
                  'improvements_impacts', 'collaborators', 'categories')


class RelatedAdaptiveValueSerializer(serializers.ModelSerializer):

    class Meta:
        model = RelatedAdaptiveValue
        fields = ('name',)


class OrganizationWeatherEventRankSerializer(serializers.ModelSerializer):
    """Serialize weather events by rank."""
    weather_event = WeatherEventWithConcernSerializer()

    class Meta:
        model = OrganizationWeatherEvent
        fields = ('weather_event', 'order',)
