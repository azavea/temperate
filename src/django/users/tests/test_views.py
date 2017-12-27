# User management tests
from unittest import mock

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Polygon, MultiPolygon
from django.test import override_settings, TestCase, Client
from django.urls import reverse

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from users.models import PlanItOrganization, PlanItLocation, PlanItUser
from planit_data.models import GeoRegion


class UserCreationApiTestCase(APITestCase):
    def test_user_created(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': 'Test',
            'lastName': 'User',
            'password1': 'sooperseekrit',
            'password2': 'sooperseekrit'
        }

        url = reverse('planituser-list')
        response = self.client.post(url, user_data, format='json')

        # should get created status
        self.assertEqual(response.status_code, 201)

        # check user exists
        user = PlanItUser.objects.get(email=user_data['email'])
        self.assertEqual(user.first_name, user_data['firstName'])

        self.assertFalse(user.is_active, 'User should not be active until email verified')

        # check user belongs to default organization
        default_org = PlanItOrganization.objects.get(name=PlanItOrganization.DEFAULT_ORGANIZATION)
        self.assertIn(default_org, user.organizations.all(),
                      'User should belong to default organization')
        self.assertEqual(user.primary_organization, default_org,
                         'User should have primary organization set to default organization')

    def test_user_created__can_log_in(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': 'Test',
            'lastName': 'User',
            'password1': 'sooperseekrit',
            'password2': 'sooperseekrit'
        }

        # Use API to create user account
        url = reverse('planituser-list')
        self.client.post(url, user_data, format='json')

        # make user active so can login.
        user = PlanItUser.objects.get(email=user_data['email'])
        user.is_active = True
        user.save()

        # check user can authenticate with password
        authenticated = self.client.login(username=user_data['email'],
                                          password=user_data['password1'])
        self.assertTrue(authenticated)

    def test_user_passwords_must_match(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': 'Test',
            'lastName': 'User',
            'password1': 'sooperseekrit',
            'password2': 'sewperseekrit'
        }

        url = reverse('planituser-list')
        response = self.client.post(url, user_data, format='json')
        self.assertEqual(response.status_code, 400)
        result = response.json()
        self.assertEqual(result['non_field_errors'][0], 'Passwords do not match.')

    def test_password_validators_run(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': 'Test',
            'lastName': 'User',
            'password1': '2short',
            'password2': '2short'
        }

        url = reverse('planituser-list')
        response = self.client.post(url, user_data, format='json')
        self.assertEqual(response.status_code, 400)
        result = response.json()
        self.assertEqual(result['non_field_errors'][0],
                         'This password is too short. It must contain at least 8 characters.')

    def test_user_required_fields(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': '',
            'lastName': None,
            'password1': '',
            'password2': ''
        }

        url = reverse('planituser-list')
        response = self.client.post(url, user_data, format='json')
        self.assertEqual(response.status_code, 400)
        result = response.json()

        self.assertEqual(result['firstName'][0], 'This field may not be blank.')
        self.assertEqual(result['lastName'][0], 'This field may not be null.')
        self.assertEqual(result['password1'][0], 'This field may not be blank.')
        self.assertEqual(result['password2'][0], 'This field may not be blank.')

    def test_get_authenticated_user(self):
        user = PlanItUser.objects.create_user(
            email='admin@azavea.com',
            password='sooperseekrit',
            first_name='Test',
            last_name='User'
        )
        token = Token.objects.get(user=user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        url = reverse('planituser-list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, 200)
        result = response.json()
        # should have response with one user, our test user
        self.assertEqual(result['count'], 1)
        self.assertEqual(result['results'][0]['email'], 'admin@azavea.com')

    def test_get_auth_required(self):
        """Ensure an unauthenticated request cannot GET."""
        response = self.client.get('/api/users/', format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class UserAuthenticationApiTestCase(TestCase):
    def setUp(self):
        self.credentials = {
            'email': 'user@azavea.com',
            'password': 'password'
        }
        self.user = PlanItUser.objects.create_user(
            first_name='Test',
            last_name='User',
            **self.credentials
        )
        self.client = Client(enforce_csrf_checks=True)

    def test_api_token_auth__anonymous__valid(self):
        """Ensure that users can authenticate for their API token."""
        token = Token.objects.get(user=self.user)

        url = reverse('token_auth')
        response = self.client.post(url, self.credentials)

        self.assertEqual(response.json(), {'token': token.key})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api_token_auth__authenticated_user__valid(self):
        """Ensure that API users can use token authenticate if they are already logged in.

        This is important if the user is logged into Django directly, and tries to use the Angular
        front-end which requires the user to authenticate independantly.
        """
        token = Token.objects.get(user=self.user)
        self.client.force_login(self.user)

        url = reverse('token_auth')
        response = self.client.post(url, self.credentials)

        self.assertEqual(response.json(), {'token': token.key})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api_token_auth__invalid__failure(self):
        """Ensure that invalid authentications are rejected."""
        url = reverse('token_auth')
        response = self.client.post(url, dict(self.credentials, password='badpass'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class OrganizationApiTestCase(APITestCase):

    def setUp(self):
        user_class = get_user_model()
        self.user = user_class.objects.create_user('user', 'user@example.com',
                                                   'password')
        self.client.force_authenticate(user=self.user)

    @mock.patch('users.models.make_token_api_request')
    def test_org_created(self, api_wrapper_mock):
        api_wrapper_mock.return_value = {
            "id": 7,
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -75.16379,
                    39.95233
                ]
            },
            "properties": {
                "datasets": [
                    "NEX-GDDP",
                    "LOCA"
                ],
                "name": "Philadelphia",
                "admin": "PA",
                "proximity": {
                    "ocean": False
                },
                "population": 1526006,
                "region": 11
            }
        }

        # Create a GeoRegion that encompasses (-75.16379, 39.95233)
        GeoRegion.objects.create(
            name="Test GeoRegion",
            geom=MultiPolygon(Polygon(((0, 0), (0, 100), (-100, 100),
                                       (-100, 0), (0, 0))))
        )

        org_data = {
            'name': 'Test Organization',
            'location': {
                'api_city_id': 7,
            },
            'units': 'METRIC'
        }
        url = reverse('planitorganization-list')
        response = self.client.post(url, org_data, format='json')

        # should get created status
        self.assertEqual(response.status_code, 201)

        # check organization exists
        org = PlanItOrganization.objects.get(name='Test Organization')
        self.assertEqual(org.location.api_city_id, org_data['location']['api_city_id'])
        self.assertEqual(org.units, org_data['units'])

    @mock.patch('users.models.make_token_api_request')
    @override_settings(DEBUG_PROPAGATE_EXCEPTIONS=True)  # Do not log the expected exception
    def test_org_created__api_failure(self, api_wrapper_mock):
        # Raise an exception when we try to communicate with the Climate Change API
        api_wrapper_mock.side_effect = Exception()

        # Clear the existing default organization to show nothing has been created
        PlanItOrganization.objects.all().delete()

        org_data = {
            'name': 'Test Organization',
            'location': {
                'api_city_id': 7,
            },
            'units': 'METRIC'
        }
        url = reverse('planitorganization-list')

        with self.assertRaises(Exception):
            self.client.post(url, org_data, format='json')

        # No PlanItLocation objects should have been created
        self.assertFalse(PlanItLocation.objects.all().exists())

        # No PlanItOrganization objects should have been created
        self.assertFalse(PlanItOrganization.objects.all().exists())

    @mock.patch('users.models.make_token_api_request')
    @override_settings(DEBUG_PROPAGATE_EXCEPTIONS=True)  # Do not log the expected exception
    def test_org_updated__api_failure(self, api_wrapper_mock):
        # Raise an exception when we try to communicate with the Climate Change API
        api_wrapper_mock.side_effect = Exception()

        org = PlanItOrganization.objects.create(
            name="Starting Name"
        )

        org_data = {
            'name': 'Test Organization',
            'location': {
                'api_city_id': 7,
            },
            'units': 'METRIC'
        }
        url = reverse('planitorganization-detail', kwargs={'pk': org.id})

        with self.assertRaises(Exception):
            self.client.put(url, org_data, format='json')

        # No PlanItLocation objects should have been created
        self.assertFalse(PlanItLocation.objects.all().exists())

        # The organization should not have been changed
        org.refresh_from_db()
        self.assertEqual(org.name, "Starting Name")
