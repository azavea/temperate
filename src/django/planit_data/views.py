from tempfile import TemporaryFile

from django.conf import settings
from django.core.mail import EmailMessage
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.text import slugify

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from djqscsv import render_to_csv_response, write_csv

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
    RelatedAdaptiveValueSerializer,
    SuggestedActionSerializer,
    WeatherEventSerializer
)
from users.models import GeoRegion, PlanItLocation


class PlanView(APIView):
    permission_classes = [IsAuthenticated]

    # Mapping of field names to column headers. The keys are also used
    # to restrict which fields are returned in the query.

    # organizationaction is a M2M which is fine. Risks with multiple actions will just
    # represent multiple rows in the output for each combination of risk + action, with risk data
    # duplicated.
    FIELD_MAPPING = {
        'weather_event__name': 'Hazard',
        'community_system__name': 'Community System',
        'probability': 'Risk Probability',
        'frequency': 'Risk Frequency',
        'intensity': 'Risk Intensity',
        'impact_magnitude': 'Risk Impact Magnitude',
        'impact_description': 'Risk Impact Description',
        'adaptive_capacity': 'Risk Adaptive Capacity',
        'related_adaptive_values': 'Risk Related Adaptive Values',
        'adaptive_capacity_description': 'Risk Adaptive Capacity Description',
        'organizationaction__name': 'Action Name',
        'organizationaction__action_type': 'Action Type',
        'organizationaction__action_goal': 'Action Goal',
        'organizationaction__implementation_details': 'Action Implementation Details',
        'organizationaction__implementation_notes': 'Action Implementation Notes',
        'organizationaction__improvements_adaptive_capacity': 'Action Adaptive Capacity',
        'organizationaction__improvements_impacts': 'Action Improvements Impacts',
        'organizationaction__collaborators': 'Action Collaborators',
        'organizationaction__funding': 'Action Funding',
    }

    def get_data_for_organization(self, org):
        return OrganizationRisk.objects.filter(
            organization=org
        ).prefetch_related(
            'organizationaction',
            'weather_event',
            'community_system',
        ).order_by(
            'weather_event__name',
            'community_system__name',
        ).values(
            *self.FIELD_MAPPING.keys()
        )


class PlanExportView(PlanView):
    """ Exports a user's risks and actions for their primary organization as a CSV. """

    def get(self, request):
        user_org = request.user.primary_organization
        data = self.get_data_for_organization(user_org)
        return render_to_csv_response(
            data,
            filename='adaptation_plan',
            append_datestamp=True,
            field_header_map=self.FIELD_MAPPING,
        )


class PlanSubmitView(PlanView):
    """ Submits a user's current plan to ICLEI via email with a CSV attachment. """

    def post(self, request, *args, **kwargs):
        user_org = request.user.primary_organization
        data = self.get_data_for_organization(user_org)
        with TemporaryFile() as fp:
            write_csv(data, fp)
            fp.seek(0)

            due_date = user_org.plan_due_date.isoformat() if user_org.plan_due_date else '--'
            email = EmailMessage(
                'Temperate Plan submission for {}'.format(user_org.name),
                'Temperate plan for {} due {} submitted by {} at {}'.format(
                    user_org.name,
                    due_date,
                    request.user.email,
                    timezone.now().isoformat()
                ),
                settings.DEFAULT_FROM_EMAIL,
                [settings.PLAN_SUBMISSION_EMAIL],
                [request.user.email]
            )
            filename = '{}_adaptation_plan_{}.csv'.format(slugify(user_org.name), due_date)
            email.attach(filename, fp.read(), 'text/csv')
            email.send()
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class ConcernViewSet(ReadOnlyModelViewSet):
    serializer_class = ConcernSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Concern.objects.all().select_related(
            'indicator'
        ).order_by('id')


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

    def get_queryset(self):
        org_id = self.request.user.primary_organization_id
        return OrganizationRisk.objects.filter(
            organization_id=org_id
        ).select_related(
            'community_system',
            'weather_event',
            'weather_event__concern',
            'weather_event__concern__indicator',
        ).prefetch_related(
            'organizationaction_set',
            'organizationaction_set__categories',
            'weather_event__concern',
            'weather_event__indicators',
        )

    @transaction.atomic
    def create(self, request):
        response = super().create(request)

        weather_event_id = request.data['weather_event']
        organization = request.user.primary_organization
        if not organization.weather_events.filter(weather_event_id=weather_event_id).exists():
            weather_event_ids = list(
                organization.weather_events.values_list('weather_event_id', flat=True))
            organization.update_weather_events(weather_event_ids + [weather_event_id])

        return response

    @transaction.atomic
    def update(self, request, pk=None):
        if pk:
            new_weather_event_id = request.data['weather_event']
            old_weather_event = WeatherEvent.objects.get(organizationrisk=pk)
            if new_weather_event_id != old_weather_event.id:
                print("Updating weather event list")
                organization = request.user.primary_organization
                remaining_risks = organization.organizationrisk_set.exclude(id=pk)
                weather_event_ids = set(remaining_risks.values_list('weather_event_id', flat=True)
                                        .distinct())
                weather_event_ids.add(new_weather_event_id)
                organization.update_weather_events(weather_event_ids)
        return super().update(request, pk)

    @transaction.atomic
    def destroy(self, request, pk=None):
        if pk:
            organization = request.user.primary_organization
            weather_event = WeatherEvent.objects.get(organizationrisk=pk)
            remaining_risks = organization.organizationrisk_set.exclude(id=pk)
            if not remaining_risks.filter(weather_event=weather_event).exists():
                OrganizationWeatherEvent.objects.filter(
                    organization=organization,
                    weather_event=weather_event
                ).delete()

        return super().destroy(request, pk=pk)


