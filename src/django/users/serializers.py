from datetime import datetime
import re

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from users.models import PlanItLocation, PlanItOrganization, PlanItUser


# Matches any 4-digit number:
YEAR_REGEX = re.compile('^\d{4}$')


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
        allowed_keys = set(['api_city_id'])
        provided_keys = set(location_data.keys())
        # If the provided keys and the allowed keys do not share any items, raise a ValidationError
        if allowed_keys.isdisjoint(provided_keys):
            raise serializers.ValidationError("Valid location not provided")
        return location_data

    def validate_plan_year(self, year):
        """Expect plan year to look like a year, and be either the current year or in the future"""
        if not year:
            # year is not required
            return None
        if not YEAR_REGEX.match(str(year)):
            raise serializers.ValidationError("Year should be four digits.")
        if not year >= datetime.today().year:
            raise serializers.ValidationError("Year cannot be in the past.")
        return year

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

    class Meta:
        model = PlanItOrganization
        fields = ('id', 'name', 'plan_year', 'location', 'units')


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
