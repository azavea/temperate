from rest_framework import serializers

from action_steps.models import Collaborator


class CollaboratorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Collaborator
        fields = ('id', 'name',)
