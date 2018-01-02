from rest_framework import serializers

from action_steps.models import ActionCategory, Collaborator


class ActionCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ActionCategory
        fields = ('id', 'name', 'icon', 'description',)


class CollaboratorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Collaborator
        fields = ('id', 'name',)
