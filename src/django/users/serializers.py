from django.contrib.auth import authenticate

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
    firstName = serializers.CharField(source='first_name', allow_blank=True, required=False)
    lastName = serializers.CharField(source='last_name', allow_blank=True, required=False)

    class Meta:
        model = PlanItUser
        fields = ('id', 'email', 'isActive', 'firstName',
                  'lastName', 'organization', 'city', 'token')

    def get_token(self, obj):
        token = Token.objects.get(user=obj)
        if token:
            return token.key
        else:
            return None
