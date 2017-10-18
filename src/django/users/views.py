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
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from users.serializers import AuthTokenSerializer

from users.forms import UserForm, UserProfileForm
from users.models import PlanItUser
from users.serializers import UserSerializer


logger = logging.getLogger(__name__)


class RegistrationView(BaseRegistrationView):
    """Extends default Django-registration HMAC view."""

    form_class = UserForm


class PlanitHomeView(LoginRequiredMixin, View):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, )

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
    authentication_classes = (TokenAuthentication, )

    def get_initial(self, request):
        user = request.user
        self.initial = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'organization': user.organization
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
            user.organization = self.form.cleaned_data.get('organization')
            user.save()

        return HttpResponseRedirect('{}'.format(reverse('edit_profile')))


class PlanitObtainAuthToken(ObtainAuthToken):
    """Anonymous endpoint for users to request tokens from for authentication."""

    serializer_class = AuthTokenSerializer


class UserViewSet(ModelViewSet):
    queryset = PlanItUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password = serializer.validated_data.pop('password')
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # If created successfully, send email
        user = serializer.instance
        user.is_active = False
        user.set_password(password)
        user.save()
        # send the django registration email
        RegistrationView(request=self.request).send_activation_email(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