class OrganizationActionViewSet(ModelViewSet):
    model_class = OrganizationAction
    serializer_class = OrganizationActionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        org_id = self.request.user.primary_organization_id
        return self.model_class.objects.filter(
            organization_risk__organization_id=org_id
        ).prefetch_related(
            'categories'
        )


class OrganizationWeatherEventViewSet(ModelViewSet):

    model_class = OrganizationWeatherEvent
    serializer_class = OrganizationWeatherEventSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        org_id = self.request.user.primary_organization_id
        return self.model_class.objects.filter(
            organization_id=org_id
        ).select_related(
            'weather_event'
        ).prefetch_related(
            'weather_event__concern',
            'weather_event__indicators'
        )


class RelatedAdaptiveValueViewSet(ReadOnlyModelViewSet):
    queryset = RelatedAdaptiveValue.objects.all().order_by('name')
    serializer_class = RelatedAdaptiveValueSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class SuggestedActionViewSet(ReadOnlyModelViewSet):
    serializer_class = SuggestedActionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    @staticmethod
    def order_suggestions(community_system, weather_event, is_coastal, suggestions):
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
                return 3

            # If weather event does not match, then it's community system only and second to last
            if item.organization_risk.weather_event != weather_event:
                return 2

            # If both match, check if both cities are coastal:
            if is_coastal and item.organization_risk.organization.location.is_coastal:
                return 0

            return 1

        return sorted(list(suggestions), key=order_key)

    def get_queryset(self):
        return OrganizationAction.objects.all().filter(
            visibility=OrganizationAction.Visibility.PUBLIC
        ).select_related(
            'organization_risk__weather_event',
            'organization_risk__community_system',
            'organization_risk__organization__location'
        ).prefetch_related(
            'categories'
        )

    def list(self, request, *args, **kwargs):
        try:
            risk_id = self.request.query_params['risk']
        except KeyError:
            raise ValidationError('risk parameter required')

        risk = OrganizationRisk.objects.select_related(
            'weather_event', 'community_system'
        ).get(id=risk_id)

        # Filter OrganizationActions to organizations that are within the same georegion as the user
        # This may be possible to do entirely in the database
        georegion = GeoRegion.objects.get_for_point(
            self.request.user.primary_organization.location.point)
        locations = PlanItLocation.objects.filter(point__contained=georegion.geom)
        queryset = self.get_queryset().filter(
            organization_risk__organization__location__in=locations
        ).filter(
            Q(organization_risk__weather_event=risk.weather_event_id) |
            Q(organization_risk__community_system=risk.community_system_id)
        )

        is_coastal = request.user.primary_organization.location.is_coastal
        results = self.order_suggestions(risk.community_system, risk.weather_event,
                                         is_coastal, queryset)[:5]

        serializer = self.get_serializer(results, data=results, many=True)
        serializer.is_valid()
        return Response(serializer.data, status=status.HTTP_200_OK)


class WeatherEventViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WeatherEventSerializer
    pagination_class = None

    def get_queryset(self):
        return WeatherEvent.objects.all().prefetch_related(
            'concern',
            'indicators'
        ).order_by('name')
