from urllib.parse import urlencode
from unittest import mock

from django.contrib.gis.geos import Point
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from action_steps.models import ActionCategory
from planit_data.views import WeatherEventRankView
from planit_data.tests.factories import (
    CommunitySystemFactory,
    ConcernFactory,
    GeoRegionFactory,
    OrganizationActionFactory,
    OrganizationRiskFactory,
    WeatherEventFactory,
    WeatherEventRankFactory
)
from planit_data.models import OrganizationAction, OrganizationRisk
from users.tests.factories import UserFactory


class ConcernViewSetTestCase(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_concern_list_empty(self):
        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'], [])

    @mock.patch('planit_data.models.Concern.calculate')
    def test_concern_list_nonempty(self, calculate_mock):
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'farthing',
            'tagline': 'more'
        }
        concern = ConcernFactory(
            tagline_positive='more',
            tagline_negative='less',
            is_relative=True)

        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertDictEqual(
            dict(response.data['results'][0]),
            {'id': concern.id,
             'indicator': concern.indicator.name,
             'tagline': 'more',
             'is_relative': True,
             'value': 5.3,
             'units': 'farthing'})

    def test_concern_list_nonauth(self):
        """Ensure that unauthenticated users receive a 401 Unauthorized response."""
        self.client.logout()
        url = reverse('concern-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @mock.patch('planit_data.models.Concern.calculate')
    def test_concern_detail(self, calculate_mock):
        calculate_mock.return_value = {
            'value': 5.3,
            'units': 'miles',
            'tagline': 'more'
        }

        concern = ConcernFactory(
            tagline_positive='more',
            tagline_negative='less',
            is_relative=True)

        url = reverse('concern-detail', kwargs={'pk': concern.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data,
                             {'id': concern.id, 'indicator': concern.indicator.name,
                              'tagline': 'more', 'is_relative': True, 'value': 5.3,
                              'units': 'miles'})
        calculate_mock.assert_called_with(self.user.primary_organization)

    def test_concern_detail_invalid(self):
        url = reverse('concern-detail', kwargs={'pk': 999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_concern_detail_nonauth(self):
        self.client.logout()
        url = reverse('concern-detail', kwargs={'pk': 1})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class WeatherEventRankViewTestCase(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_weather_event_rank_list(self):
        organization = self.user.primary_organization
        organization.location.point = Point(2, 2)

        # Create a georegion centered around our location's coordinates
        georegion = GeoRegionFactory(bounds=[[1, 1], [1, 3], [3, 3], [3, 1], [1, 1]])

        # Create a WeatherEventRank that will be associated with our organization
        weathereventank = WeatherEventRankFactory(georegion=georegion)
        organization.weather_events.add(weathereventank)

        # Create additional WeatherEventRanks for the same georegion that are not associated
        WeatherEventRankFactory.create_batch(2, georegion=georegion)

        url = reverse('weather-event-rank-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        serializer = WeatherEventRankView.serializer_class([weathereventank], many=True)
        self.assertEqual(response.json(), serializer.data)


class OrganizationRiskTestCase(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_list_organization_risks(self):
        """Ensure that users see risks for their organization."""
        OrganizationRiskFactory(organization=self.user.primary_organization)

        url = reverse('organizationrisk-list')
        response = self.client.get(url)

        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_other_organizations_organization_risks_invisible(self):
        """Ensure that users do not see risks for other organizations."""
        # Create an organization risk for a organization the user does not belong to
        OrganizationRiskFactory()

        url = reverse('organizationrisk-list')
        response = self.client.get(url)

        # User should not be able to see it
        self.assertEqual(len(response.json()), 0)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_organization_risk_detail(self):
        org_risk = OrganizationRiskFactory(organization=self.user.primary_organization)

        url = reverse('organizationrisk-detail', kwargs={'pk': org_risk.id})
        response = self.client.get(url)

        self.assertDictEqual(response.json(), {
            'action': None,
            'adaptive_capacity': '',
            'adaptive_capacity_description': '',
            'community_system': {
                'id': org_risk.community_system.id,
                'name': org_risk.community_system.name
            },
            'frequency': '',
            'id': str(org_risk.id),
            'impact_description': '',
            'impact_magnitude': '',
            'intensity': '',
            'probability': '',
            'related_adaptive_values': [],
            'weather_event': {
                'coastal_only': False,
                'concern': None,
                'display_class': '',
                'id': org_risk.weather_event.id,
                'indicators': [],
                'name': org_risk.weather_event.name
            }})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_organization_risk_detail_with_action(self):
        org_risk = OrganizationRiskFactory(organization=self.user.primary_organization)
        org_action = OrganizationActionFactory(organization_risk=org_risk)

        url = reverse('organizationrisk-detail', kwargs={'pk': org_risk.id})
        response = self.client.get(url)

        self.assertDictEqual(response.json()['action'], {
            'name': '',
            'action_goal': '',
            'action_type': '',
            'categories': [],
            'collaborators': [],
            'funding': '',
            'id': str(org_action.id),
            'risk': str(org_risk.id),
            'improvements_impacts': '',
            'implementation_details': '',
            'implementation_notes': '',
            'improvements_adaptive_capacity': '',
            'visibility': 'private',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_organization_risk(self):
        community_system = CommunitySystemFactory()
        weather_event = WeatherEventFactory()

        payload = {
            'adaptive_capacity': '',
            'adaptive_capacity_description': '',
            'community_system': community_system.id,
            'frequency': '',
            'impact_description': '',
            'impact_magnitude': '',
            'intensity': '',
            'probability': '',
            'related_adaptive_values': [],
            'weather_event': weather_event.id
        }

        url = reverse('organizationrisk-list')
        response = self.client.post(url, data=payload)
        risk_id = response.json()['id']

        organization_risk = OrganizationRisk.objects.get(id=risk_id)
        # Should automatically use the logged in user's primary_organization
        self.assertEqual(organization_risk.organization, self.user.primary_organization)
        self.assertEqual(organization_risk.community_system, community_system)
        self.assertEqual(organization_risk.weather_event, weather_event)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_edit_organization_risk(self):
        # Create an organization risk for the user's primary_organization
        org_risk = OrganizationRiskFactory(organization=self.user.primary_organization)
        new_community_system = CommunitySystemFactory()

        # Update the organization risk to use the new community system
        payload = {
            'community_system': new_community_system.id,
            'weather_event': org_risk.weather_event.id
        }

        url = reverse('organizationrisk-detail', kwargs={'pk': org_risk.id})
        response = self.client.put(url, data=payload)
        risk_id = response.json()['id']

        organization_risk = OrganizationRisk.objects.get(id=risk_id)
        # Should automatically use the logged in user's primary_organization
        self.assertEqual(organization_risk.community_system.id, new_community_system.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cannot_edit_other_organizations_risk(self):
        # Create an organization risk with a new organization the user does not belong to
        org_risk = OrganizationRiskFactory()
        new_community_system = CommunitySystemFactory()

        # Update the organization risk to use the new community system
        payload = {
            'community_system': new_community_system.id,
            'weather_event': org_risk.weather_event.id
        }

        url = reverse('organizationrisk-detail', kwargs={'pk': org_risk.id})
        response = self.client.put(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unique_together_validation(self):
        community_system = CommunitySystemFactory()
        weather_event = WeatherEventFactory()

        payload = {
            'adaptive_capacity': '',
            'adaptive_capacity_description': '',
            'community_system': community_system.id,
            'frequency': '',
            'impact_description': '',
            'impact_magnitude': '',
            'intensity': '',
            'probability': '',
            'related_adaptive_values': [],
            'weather_event': weather_event.id
        }

        # First call should successfully create the Risk
        url = reverse('organizationrisk-list')
        response = self.client.post(url, data=payload)
        self.assertIn('id', response.json())
        self.assertEqual(response.status_code, 201)

        # Second call should should raise a validation error with 400 status code
        url = reverse('organizationrisk-list')
        response = self.client.post(url, data=payload)
        self.assertNotIn('id', response.json())
        self.assertEqual(response.status_code, 400)


class OrganizationActionTestCase(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_list_organization_actions(self):
        OrganizationActionFactory(
            organization_risk__organization=self.user.primary_organization)

        url = reverse('organizationaction-list')
        response = self.client.get(url)

        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_other_organizations_organization_actions_invisible(self):
        OrganizationActionFactory()

        url = reverse('organizationaction-list')
        response = self.client.get(url)

        self.assertEqual(len(response.json()), 0)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_organization_action_detail(self):
        action = OrganizationActionFactory(
            organization_risk__organization=self.user.primary_organization)

        url = reverse('organizationaction-detail', kwargs={'pk': action.id})
        response = self.client.get(url)

        self.assertDictEqual(response.json(), {
            'name': '',
            'action_goal': '',
            'action_type': '',
            'categories': [],
            'collaborators': [],
            'funding': '',
            'id': str(action.id),
            'improvements_impacts': '',
            'implementation_details': '',
            'implementation_notes': '',
            'improvements_adaptive_capacity': '',
            'visibility': 'private',
            'risk': str(action.organization_risk.id)
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_organization_action_categories_detail(self):
        """Ensure that categories are serialized as objects."""
        category = ActionCategory.objects.create()
        action = OrganizationActionFactory(
            organization_risk__organization=self.user.primary_organization,
            categories=[category])

        url = reverse('organizationaction-detail', kwargs={'pk': action.id})
        response = self.client.get(url)

        self.assertEqual(len(response.json()['categories']), 1)
        self.assertDictEqual(response.json()['categories'][0], {
            'description': '',
            'icon': category.icon,
            'id': str(category.id),
            'name': ''
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_organization_action(self):
        org_risk = OrganizationRiskFactory(organization=self.user.primary_organization)

        payload = {
            'name': '',
            'action_goal': '',
            'action_type': '',
            'categories': [],
            'collaborators': [],
            'funding': '',
            'improvements_impacts': '',
            'implementation_details': '',
            'implementation_notes': '',
            'improvements_adaptive_capacity': '',
            'visibility': 'private',
            'risk': str(org_risk.id)
        }

        url = reverse('organizationaction-list')
        response = self.client.post(url, data=payload)
        action_id = response.json()['id']

        org_action = OrganizationAction.objects.get(id=action_id)
        # Should automatically use the logged in user's primary_organization
        self.assertEqual(org_action.organization_risk.id, org_risk.id)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_edit_organization_action(self):
        action = OrganizationActionFactory(
            organization_risk__organization=self.user.primary_organization)
        new_action_description = 'Sample action description'

        payload = {
            'name': new_action_description,
            'action_goal': '',
            'action_type': '',
            'categories': [],
            'collaborators': [],
            'funding': '',
            'improvements_impacts': '',
            'implementation_details': '',
            'implementation_notes': '',
            'improvements_adaptive_capacity': '',
            'visibility': 'private',
            'risk': str(action.organization_risk.id)
        }

        url = reverse('organizationaction-detail', kwargs={'pk': action.id})
        response = self.client.put(url, data=payload)
        action_id = response.json()['id']

        org_action = OrganizationAction.objects.get(id=action_id)
        self.assertEqual(org_action.name, new_action_description)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_edit_organization_action_category(self):
        """Ensure that categories can be set by ID."""
        action = OrganizationActionFactory(
            organization_risk__organization=self.user.primary_organization)
        category = ActionCategory.objects.create()

        payload = {
            'name': '',
            'action_goal': '',
            'action_type': '',
            'categories': [str(category.id)],
            'collaborators': [],
            'funding': '',
            'improvements_impacts': '',
            'implementation_details': '',
            'implementation_notes': '',
            'improvements_adaptive_capacity': '',
            'visibility': 'private',
            'risk': str(action.organization_risk.id)
        }

        url = reverse('organizationaction-detail', kwargs={'pk': action.id})
        response = self.client.put(url, data=payload)
        action_id = response.json()['id']

        org_action = OrganizationAction.objects.get(id=action_id)
        self.assertIn(category, org_action.categories.all())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cannot_use_other_organization_risk(self):
        # Use a risk for an organization the user does not belong to
        org_risk = OrganizationRiskFactory()

        payload = {
            'name': '',
            'action_goal': '',
            'action_type': '',
            'categories': [],
            'collaborators': [],
            'funding': '',
            'improvements_impacts': '',
            'implementation_details': '',
            'implementation_notes': '',
            'improvements_adaptive_capacity': '',
            'visibility': 'private',
            'risk': str(org_risk.id)
        }

        url = reverse('organizationaction-list')
        response = self.client.post(url, data=payload)

        # Should fail and send back a 4xx error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SuggestedActionTestCase(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_see_public_actions(self):
        # Ensure the user and a remote organization are in the same georegion
        georegion = GeoRegionFactory()
        self.user.primary_organization.location.point = georegion.geom.point_on_surface
        action = OrganizationActionFactory(
            organization_risk__organization__location__coords=georegion.geom.point_on_surface,
            visibility=OrganizationAction.Visibility.PUBLIC
        )

        url = reverse('suggestedaction-list') + '?' + urlencode({
            'we': action.organization_risk.weather_event_id,
            'cs': action.organization_risk.community_system_id
        })
        response = self.client.get(url)

        # We should get back the action as a suggestion
        self.assertEqual(len(response.json()), 1)
        self.assertDictEqual(response.json()[0], {
            'id': str(action.id),
            'name': action.name,
            'categories': []
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ignore_private_actions(self):
        # Ensure the user and a remote organization are in the same georegion
        georegion = GeoRegionFactory()
        self.user.primary_organization.location.point = georegion.geom.point_on_surface
        action = OrganizationActionFactory(
            organization_risk__organization__location__coords=georegion.geom.point_on_surface,
            visibility=OrganizationAction.Visibility.PRIVATE
        )

        url = reverse('suggestedaction-list') + '?' + urlencode({
            'we': action.organization_risk.weather_event_id,
            'cs': action.organization_risk.community_system_id
        })
        response = self.client.get(url)

        # We should get back the action as a suggestion
        self.assertEqual(len(response.json()), 0)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ignore_mismatch_weather_event_actions(self):
        # Ensure the user and a remote organization are in the same georegion
        georegion = GeoRegionFactory()
        self.user.primary_organization.location.point = georegion.geom.point_on_surface
        action = OrganizationActionFactory(
            organization_risk__organization__location__coords=georegion.geom.point_on_surface,
            visibility=OrganizationAction.Visibility.PUBLIC
        )
        weather_event = WeatherEventRankFactory(georegion=georegion)

        url = reverse('suggestedaction-list') + '?' + urlencode({
            'we': weather_event.id,
            'cs': action.organization_risk.community_system_id
        })
        response = self.client.get(url)

        # We should get back the action as a suggestion
        self.assertEqual(len(response.json()), 0)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ignore_mismatch_community_system_actions(self):
        # Ensure the user and a remote organization are in the same georegion
        georegion = GeoRegionFactory()
        self.user.primary_organization.location.point = georegion.geom.point_on_surface
        action = OrganizationActionFactory(
            organization_risk__organization__location__coords=georegion.geom.point_on_surface,
            visibility=OrganizationAction.Visibility.PUBLIC
        )
        community_system = CommunitySystemFactory()

        url = reverse('suggestedaction-list') + '?' + urlencode({
            'we': action.organization_risk.weather_event_id,
            'cs': community_system.id
        })
        response = self.client.get(url)

        # We should get back the action as a suggestion
        self.assertEqual(len(response.json()), 0)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
