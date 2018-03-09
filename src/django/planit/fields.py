from collections import OrderedDict
from rest_framework import serializers


class OneWayPrimaryKeyRelatedField(serializers.RelatedField):
    """Custom serializer field that uses the pk for assignment serializes the model for get."""

    def to_representation(self, value):
        serializer = self.serializer(value)
        return serializer.data

    def to_internal_value(self, pk):
        if pk:
            return self.get_queryset().get(pk=pk)
        return None

    def get_choices(self, cutoff=None):
        queryset = self.get_queryset()
        if queryset is None:
            return {}

        return OrderedDict([(item.id, str(item)) for item in queryset])
