from rest_framework import serializers
from rest_framework.compat import unicode_to_repr

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


def get_org_from_context(context):
    """Get current user's primarary organization from the request context.

    Used when serializing data filtered to current user's organization.
    """
    if not context or 'request' not in context:
        raise ValueError("Missing required 'request' context variable")
    if not context['request'].user or not context['request'].user.is_authenticated:
        raise ValueError("Requires authenticated user")
    user = context['request'].user
    return user.primary_organization if hasattr(user, 'primary_organization') else None


class OrganizationDefault(object):
    """Support using current user's primrary organization as a default.
    Find current user on context, then use their primary org as the org default.

    Based on DRF `CurrentUserDefault`:
    http://www.django-rest-framework.org/api-guide/validators/#currentuserdefault
    """
    def set_context(self, serializer_field):
        self.organization = get_org_from_context(serializer_field.context)

    def __call__(self):
        return self.organization

    def __repr__(self):
        return unicode_to_repr('%s()' % self.__class__.__name__)


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
        organization = get_org_from_context(self.context)

        data = super().to_representation(obj)
        data.update(obj.calculate(organization))

        return data

    class Meta:
        model = Concern
        fields = ('id', 'indicator', 'is_relative',)


class ConcernField(OneWayPrimaryKeyRelatedField):
    """Custom serializer field that accepts the pk and returns the related model."""
    serializer = ConcernSerializer
    queryset = Concern.objects.all()


class WeatherEventSerializer(serializers.ModelSerializer):
    """Serialize weather events with only keys for related fields."""
    concern = ConcernField()
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


class RiskPKField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self):
        organization = get_org_from_context(self.context)
        queryset = OrganizationRisk.objects.filter(organization=organization)
        return queryset.select_related(
            'organization__location',
            'weather_event',
            'community_system'
        )


class OrganizationPKField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self):
        user = self.context['request'].user
        return PlanItOrganization.objects.filter(
            users=user
        ).select_related(
            'location'
        )


class OrganizationActionSerializer(serializers.ModelSerializer):
    risk = RiskPKField(
        many=False,
        source='organization_risk'
    )
    categories = ActionCategoryField(many=True)

    def validate_risk(self, value):
        organization = get_org_from_context(self.context)
        if not organization or value.organization.id != organization.id:
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
    weather_event = WeatherEventField(many=False)
    community_system = CommunitySystemField(many=False)

    action = serializers.SerializerMethodField()

    organization = OrganizationPKField(
        default=OrganizationDefault(),
        many=False,
        write_only=True
    )

    def get_action(self, obj):
        try:
            # Use slicing ([0]) instead of .first() to use prefetched data
            action = obj.organizationaction_set.all()[0]
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
    organization = OrganizationPKField(
        default=OrganizationDefault(),
        many=False,
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
    categories = ActionCategoryField(many=True)
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
