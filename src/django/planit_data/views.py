from django.shortcuts import get_object_or_404

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

    def retrieve(self, request, pk=None):
        """Return a specific Concern and its calculated value for the user's location."""
        concern = get_object_or_404(Concern, id=pk)
        payload = ConcernSerializer(concern).data

        location = request.user.get_current_location()
        payload['value'] = concern.calculate(location.api_city_id)
        return Response(payload)


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
