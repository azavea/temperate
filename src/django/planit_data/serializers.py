from rest_framework import serializers

from planit_data.models import Concern, WeatherEvent, WeatherEventRank


class ConcernSerializer(serializers.ModelSerializer):

    indicator = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='name'
    )
    isRelative = serializers.BooleanField(source='is_relative')

    def to_representation(self, obj):
        if 'request' not in self.context:
            raise ValueError("Missing required 'request' context variable")
        if not self.context['request'].user.is_authenticated:
            raise ValueError("Requires authenticated user")
        organization = self.context['request'].user.primary_organization

        data = super().to_representation(obj)
        data.update(obj.calculate(organization))

        return data

    class Meta:
        model = Concern
        fields = ('id', 'indicator', 'isRelative',)


class WeatherEventSerializer(serializers.ModelSerializer):

    concern = ConcernSerializer()
    coastalOnly = serializers.BooleanField(source='coastal_only')

    class Meta:
        model = WeatherEvent
        fields = ('name', 'coastalOnly', 'concern')


class WeatherEventRankSerializer(serializers.ModelSerializer):

    weatherEvent = WeatherEventSerializer(source='weather_event')

    class Meta:
        model = WeatherEventRank
        fields = ('weatherEvent', 'order',)
