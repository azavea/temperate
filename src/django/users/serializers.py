from datetime import date

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.db import transaction

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

    class Meta:
        model = PlanItLocation
        geo_field = 'point'
        fields = ('name', 'admin', 'api_city_id',)
        read_only_fields = ('name', 'admin', 'point',)


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
        if 'api_city_id' not in location_data:
            raise serializers.ValidationError("Location ID is required.")
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
            api_city_id = self.initial_data['location']['properties']['api_city_id']
        except KeyError:
            raise serializers.ValidationError('Location ID is required.')
        if PlanItOrganization.objects.filter(name=name, location__api_city_id=api_city_id).exists():
            raise serializers.ValidationError('An organization with this name already exists.')
        return name

    def validate_subscription(self, subscription):
        if (self.instance is not None and
                self.instance.subscription_pending and
                subscription != self.instance.subscription):
            raise serializers.ValidationError("Subscription cannot be changed while another " +
                                              "change is pending.")
        return subscription

    def validate_invites(self, invites):
        # TODO (#368): Only check for duplicate users in this organization instead of all
        # organizations once users can switch their primary organization
        existing_emails = PlanItUser.objects \
            .filter(email__in=invites).values_list('email', flat=True)
        if existing_emails:
            raise serializers.ValidationError({email: 'A user with this email already exists.'
                                               for email in existing_emails})
        return invites

    @transaction.atomic
    def create(self, validated_data):
        invites = validated_data.pop('invites', [])
        location_data = validated_data.pop('location')

        instance = PlanItOrganization.objects.create(**validated_data)
        if 'api_city_id' in location_data:
            instance.location = PlanItLocation.objects.from_api_city(location_data['api_city_id'])
            instance.save()

        for email in invites:
            PlanItUser.objects.create_user(email, '', '', primary_organization=instance,
                                           is_active=False)

        # Copy the template WeatherEventRank objects for this new Organization
        instance.import_weather_events()

        return instance

    def update(self, instance, validated_data):
        location_data = validated_data.pop('location')
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if location_data['api_city_id'] is not None:
            instance.location = PlanItLocation.objects.from_api_city(location_data['api_city_id'])
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

    organizations = serializers.SlugRelatedField(many=True,
                                                 queryset=PlanItOrganization.objects.all(),
                                                 required=False,
                                                 slug_field='name')
    primary_organization = serializers.SlugRelatedField(queryset=PlanItOrganization.objects.all(),
                                                        allow_null=True,
                                                        required=False,
                                                        slug_field='name')

    password = serializers.CharField(write_only=True, required=True, allow_blank=False,
                                     style={'input_type': 'password'})

    can_create_multiple_organizations = serializers.BooleanField(read_only=True)

    class Meta:
        model = PlanItUser
        fields = ('id', 'email', 'first_name', 'last_name', 'organizations',
                  'primary_organization', 'password', 'can_create_multiple_organizations',)

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

    primary_organization = OrganizationSerializer()


class CityProfileSerializer(serializers.ModelSerializer):

    action_prioritized = BitField()

    class Meta:
        model = CityProfile
        fields = '__all__'
        read_only_fields = ('organization',)
