from django.shortcuts import get_object_or_404
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from planit_data.models import Concern
from planit_data.serializers import ConcernSerializer


class ConcernViewSet(ReadOnlyModelViewSet):
    queryset = Concern.objects.all().order_by('id')
    serializer_class = ConcernSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, pk=None):
        """Return a specific Concern and its calculated value for the user's location."""
        concern = get_object_or_404(Concern, id=pk)
        payload = ConcernSerializer(concern).data

        payload['value'] = concern.calculate_value(request.user.api_city_id)
        return Response(payload)
