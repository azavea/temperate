from rest_framework import serializers

from planit_data.models import Concern, WeatherEventRank


class ConcernSerializer(serializers.ModelSerializer):

    indicator = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = Concern
        fields = '__all__'


class WeatherEventRankSerializer(serializers.ModelSerializer):

    weather_event = serializers.SlugRelatedField(many=False, read_only=True, slug_field='name')

    class Meta:
        model = WeatherEventRank
        fields = ('weather_event', 'order',)
