from django.contrib.auth import authenticate

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

    class Meta:
        model = PlanItUser
        fields = ('id', 'email', 'organization', 'city', 'first_name', 'last_name',
                  'is_staff', 'is_active', 'date_joined')
