from datetime import date

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.db import transaction
from django.shortcuts import get_object_or_404

from requests.exceptions import HTTPError

from rest_auth.serializers import (
    PasswordResetSerializer as AuthPasswordResetSerializer,
    PasswordResetConfirmSerializer as AuthPasswordResetConfirmSerializer
)
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from users.models import CityProfile, PlanItLocation, PlanItOrganization, PlanItUser
from users.serializer_fields import BitField
from planit_data.models import CommunitySystem


def get_org_from_context(context):
    """Get current user's primary organization from the request context.

    Used when serializing data filtered to current user's organization.
    """
    user = context['request'].user
    return user.primary_organization


class PasswordResetSerializer(AuthPasswordResetSerializer):
    """
    Overrides the django-rest-auth password reset serializer to send HTML emails
    """
    def get_email_options(self):
        return {
            'subject_template_name': 'password_reset_email_subject.txt',
            'email_template_name': 'password_reset_email.txt',
            'html_email_template_name': 'password_reset_email.html',
            'extra_email_context': {
                'password_reset_url': settings.PASSWORD_RESET_URL
            }
        }


class PasswordResetConfirmSerializer(AuthPasswordResetConfirmSerializer):
    """
    Overrides the django-rest-auth serializer to check token validity before password validity

    We use this to guard against accessing the password reset page with an invalid token
    """

    def custom_validation(self, attrs):
        if not default_token_generator.check_token(self.user, attrs['token']):
            raise ValidationError({'token': ['Invalid value']})


