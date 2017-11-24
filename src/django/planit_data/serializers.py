from rest_framework import serializers

from planit_data.models import Concern, WeatherEvent, WeatherEventRank


class ConcernSerializer(serializers.ModelSerializer):

    indicator = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='name'
    )
    tagline = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()

    def get_tagline(self, obj):
        return obj.tagline(self.context['city_id'])

    def get_value(self, obj):
        return obj.calculate(self.context['city_id'])

    class Meta:
        model = Concern
        fields = ('id', 'indicator', 'is_relative', 'tagline', 'value',)


class WeatherEventSerializer(serializers.ModelSerializer):

    class Meta:
        model = WeatherEvent
        fields = ('name', 'coastal_only', 'concern')


class WeatherEventRankSerializer(serializers.ModelSerializer):

    weather_event = WeatherEventSerializer()

    class Meta:
        model = WeatherEventRank
        fields = ('weather_event', 'order',)
