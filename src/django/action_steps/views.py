from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ReadOnlyModelViewSet

from action_steps.models import ActionCategory, ActionType, Collaborator
from action_steps.serializers import (
    ActionCategorySerializer,
    ActionTypeSerializer,
    CollaboratorSerializer
)


class ActionCategoryViewSet(ReadOnlyModelViewSet):
    """ViewSet for ActionCategory.

    No pagination -- this is a short list, the client can handle filtering/sorting/etc

    """
    queryset = ActionCategory.objects.all()
    serializer_class = ActionCategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class ActionTypeViewSet(ReadOnlyModelViewSet):
    """ViewSet for ActionType.

    No pagination -- this is a short list, the client can handle filtering/sorting/etc

    """
    queryset = ActionType.objects.all()
    serializer_class = ActionTypeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class CollaboratorViewSet(ReadOnlyModelViewSet):
    """ViewSet for Collaborator.

    No pagination -- this is a short list, the client can handle filtering/sorting/etc

    """
    queryset = Collaborator.objects.all()
    serializer_class = CollaboratorSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
