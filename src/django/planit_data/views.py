from django.db.models import Q
from django.http.request import QueryDict

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from djqscsv import render_to_csv_response

from planit_data.models import (
    CommunitySystem,
    Concern,
    OrganizationAction,
    OrganizationRisk,
    OrganizationWeatherEvent,
    RelatedAdaptiveValue,
    WeatherEvent,
)
from planit_data.serializers import (
    ConcernSerializer,
    CommunitySystemSerializer,
    OrganizationRiskSerializer,
    OrganizationActionSerializer,
    OrganizationWeatherEventSerializer,
    OrganizationWeatherEventRankSerializer,
    RelatedAdaptiveValueSerializer,
    SuggestedActionSerializer,
    WeatherEventSerializer,
)
from users.models import GeoRegion, PlanItLocation


class PlanExportView(APIView):
    """Exports a user's risks and actions for their primary organization
    in the form of a CSV.
    """
    permission_classes = [IsAuthenticated]

    # Mapping of field names to column headers. The keys are also used
    # to restrict which fields are returned in the query.
    FIELD_MAPPING = {
        'organization_risk__weather_event__name': 'Hazard',
        'organization_risk__community_system__name': 'Community System',
        'organization_risk__probability': 'Risk Probability',
        'organization_risk__frequency': 'Risk Frequency',
        'organization_risk__intensity': 'Risk Intensity',
        'organization_risk__impact_magnitude': 'Risk Impact Magnitude',
        'organization_risk__impact_description': 'Risk Impact Description',
        'organization_risk__adaptive_capacity': 'Risk Adaptive Capacity',
        'organization_risk__related_adaptive_values': 'Risk Related Adaptive Values',
        'organization_risk__adaptive_capacity_description': 'Risk Adaptive Capacity Description',
        'name': 'Action Name',
        'action_type': 'Action Type',
        'action_goal': 'Action Goal',
        'implementation_details': 'Action Implementation Details',
        'implementation_notes': 'Action Implementation Notes',
        'improvements_adaptive_capacity': 'Action Adaptive Capacity',
        'improvements_impacts': 'Action Improvements Impacts',
        'collaborators': 'Action Collaborators',
        'funding': 'Action Funding',
    }

    def get(self, request):
        user_org = request.user.primary_organization
        data = OrganizationAction.objects.filter(
            organization_risk__organization=user_org
        ).prefetch_related(
            'organization_risk',
            'organization_risk__weather_event',
            'organization_risk__community_system',
        ).values(
            *self.FIELD_MAPPING.keys()
        )

        return render_to_csv_response(
            data,
            filename='adaptation_plan',
            append_datestamp=True,
            field_header_map=self.FIELD_MAPPING,
        )


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


class OrganizationWeatherEventViewSet(ModelViewSet):

    model_class = OrganizationWeatherEvent
    serializer_class = OrganizationWeatherEventSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer(self, *args, data=None, **kwargs):
        if data is not None:
            # if 'data' is a QueryDict it must be copied before being modified
            data = data.copy() if isinstance(data, QueryDict) else data
            data['organization'] = self.request.user.primary_organization_id
            return self.serializer_class(*args, data=data, **kwargs)

        return self.serializer_class(*args, **kwargs)

    def get_queryset(self):
        org_id = self.request.user.primary_organization_id
        return self.model_class.objects.filter(organization_id=org_id)


class RelatedAdaptiveValueViewSet(ReadOnlyModelViewSet):
    queryset = RelatedAdaptiveValue.objects.all().order_by('name')
    serializer_class = RelatedAdaptiveValueSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class SuggestedActionView(APIView):
    serializer_class = SuggestedActionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def order_suggestions(self, community_system, weather_event, is_coastal, suggestions):
        """Arrange the user suggestions in a specific order

        # ?) (If coastal) Matching community system and weather events from coastal cities
        # 1) Matching community system and weather events from all cities
        # 2) Matching community system only
        # 3) Matching weather event only
        """
        def order_key(item):
            # If the community system does not match, then we know it only matched because the
            # weather event, putting it in the last category
            if item.organization_risk.community_system != community_system:
                return 0

            # If weather event does not match, then it's community system only and second to last
            if item.organization_risk.weather_event != weather_event:
                return 1

            # If both match, check if both cities are coastal:
            if is_coastal and item.organization_risk.organization.location.is_coastal:
                return 3

            return 2

        return sorted(list(suggestions), key=order_key)

    def get(self, request, *args, **kwargs):
        queryset = OrganizationAction.objects.all().filter(
            visibility=OrganizationAction.Visibility.PUBLIC
        )

        try:
            risk_id = self.request.query_params['risk']
        except KeyError:
            return queryset.none()
        risk = OrganizationRisk.objects.select_related(
            'weather_event', 'community_system'
        ).get(id=risk_id)

        # Filter OrganizationActions to organizations that are within the same georegion as the user
        # This may be possible to do entirely in the database
        org_id = self.request.user.primary_organization_id
        location = PlanItLocation.objects.get(planitorganization__id=org_id)
        georegion = GeoRegion.objects.get_for_point(location.point)
        locations = PlanItLocation.objects.filter(point__contained=georegion.geom)
        queryset = queryset.filter(organization_risk__organization__location__in=locations)

        queryset = queryset.filter(
            Q(organization_risk__weather_event=risk.weather_event_id) |
            Q(organization_risk__community_system=risk.community_system_id)
        ).select_related(
            'organization_risk__weather_event',
            'organization_risk__community_system',
            'organization_risk__organization__location'
        ).prefetch_related(
            'categories'
        )

        results = self.order_suggestions(risk.community_system, risk.weather_event,
                                         location.is_coastal, queryset)

        serializer = self.serializer_class(results[:5], many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class WeatherEventViewSet(ReadOnlyModelViewSet):
    queryset = WeatherEvent.objects.all().order_by('name')
    permission_classes = [IsAuthenticated]
    serializer_class = WeatherEventSerializer
    pagination_class = None


class WeatherEventRankView(APIView):

    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationWeatherEventRankSerializer
    pagination_class = None
    # Explicit permission classes because we use request.user in the view

    def get(self, request, *args, **kwargs):
        """Return ranked risks based on authenticated user's primary org location."""
        queryset = request.user.primary_organization.weather_events.all().order_by('order')
        serializer = self.serializer_class(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
