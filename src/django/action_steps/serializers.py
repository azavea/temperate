
from rest_framework import serializers

from action_steps.models import ActionCategory, ActionType, Collaborator
from planit.fields import OneWayPrimaryKeyRelatedField


class ActionCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ActionCategory
        fields = ('id', 'name', 'icon', 'description',)


class ActionCategoryField(OneWayPrimaryKeyRelatedField):
    """Custom serializer field that accepts the pk and returns the related model."""
    serializer = ActionCategorySerializer


class ActionTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ActionType
        fields = ('name',)


class CollaboratorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Collaborator
        fields = ('id', 'name',)
