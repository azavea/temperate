from collections import OrderedDict

from rest_framework import serializers

from action_steps.models import ActionCategory, ActionType, Collaborator


class ActionCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ActionCategory
        fields = ('id', 'name', 'icon', 'description',)


class ActionCategoryField(serializers.PrimaryKeyRelatedField):
    """Custom serializer field that accepts the pk and returns the related model."""

    def to_representation(self, value):
        pk = super().to_representation(value)
        try:
            item = ActionCategory.objects.get(pk=pk)
            serializer = ActionCategorySerializer(item)
            return serializer.data
        except ActionCategory.DoesNotExist:
            return None

    def get_choices(self, cutoff=None):
        queryset = self.get_queryset()
        if queryset is None:
            return {}

        return OrderedDict([(item.id, str(item)) for item in queryset])


class ActionTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ActionType
        fields = ('name',)


class CollaboratorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Collaborator
        fields = ('id', 'name',)
