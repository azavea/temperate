from rest_framework import serializers

from planit_data.models import Concern, WeatherEvent, WeatherEventRank


class ConcernSerializer(serializers.ModelSerializer):

    indicator = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='name'
    )
    isRelative = serializers.BooleanField(source='is_relative')
    tagline = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()
    units = serializers.SerializerMethodField()

    def get_tagline(self, obj):
        return obj.tagline(self._get_city_id())

    def get_value(self, obj):
        return obj.calculate(self._get_city_id())

    def get_units(self, obj):
        return obj.get_default_units()

    def _get_city_id(self):
        if 'request' not in self.context:
            raise ValueError("Missing required 'request' context variable")
        if not self.context['request'].user.is_authenticated:
            raise ValueError("Requires authenticated user")

        location = self.context['request'].user.get_current_location()
        return location.api_city_id

    class Meta:
        model = Concern
        fields = ('id', 'indicator', 'isRelative', 'tagline', 'units', 'value',)


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
