from django.http.request import QueryDict

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet

from planit_data.models import (
    CommunitySystem,
    Concern,
    OrganizationAction,
    OrganizationRisk,
    RelatedAdaptiveValue,
    WeatherEvent,
    WeatherEventRank,
)
from planit_data.serializers import (
    ConcernSerializer,
    CommunitySystemSerializer,
    OrganizationRiskSerializer,
    OrganizationActionSerializer,
    RelatedAdaptiveValueSerializer,
    SuggestedActionSerializer,
    WeatherEventRankSerializer,
    WeatherEventSerializer,
)
from users.models import GeoRegion, PlanItLocation


class ConcernViewSet(ReadOnlyModelViewSet):
    queryset = Concern.objects.all().order_by('id')
    serializer_class = ConcernSerializer
    permission_classes = [IsAuthenticated]


class CommunitySystemViewSet(ReadOnlyModelViewSet):
    queryset = CommunitySystem.objects.all().order_by('name')
    serializer_class = CommunitySystemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class OrganizationRiskView(ModelViewSet):
    model_class = OrganizationRisk
    permission_classes = [IsAuthenticated]
    pagination_class = None
    serializer_class = OrganizationRiskSerializer

    def get_serializer(self, *args, data=None, **kwargs):
        if data is not None:
            # if 'data' is a QueryDict it must be copied before being modified
            data = data.copy() if isinstance(data, QueryDict) else data
            data['organization'] = self.request.user.primary_organization_id
            return self.serializer_class(*args, data=data, **kwargs)

        return self.serializer_class(*args, **kwargs)

    def get_queryset(self):
        org_id = self.request.user.primary_organization_id
        return OrganizationRisk.objects.filter(organization_id=org_id)


class OrganizationActionViewSet(ModelViewSet):
    model_class = OrganizationAction
    serializer_class = OrganizationActionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_context(self):
        # Pass the user's organization to the serializer so it can be saved correctly
        context = super().get_serializer_context()
        context.update({
            "organization": self.request.user.primary_organization_id
        })
        return context

    def get_queryset(self):
        org_id = self.request.user.primary_organization_id
        return self.model_class.objects.filter(organization_risk__organization_id=org_id)


class SuggestedActionViewSet(ReadOnlyModelViewSet):
    model_class = OrganizationAction
    serializer_class = SuggestedActionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Limit Suggested Actions."""
        weather_event_id = self.request.query_params['we']
        community_system_id = self.request.query_params['cs']

        queryset = OrganizationAction.objects.all().filter(
            visibility=OrganizationAction.Visibility.PUBLIC,
            organization_risk__weather_event_id=weather_event_id,
            organization_risk__community_system_id=community_system_id
        )

        # Filter OrganizationActions to organizations that are within the same georegion as the user
        # This may be possible to do entirely in the database
        org_id = self.request.user.primary_organization_id
        location = PlanItLocation.objects.get(planitorganization__id=org_id)
        georegion = GeoRegion.objects.get_for_point(location.point)
        locations = PlanItLocation.objects.filter(point__contained=georegion.geom)
        queryset = queryset.filter(organization_risk__organization__location__in=locations)

        return queryset


class RelatedAdaptiveValueViewSet(ReadOnlyModelViewSet):
    queryset = RelatedAdaptiveValue.objects.all().order_by('name')
    serializer_class = RelatedAdaptiveValueSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class WeatherEventViewSet(ReadOnlyModelViewSet):
    queryset = WeatherEvent.objects.all().order_by('name')
    permission_classes = [IsAuthenticated]
    serializer_class = WeatherEventSerializer
    pagination_class = None


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
