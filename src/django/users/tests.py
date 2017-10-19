# User management tests

import json

from django.test import TestCase

from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import PlanItUser


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

    def test_user_created(self):
        user_data = {
            'email': 'test@azavea.com',
            'firstName': 'Test',
            'lastName': 'User',
            'organization': 'Azavea',
            'city': 1,
            'password1': 'sooperseekrit',
            'password2': 'sooperseekrit'
        }

        response = self.client.post('/api/users/', user_data, format='json')

        print(response.content)

        # should get created status
        self.assertEqual(response.status_code, 201)

        # check user exists
        user = PlanItUser.objects.get(email=user_data['email'])
        self.assertEqual(user.api_city_id, user_data['city'])

        self.assertFalse(user.is_active, 'User should not be active until email verified')

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
            'organization': 'Azavea',
            'city': None,
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
            'organization': 'Azavea',
            'city': 0,
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
            'organization': 'Azavea',
            'city': 'Philadelphia',
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
