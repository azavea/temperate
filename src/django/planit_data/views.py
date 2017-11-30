from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from planit_data.models import Concern, WeatherEventRank
from planit_data.serializers import ConcernSerializer, WeatherEventRankSerializer


class ConcernViewSet(ReadOnlyModelViewSet):
    queryset = Concern.objects.all().order_by('id')
    serializer_class = ConcernSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        request = context['request']
        location = request.user.get_current_location()
        context['city_id'] = location.api_city_id
        return context


class WeatherEventRankView(APIView):

    model_class = WeatherEventRank
    # Explicit permission classes because we use request.user in the view
    permission_classes = [IsAuthenticated]
    serializer_class = WeatherEventRankSerializer

    def get(self, request, *args, **kwargs):
        """Return ranked risks based on authenticated user's primary org location."""
        queryset = request.user.primary_organization.weather_events.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
