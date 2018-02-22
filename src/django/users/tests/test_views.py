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
from users.tests.factories import LocationFactory, OrganizationFactory, UserFactory

from planit_data.models import GeoRegion, OrganizationWeatherEvent
from planit_data.tests.factories import WeatherEventFactory


class UserCreationApiTestCase(APITestCase):
    def test_user_created(self):
        user_data = {
            'email': 'test@azavea.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password1': 'sooperseekrit',
            'password2': 'sooperseekrit'
        }

        url = reverse('planituser-list')
        response = self.client.post(url, user_data, format='json')

        # should get created status
        self.assertEqual(response.status_code, 201)

        # check user exists
        user = PlanItUser.objects.get(email=user_data['email'])
        self.assertEqual(user.first_name, user_data['first_name'])

        self.assertFalse(user.is_active, 'User should not be active until email verified')

        # check user has no organizations
        self.assertEqual(0, user.organizations.all().count(), 'User should have no organizations')
        self.assertEqual(user.primary_organization, None,
                         'User should have no primary organization')

    def test_user_created_can_log_in(self):
        user_data = {
            'email': 'test@azavea.com',
            'first_name': 'Test',
            'last_name': 'User',
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
            'first_name': 'Test',
            'last_name': 'User',
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
            'first_name': 'Test',
            'last_name': 'User',
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
            'first_name': '',
            'last_name': None,
            'password1': '',
            'password2': ''
        }

        url = reverse('planituser-list')
        response = self.client.post(url, user_data, format='json')
        self.assertEqual(response.status_code, 400)
        result = response.json()

        self.assertEqual(result['first_name'][0], 'This field may not be blank.')
        self.assertEqual(result['last_name'][0], 'This field may not be null.')
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

        url = reverse('planituser-detail', kwargs={'pk': user.pk})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, 200)
        result = response.json()
        # should have response with one user, our test user
        self.assertEqual(result['email'], 'admin@azavea.com')

    def test_get_auth_required(self):
        """Ensure an unauthenticated request cannot GET."""
        response = self.client.get('/api/user/', format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


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

    def test_api_token_auth_anonymous_valid(self):
        """Ensure that users can authenticate for their API token."""
        token = Token.objects.get(user=self.user)

        url = reverse('token_auth')
        response = self.client.post(url, self.credentials)

        self.assertEqual(response.json(), {'token': token.key})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api_token_auth_authenticated_user_valid(self):
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

    def test_api_token_auth_invalid_failure(self):
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

        city_id = 7
        org_data = {
            'name': 'Test Organization',
            'location': {
                'properties': {
                    'api_city_id': city_id,
                }
            },
            'units': 'METRIC'
        }
        url = reverse('planitorganization-list')
        response = self.client.post(url, org_data, format='json')

        # should get created status
        self.assertEqual(response.status_code, 201)

        # check organization exists
        org = PlanItOrganization.objects.get(name='Test Organization')
        self.assertEqual(org.location.api_city_id, city_id)
        self.assertEqual(org.units, org_data['units'])

    @mock.patch('users.models.make_token_api_request')
    @override_settings(DEBUG_PROPAGATE_EXCEPTIONS=True)  # Do not log the expected exception
    def test_org_created_api_failure(self, api_wrapper_mock):
        # Raise an exception when we try to communicate with the Climate Change API
        api_wrapper_mock.side_effect = Exception()

        org_data = {
            'name': 'Test Organization',
            'location': {
                'properties': {
                    'api_city_id': 7,
                }
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
    def test_org_updated_api_failure(self, api_wrapper_mock):
        # Raise an exception when we try to communicate with the Climate Change API
        api_wrapper_mock.side_effect = Exception()

        org = PlanItOrganization.objects.create(
            name="Starting Name"
        )
        self.user.organizations.add(org)

        org_data = {
            'name': 'Test Organization',
            'location': {
                'properties': {
                    'api_city_id': 7,
                }
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

    @mock.patch.object(PlanItLocation.objects, 'from_api_city')
    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    def test_organization_saves_user_in_created_by(self, import_mock, from_api_city_mock):
        from_api_city_mock.return_value = LocationFactory()

        org_data = {
            'name': 'Test Organization',
            'location': {
                'properties': {
                    'api_city_id': 7,
                }
            },
            'units': 'METRIC'
        }
        url = reverse('planitorganization-list')
        response = self.client.post(url, org_data, format='json')

        org = PlanItOrganization.objects.get(id=response.json()['id'])
        self.assertEqual(org.created_by, self.user)

    def test_organization_update_does_not_change_created_by(self):
        org = OrganizationFactory(
            name="Starting Name",
            created_by=UserFactory(),
            location__api_city_id=7
        )
        self.user.organizations.add(org)

        org_data = {
            'name': 'Test Organization',
            'location': {
                'properties': {
                    'api_city_id': 7,
                }
            },
            'units': 'METRIC',
            'weather_events': []
        }
        url = reverse('planitorganization-detail', kwargs={'pk': org.id})
        response = self.client.put(url, org_data, format='json')

        org = PlanItOrganization.objects.get(id=response.json()['id'])
        self.assertNotEqual(org.created_by, self.user)

    def test_update_weather_events_saves_data(self):
        org = OrganizationFactory(
            name="Starting Name",
            created_by=UserFactory(),
            location__api_city_id=7
        )
        self.user.organizations.add(org)

        we = WeatherEventFactory()

        org_data = {
            'name': 'Test Organization',
            'location': {
                'properties': {
                    'api_city_id': 7,
                }
            },
            'units': 'METRIC',
            'weather_events': [we.pk]
        }
        url = reverse('planitorganization-detail', kwargs={'pk': org.id})
        response = self.client.put(url, org_data, format='json')

        org = PlanItOrganization.objects.get(id=response.json()['id'])
        self.assertEqual(
            [we.pk],
            list(org.weather_events.values_list('weather_event_id', flat=True))
        )

    def test_update_weather_events_deletes_existing_models(self):
        org = OrganizationFactory(
            name="Starting Name",
            created_by=UserFactory(),
            location__api_city_id=7
        )
        self.user.organizations.add(org)

        we1 = WeatherEventFactory()
        we2 = WeatherEventFactory()
        org_we = OrganizationWeatherEvent.objects.create(organization=org, weather_event=we1)
        self.assertEqual(1, OrganizationWeatherEvent.objects.filter(id=org_we.pk).count())

        org_data = {
            'name': 'Test Organization',
            'location': {
                'properties': {
                    'api_city_id': 7,
                }
            },
            'units': 'METRIC',
            'weather_events': [we2.pk]
        }
        url = reverse('planitorganization-detail', kwargs={'pk': org.id})
        response = self.client.put(url, org_data, format='json')

        org = PlanItOrganization.objects.get(id=response.json()['id'])
        self.assertEqual(0, OrganizationWeatherEvent.objects.filter(id=org_we.pk).count())

    @mock.patch.object(PlanItLocation.objects, 'from_api_city')
    @mock.patch.object(PlanItOrganization, 'import_weather_events')
    def test_organization_duplicate_name_allowed(self, import_mock, from_api_city_mock):
        """Creating an organization with same name as another should succeed."""
        from_api_city_mock.return_value = LocationFactory()

        # Make an existing object to conflict with
        org = OrganizationFactory(
            name="Test Name",
            location__api_city_id=7
        )

        org_data = {
            'name': org.name,
            'location': {
                'properties': {
                    'api_city_id': 5,
                }
            },
            'units': 'METRIC'
        }
        url = reverse('planitorganization-list')
        response = self.client.post(url, org_data, format='json')

        # There should be two organizations
        self.assertEqual(PlanItLocation.objects.all().count(), 2)
        self.assertTrue(PlanItOrganization.objects.filter(id=response.json()['id']).exists())

    def test_organization_name_unique_by_location(self):
        """Creating an organization with same name and location should fail."""
        # Make an existing object to conflict with
        org = OrganizationFactory(
            name="Test Name",
            location__api_city_id=7
        )

        org_data = {
            'name': org.name,
            'location': {
                'properties': {
                    'api_city_id': org.location.api_city_id,
                }
            },
            'units': 'METRIC'
        }
        url = reverse('planitorganization-list')
        response = self.client.post(url, org_data, format='json')

        # We should have only one organization
        self.assertEqual(PlanItLocation.objects.all().count(), 1)
        self.assertEqual(response.status_code, 400)


class CsrfTestCase(TestCase):
    def setUp(self):
        # Create a client that enforces CSRF checks
        self.client = Client(enforce_csrf_checks=True)

    def test_csrf_for_token_auth(self):
        """Ensure that CSRF token is not needed when API token is used.

        The Temperate does not use session authentication, and uses API tokens instead of a CSRF
        token (Which is needed to prevent a user's session from being hijacked). A user that is
        session authenticated in the background should be able to use unsafe methods so long as
        their API token is provided.
        """
        user = PlanItUser.objects.create_user(
            first_name='Test',
            last_name='User',
            email='user@azavea.com',
            password='testpass'
        )
        token = Token.objects.get(user=user)

        # Log in with the client using a non-token authentication (e.g. session)
        self.client.force_login(user=user)

        # Configure test data
        org = PlanItOrganization.objects.create(name='Test Organization')
        user.organizations.add(org)

        # Make a request that doesn't include CSRF token, but does include API token
        url = reverse('planitorganization-detail', kwargs={'pk': org.id})
        result = self.client.get(
            url,
            HTTP_AUTHORIZATION='Token {}'.format(token.key)
        )

        # Ensure the request was accepted
        self.assertTrue(status.is_success(result.status_code),
                        "Expected success status, received {} instead".format(result.status_code))

    def test_csrf_hijack_without_token_auth(self):
        """Ensure that requests without a CSRF or API token are rejected."""
        user = PlanItUser.objects.create_user(
            first_name='Test',
            last_name='User',
            email='user@azavea.com',
            password='testpass'
        )

        # Log in with the client using a non-token authentication (e.g. session)
        self.client.force_login(user=user)

        # Configure test data
        org = PlanItOrganization.objects.create(name='Test Organization')

        # Make a request that doesn't include a CSRF or API token, indicating a potential hijack
        url = reverse('planitorganization-detail', kwargs={'pk': org.id})
        result = self.client.delete(url)

        # Ensure the request was accepted
        self.assertTrue(status.is_client_error(result.status_code),
                        "Expected error status, received {} instead".format(result.status_code))

    def test_basic_token_auth(self):
        """Ensure that API token authentication enables a user to perform actions."""
        user = PlanItUser.objects.create_user(
            first_name='Test',
            last_name='User',
            email='user@azavea.com',
            password='testpass'
        )
        token = Token.objects.get(user=user)

        # Configure test data
        org = PlanItOrganization.objects.create(name='Test Organization')
        user.organizations.add(org)

        # Make a request explicitly using token authentication
        url = reverse('planitorganization-detail', kwargs={'pk': org.id})
        result = self.client.get(
            url,
            HTTP_AUTHORIZATION='Token {}'.format(token.key)
        )

        # Ensure the request was accepted
        self.assertTrue(status.is_success(result.status_code),
                        "Expected success status, received {} instead".format(result.status_code))
