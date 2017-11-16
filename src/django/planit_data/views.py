from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from planit_data.models import Concern, GeoRegion, RegionalRiskRank
from planit_data.serializers import ConcernSerializer, RegionalRiskRankSerializer


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


class RankedRiskView(APIView):

    model_class = RegionalRiskRank
    # Explicit permission classes because we use request.user in the view
    permission_classes = [IsAuthenticated]
    serializer_class = RegionalRiskRankSerializer

    def get(self, request, *args, **kwargs):
        """Return ranked risks based on authenticated user's primary org location."""
        location = request.user.get_current_location()
        if location is None:
            return Response({'error': 'No location attached to authenticated user'},
                            status=status.HTTP_400_BAD_REQUEST)
        georegion = GeoRegion.objects.get_for_point(location.point)
        # TODO (#209): Update filter to query User's RegionalRiskRanks instead of the global default
        queryset = self.model_class.objects.filter(georegion=georegion)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
