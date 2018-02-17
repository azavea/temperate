import datetime

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from users.models import PlanItLocation, PlanItOrganization, PlanItUser


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
        fields = ('name', 'api_city_id',)
        read_only_fields = ('name', 'point',)


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for user organizations"""

    location = LocationSerializer()

    def validate_location(self, location_data):
        if 'api_city_id' not in location_data.keys():
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
        if dt < datetime.date.today():
            raise serializers.ValidationError("Plan due date cannot be in the past.")
        return dt

    @transaction.atomic
    def create(self, validated_data):
        location_data = validated_data.pop('location')
        instance = PlanItOrganization.objects.create(**validated_data)
        if 'api_city_id' in location_data:
            instance.location = PlanItLocation.objects.from_api_city(location_data['api_city_id'])
            instance.save()

        # Copy the template WeatherEventRank objects for this new Organization
        instance.import_weather_events()
        instance.import_risks()

        return instance

    def update(self, instance, validated_data):
        validated_data.pop('name')
        location_data = validated_data.pop('location')
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if location_data['api_city_id'] is not None:
            instance.location = PlanItLocation.objects.from_api_city(location_data['api_city_id'])
        instance.save()
        return instance

    def validate(self, data):
        # Only set created_by if we are creating a new object instance
        if not self.instance:
            data['created_by'] = self.context['request'].user
        return data

    class Meta:
        model = PlanItOrganization
        fields = ('id', 'created_at', 'name', 'location', 'units',
                  'subscription', 'subscription_end_date',
                  'plan_due_date', 'plan_name', 'plan_hyperlink')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for PlanItUser.

    Note:
        Retrieves token if available for a user, or returns ``null``
    """

    # will assign default organization if none given here
    organizations = serializers.SlugRelatedField(many=True,
                                                 queryset=PlanItOrganization.objects.all(),
                                                 required=False,
                                                 slug_field='name')
    primary_organization = serializers.SlugRelatedField(queryset=PlanItOrganization.objects.all(),
                                                        required=False,
                                                        slug_field='name')

    password1 = serializers.CharField(write_only=True, required=True, allow_blank=False,
                                      style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, allow_blank=False,
                                      style={'input_type': 'password'})

    class Meta:
        model = PlanItUser
        fields = ('id', 'email', 'first_name', 'last_name', 'organizations',
                  'primary_organization', 'password1', 'password2',)

    def validate(self, data):
        if 'password1' in data and 'password2' in data:
            # check passwords match
            if data['password1'] != data['password2']:
                raise serializers.ValidationError('Passwords do not match.')
            if (('primary_organization' in data and
                 data['primary_organization'] not in data['organizations'])):
                raise serializers.ValidationError(
                    "Primary Organization must be one of the user's Organizations"
                )
            # run built-in password validators; will raise ValidationError if it fails
            validate_password(data['password1'])
            # return cleaned data with a single password
            data['password'] = data['password1']
            data.pop('password1')
            data.pop('password2')
        return data


class UserOrgSerializer(UserSerializer):
    """Return primary_organization as its full object on the user."""

    primary_organization = OrganizationSerializer()
