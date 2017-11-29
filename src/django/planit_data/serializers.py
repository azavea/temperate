from rest_framework import serializers

from planit_data.models import Concern, WeatherEventRank


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
        fields = ('indicator', 'tagline', 'value',)


class WeatherEventRankSerializer(serializers.ModelSerializer):

    weather_event = serializers.SlugRelatedField(many=False, read_only=True, slug_field='name')

    class Meta:
        model = WeatherEventRank
        fields = ('weather_event', 'order',)
