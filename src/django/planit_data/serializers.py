from rest_framework import serializers

from planit_data.models import Concern, RegionalRiskRank


class ConcernSerializer(serializers.ModelSerializer):

    indicator = serializers.SlugRelatedField(
        many=False,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = Concern
        fields = '__all__'


class RegionalRiskRankSerializer(serializers.ModelSerializer):

    weather_event = serializers.SlugRelatedField(many=False, read_only=True, slug_field='name')

    class Meta:
        model = RegionalRiskRank
        fields = ('weather_event', 'order',)