class AuthTokenSerializer(serializers.Serializer):
    """Adopted from Django Rest Framework's AuthTokenSerializer to handle e-mail login."""

    email = serializers.CharField(label='Email')
    password = serializers.CharField(label='Password', style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('Must include "username" and "password".')

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError('Unable to log in with provided credentials.')

        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')

        attrs['user'] = user
        return attrs


class LocationSerializer(GeoFeatureModelSerializer):
    """Serializer for organization locations."""

    def get_unique_together_validators(self):
        """
        Remove unique_together validations.
        These are handled in the OrganizationSerializer.create(...) method
        """
        return []

    class Meta:
        model = PlanItLocation
        geo_field = 'point'
        fields = ('name', 'admin', 'datasets',)


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for user organizations"""

    location = LocationSerializer()
    community_systems = serializers.SlugRelatedField(many=True,
                                                     queryset=CommunitySystem.objects.all(),
                                                     required=False,
                                                     slug_field='id')
    weather_events = serializers.SlugRelatedField(many=True, read_only=True,
                                                  slug_field='weather_event_id')
    invites = serializers.ListField(child=serializers.EmailField(), write_only=True, required=False)

    users = serializers.SlugRelatedField(many=True, read_only=True, slug_field='email')

    def validate_location(self, location_data):
        if 'name' not in location_data:
            raise serializers.ValidationError("Location name is required.")
        if 'admin' not in location_data:
            raise serializers.ValidationError("Location admin is required.")
        if 'point' not in location_data:
            raise serializers.ValidationError("Location point is required.")
        return location_data

    def validate_plan_due_date(self, dt):
        """Expect plan due date to be in the future"""
        if not dt:
            # year is not required
            return None
        if self.instance is not None and self.instance.plan_due_date == dt:
            # we shouldn't validate if it hasn't changed
            return dt
        if dt < date.today():
            raise serializers.ValidationError("Plan due date cannot be in the past.")
        return dt

    def validate_name(self, name):
        if self.instance is not None and self.instance.name == name:
            # No conflict if name hasn't changed
            return name

        try:
            location_name = self.initial_data['location']['name']
            admin = self.initial_data['location']['admin']
        except KeyError:
            raise serializers.ValidationError('Location is required.')

        other_orgs = PlanItOrganization.objects.filter(
            name=name, location__name=location_name, location__admin=admin
        )
        if other_orgs.exists():
            raise serializers.ValidationError('An organization with this name already exists.')
        return name

    def validate_subscription(self, subscription):
        if (self.instance is not None and
                self.instance.subscription_pending and
                subscription != self.instance.subscription):
            raise serializers.ValidationError("Subscription cannot be changed while another " +
                                              "change is pending.")
        return subscription

    @transaction.atomic
    def create(self, validated_data):
        location_data = validated_data.pop('location')

        # This is used at the viewset level but will cause an error if we use it here because
        # Organization doesn't have an `invites` field.
        validated_data.pop('invites', [])
        instance = PlanItOrganization.objects.create(**validated_data)
        try:
            instance.location = PlanItLocation.objects.from_point(
                location_data['name'],
                location_data['admin'],
                location_data['point'],
            )
        except HTTPError as error:
            # A 404 error indicates there are no map cells for this point
            # Any other error we should let the client handle
            if error.response.status_code == 404:
                raise serializers.ValidationError({
                    'location': 'No climate data for this location'
                })
            raise

        instance.save()

        # Copy the template WeatherEventRank objects for this new Organization
        instance.import_weather_events()

        return instance

    def update(self, instance, validated_data):
        location_data = validated_data.pop('location')
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.location = PlanItLocation.objects.from_point(
            location_data['name'],
            location_data['admin'],
            location_data['point'],
        )
        instance.save()

        if 'weather_events' in self.initial_data:
            instance.update_weather_events(self.initial_data['weather_events'])

        return instance

    def validate(self, data):
        # Only set created_by if we are creating a new object instance and have related user info
        if not self.instance and self.context and self.context.get('request', None):
            data['created_by'] = self.context['request'].user
        return data

    class Meta:
        model = PlanItOrganization
        fields = ('id', 'created_at', 'name', 'location', 'units', 'invites',
                  'subscription', 'subscription_end_date', 'subscription_pending',
                  'plan_due_date', 'plan_name', 'plan_hyperlink', 'plan_setup_complete',
                  'community_systems', 'weather_events', 'users',)
        read_only_fields = ('subscription_end_date', 'subscription_pending',)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for PlanItUser.

    Note:
        Retrieves token if available for a user, or returns ``null``
    """

    organizations = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=PlanItOrganization.objects.all(),
        required=False
    )
    removed_organizations = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=PlanItOrganization.objects.all(),
        required=False
    )
    primary_organization = serializers.PrimaryKeyRelatedField(
        queryset=PlanItOrganization.objects.all(),
        allow_null=True,
        required=False
    )

    password = serializers.CharField(write_only=True, required=True, allow_blank=False,
                                     style={'input_type': 'password'})

    can_create_multiple_organizations = serializers.BooleanField(read_only=True)

    class Meta:
        model = PlanItUser
        fields = ('id', 'email', 'first_name', 'last_name', 'organizations', 'primary_organization',
                  'removed_organizations', 'password', 'can_create_multiple_organizations',)

    def validate(self, data):
        if ('primary_organization' in data and data['primary_organization'] and
                data['primary_organization'] not in data['organizations']):

            raise serializers.ValidationError(
                "Primary organization must be one of the user's organizations"
            )
        if 'password' in data:
            # run built-in password validators; will raise ValidationError if it fails
            validate_password(data['password'])
        return data

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        return super().update(instance, validated_data)


class UserOrgSerializer(UserSerializer):
    """Return primary_organization as its full object on the user."""

    organizations = OrganizationSerializer(many=True, read_only=True)
    removed_organizations = OrganizationSerializer(many=True, read_only=True)
    primary_organization = OrganizationSerializer()


class CityProfileSerializer(serializers.ModelSerializer):

    action_prioritized = BitField()

    class Meta:
        model = CityProfile
        fields = '__all__'
        read_only_fields = ('organization',)


class RemoveUserSerializer(serializers.Serializer):
    email = serializers.EmailField(label='Email', required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        org = get_org_from_context(self.context)
        user = get_object_or_404(org.users, email=email)
        attrs['user'] = user
        return attrs
