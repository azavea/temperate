from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

from rest_framework.authtoken.models import Token
from rest_framework import serializers

from users.models import PlanItUser


class AuthTokenSerializer(serializers.Serializer):
    """Adopted from Django Rest Framework's AuthTokenSerializer to handle e-mail login."""

    email = serializers.CharField(label='Email')
    password = serializers.CharField(label='Password', style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)

            if user:
                if not user.is_active:
                    msg = 'User account is disabled.'
                    raise serializers.ValidationError(msg)
            else:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg)
        else:
            msg = 'Must include "username" and "password".'
            raise serializers.ValidationError(msg)

        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for PlanItUser
    Note:
        Retrieves token if available for a user, or returns ``null``
    """

    token = serializers.SerializerMethodField()
    isActive = serializers.BooleanField(source='is_active', default=False, read_only=True)
    firstName = serializers.CharField(source='first_name', allow_blank=False, required=True)
    lastName = serializers.CharField(source='last_name', allow_blank=False, required=True)

    password1 = serializers.CharField(write_only=True, required=True, allow_blank=False,
                                      style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, allow_blank=False,
                                      style={'input_type': 'password'})

    class Meta:
        model = PlanItUser
        fields = ('id', 'email', 'isActive', 'firstName', 'lastName', 'organization', 'city',
                  'password1', 'password2', 'token')

    def get_token(self, obj):
        token = Token.objects.get(user=obj)
        if token:
            return token.key
        else:
            return None

    def validate(self, data):
        # check passwords match
        if data['password1'] != data['password2']:
            raise serializers.ValidationError('Passwords do not match.')
        # run built-in password validators; will raise ValidationError if it fails
        validate_password(data['password1'])
        # return cleaned data with a single password
        data['password'] = data['password1']
        data.pop('password1')
        data.pop('password2')
        return data
