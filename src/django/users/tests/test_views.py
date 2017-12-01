# User management tests
import json
from unittest import mock

from django.contrib.auth import get_user_model
from django.test import TestCase

from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase

from users.models import PlanItOrganization, PlanItUser


class UserCreationApiTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = PlanItUser.objects.create(email='admin@azavea.com', is_superuser=True)
        self.admin.save()
        self.admin.set_password('adminseekrit')
        self.admin.save()
        self.admin_token = Token.objects.get(user=self.admin)
        # authenticate test reqeusts with an admin user token
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        self.default_org = PlanItOrganization.objects.get(name=PlanItOrganization.
                                                          DEFAULT_ORGANIZATION)

    def test_user_created(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': 'Test',
            'lastName': 'User',
            'password1': 'sooperseekrit',
            'password2': 'sooperseekrit'
        }

        # unset credentials; should be able to create user without being authenticated
        self.client.credentials()
        response = self.client.post('/api/users/', user_data, format='json')

        # should get created status
        self.assertEqual(response.status_code, 201)

        # check user exists
        user = PlanItUser.objects.get(email=user_data['email'])
        self.assertEqual(user.first_name, user_data['firstName'])

        self.assertFalse(user.is_active, 'User should not be active until email verified')

        # check user belongs to default organization
        self.assertEqual(user.organizations.first(), self.default_org,
                         'User should belong to default organization')
        self.assertEqual(user.primary_organization, self.default_org,
                         'User should belong to default organization')

        # make user active so can login
        user.is_active = True
        user.save()

        # check user can authenticate with password
        self.assertTrue(self.client.login(username=user_data['email'],
                                          password=user_data['password1']))

    def test_user_passwords_must_match(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': 'Test',
            'lastName': 'User',
            'password1': 'sooperseekrit',
            'password2': 'sewperseekrit'
        }

        response = self.client.post('/api/users/', user_data, format='json')
        self.assertEqual(response.status_code, 400)
        result = json.loads(response.content)
        self.assertEqual(result['non_field_errors'][0], 'Passwords do not match.')

    def test_password_validators_run(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': 'Test',
            'lastName': 'User',
            'password1': '2short',
            'password2': '2short'
        }

        response = self.client.post('/api/users/', user_data, format='json')
        self.assertEqual(response.status_code, 400)
        result = json.loads(response.content)
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

        response = self.client.post('/api/users/', user_data, format='json')
        self.assertEqual(response.status_code, 400)
        result = json.loads(response.content)

        self.assertEqual(result['firstName'][0], 'This field may not be blank.')
        self.assertEqual(result['lastName'][0], 'This field may not be null.')
        self.assertEqual(result['password1'][0], 'This field may not be blank.')
        self.assertEqual(result['password2'][0], 'This field may not be blank.')

    def test_get_auth_required(self):
        response = self.client.get('/api/users/', format='json')
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.content)
        # should have response with one user, the test admin user
        self.assertEqual(result['count'], 1)
        self.assertEqual(result['results'][0]['email'], 'admin@azavea.com')

        # unset token; check request is rejected as forbidden
        self.client.credentials()
        response = self.client.get('/api/users/', format='json')
        self.assertEqual(response.status_code, 403)


class OrganizationApiTestCase(APITestCase):

    def setUp(self):
        user_class = get_user_model()
        self.user = user_class.objects.create_user('user', 'user@example.com',
                                                   'password')
        self.client.force_authenticate(user=self.user)

    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    @mock.patch('users.models.make_token_api_request')
    def test_org_created(self, api_wrapper_mock, import_weather_events_mock):
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
                "is_coastal": False,
                "population": 1526006,
                "region": 11
            }
        }
        org_data = {
            'name': 'Test Organization',
            'location': {
                'api_city_id': 7,
            },
            'units': 'METRIC'
        }

        response = self.client.post('/api/organizations/', org_data, format='json')

        # should get created status
        self.assertEqual(response.status_code, 201)

        # check organization exists
        org = PlanItOrganization.objects.get(name='Test Organization')
        self.assertEqual(org.location.api_city_id, org_data['location']['api_city_id'])
        self.assertEqual(org.units, org_data['units'])
