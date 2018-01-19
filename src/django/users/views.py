import logging
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin

from registration.backends.hmac.views import RegistrationView as BaseRegistrationView

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from users.serializers import AuthTokenSerializer

from users.forms import UserForm, UserProfileForm
from users.models import PlanItOrganization, PlanItUser
from users.permissions import IsAuthenticatedOrCreate
from users.serializers import OrganizationSerializer, UserSerializer, UserOrgSerializer


logger = logging.getLogger(__name__)


class RegistrationView(BaseRegistrationView):
    """Extends default Django-registration HMAC view."""

    form_class = UserForm


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


class UserViewSet(ModelViewSet):
    queryset = PlanItUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticatedOrCreate, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # We set is_active to False because we want to require email verification
        serializer.save(is_active=False)

        # If got this far, user was created successfully. Update and send registration email.
        user = serializer.instance
        RegistrationView(request=self.request).send_activation_email(user)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class CurrentUserView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        return Response(UserOrgSerializer(request.user).data)


class OrganizationViewSet(ModelViewSet):
    queryset = PlanItOrganization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = (IsAuthenticated,)
