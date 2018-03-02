import logging

from django.core.mail import send_mail
from django.db import transaction
from django.http import HttpResponseRedirect
from django.http.request import QueryDict
from django.shortcuts import render
from django.urls import reverse
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from registration.backends.hmac.views import (
    RegistrationView as BaseRegistrationView,
    ActivationView as BaseActivationView,
)

from rest_framework import status, mixins
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from users.serializers import AuthTokenSerializer

from users.forms import (UserForm, UserProfileForm, PasswordResetInitForm,
                         PasswordResetForm, AddCityForm)
from users.models import PlanItOrganization, PlanItUser
from users.permissions import IsAuthenticatedOrCreate
from users.serializers import OrganizationSerializer, UserSerializer, UserOrgSerializer

from django.conf import settings


logger = logging.getLogger(__name__)


class RegistrationView(BaseRegistrationView):
    """Extends default Django-registration HMAC view."""

    form_class = UserForm

    class Meta:
        proxy = True

    def send_activation_email(self, user):
        """Send the activation mail.

        Override to send multipart HTML emails via customized `email_user` method."""

        self._send_email(user, 'registration/activation_email')

    def send_invitation_email(self, user):
        self._send_email(user, 'registration/invitation_email')

    def _send_email(self, user, template):
        activation_key = self.get_activation_key(user)
        context = self.get_email_context(activation_key)
        context.update({
            'user': user,
        })
        user.email_user(template, context)


class JsonFormView(APIView):
    def form_valid(self, form):
        pass

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.data)
        if form.is_valid():
            self.form_valid(form)
            return Response({'status': 'ok'}, content_type='application/json')
        return Response({'errors': form.errors}, content_type='application/json',
                        status=400)


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetInitView(JsonFormView):
    permission_classes = (AllowAny, )
    form_class = PasswordResetInitForm

    def form_valid(self, form):
        form.send_email()
        return Response({'status': 'ok'})


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetView(JsonFormView):
    permission_classes = (AllowAny, )
    form_class = PasswordResetForm

    def form_valid(self, form):
        form.cleaned_data['user'].set_password(form.cleaned_data['password1'])
        form.cleaned_data['user'].save()
        return Response({'status': 'ok'})


class ActivationView(BaseActivationView):
    success_url = settings.PLANIT_APP_HOME + '/login?activated=true'

    def get(self, *args, **kwargs):
        activation_key = kwargs.get('activation_key')
        username = self.validate_key(activation_key)
        if username is not None:
            user = self.get_user(username)
            if user is not None and not user.has_required_fields():
                url = settings.PLANIT_APP_HOME + '/register?email={}&key={}'.format(
                    user.email, activation_key)
                return HttpResponseRedirect(url)

        return super().get(*args, **kwargs)


class PlanitHomeView(LoginRequiredMixin, View):
    permission_classes = (IsAuthenticated, )

    def new_token(self, request):
        """Generate new auth token from within the profile page."""
        if request.method not in SAFE_METHODS:
            user = request.user
            if user.auth_token:
                user.auth_token.delete()
            user.auth_token = Token.objects.create(user=user)
            user.auth_token.save()
        return HttpResponseRedirect('{}'.format(reverse('planit_home')))

    def get(self, request, *args, **kwargs):
        template = 'planit_home.html'
        return render(request, template)


class UserProfileView(LoginRequiredMixin, View):
    permission_classes = (IsAuthenticated, )

    def get_initial(self, request):
        user = request.user
        self.initial = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'organizations': user.organizations.all(),
            'primary_organization': user.primary_organization,
        }
        return self.initial

    def get(self, request, *args, **kwargs):
        self.get_initial(request)
        form = UserProfileForm(initial=self.initial)
        template = 'registration/userprofile_update.html'
        return render(request, template, {'form': form})

    def post(self, request, *args, **kwargs):
        self.get_initial(request)
        user = request.user
        self.form = UserProfileForm(request._post, initial=self.initial)
        if self.form.is_valid():
            user.first_name = self.form.cleaned_data.get('first_name')
            user.last_name = self.form.cleaned_data.get('last_name')
            user.organizations = self.form.cleaned_data.get('organizations')
            user.primary_organization = self.form.cleaned_data.get('primary_organization')
            user.save()

        return HttpResponseRedirect('{}'.format(reverse('edit_profile')))


class PlanitObtainAuthToken(ObtainAuthToken):
    """Anonymous endpoint for users to request tokens from for authentication."""

    permission_classes = (AllowAny, )
    serializer_class = AuthTokenSerializer
    authentication_classes = []


class UserViewSet(mixins.CreateModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.RetrieveModelMixin,
                  GenericViewSet):
    model_class = PlanItUser
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticatedOrCreate, )

    def create(self, request, *args, **kwargs):
        # if 'data' is a QueryDict it must be copied before being modified
        data = request.data.copy() if isinstance(request.data, QueryDict) else request.data
        activation_key = data.pop('activation_key', None)

        if activation_key:
            user_email = ActivationView(request=request).validate_key(activation_key)
        else:
            user_email = None

        if user_email is not None and user_email == data['email']:
            user = PlanItUser.objects.get(email=user_email)
            # Check if they already finished registration
            if user.has_required_fields():
                raise ValidationError({
                    'email': ['A user account has already been created for this email address.']
                })

            serializer = self.get_serializer(user, data=data)
            serializer.is_valid(raise_exception=True)

            # User was invited, email already verified and so account can be made active
            serializer.save(is_active=True)
            user.send_registration_complete_email()
        else:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)

            # We set is_active to False because we want to require email verification
            serializer.save(is_active=False)

            # If got this far, user was created successfully. Update and send registration email.
            user = serializer.instance
            RegistrationView(request=self.request).send_activation_email(user)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        return PlanItUser.objects.filter(pk=self.request.user.pk)


class CurrentUserView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        return Response(UserOrgSerializer(request.user).data)


class OrganizationViewSet(mixins.CreateModelMixin,
                          mixins.UpdateModelMixin,
                          mixins.RetrieveModelMixin,
                          GenericViewSet):
    model_class = PlanItOrganization
    serializer_class = OrganizationSerializer
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        organization = serializer.instance
        for user in organization.users.all():
            RegistrationView(request=request).send_invitation_email(user)

        self.request.user.organizations.add(organization)
        self.request.user.primary_organization = organization
        self.request.user.save()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        return self.request.user.organizations.all()


@method_decorator(csrf_exempt, name='dispatch')
class AddCityView(JsonFormView):
    permission_classes = (AllowAny,)
    form_class = AddCityForm

    def post(self, request, *args, **kwargs):
        """Prevent potentially unwanted requests."""
        if str(request.META['HTTP_ORIGIN']) != str(settings.PLANIT_APP_HOME):
            return Response({'status': 'Unauthorized origin'}, content_type='application/json',
                            status=401)
        return super(AddCityView, self).post(request, *args, **kwargs)

    def form_valid(self, form):
        form.send_email()
        return Response({'status': 'ok'})
