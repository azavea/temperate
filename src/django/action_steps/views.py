from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ReadOnlyModelViewSet

from action_steps.models import Collaborator
from action_steps.serializers import CollaboratorSerializer


class CollaboratorViewSet(ReadOnlyModelViewSet):
    queryset = Collaborator.objects.all()
    serializer_class = CollaboratorSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
