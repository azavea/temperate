from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet

from planit_data.models import Concern, OrganizationRisk, WeatherEventRank
from planit_data.serializers import (
    ConcernSerializer,
    OrganizationRiskSerializer,
    WeatherEventRankSerializer,
)


class ConcernViewSet(ReadOnlyModelViewSet):
    queryset = Concern.objects.all().order_by('id')
    serializer_class = ConcernSerializer
    permission_classes = [IsAuthenticated]


class OrganizationRiskView(ModelViewSet):
    model_class = OrganizationRisk
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationRiskSerializer
    pagination_class = None

    def get_queryset(self):
        org_id = self.request.user.primary_organization_id
        return OrganizationRisk.objects.filter(organization_id=org_id)


class WeatherEventRankView(APIView):

    model_class = WeatherEventRank
    # Explicit permission classes because we use request.user in the view
    permission_classes = [IsAuthenticated]
    serializer_class = WeatherEventRankSerializer

    def get(self, request, *args, **kwargs):
        """Return ranked risks based on authenticated user's primary org location."""
        queryset = request.user.primary_organization.weather_events.all().order_by('order')
        serializer = self.serializer_class(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
