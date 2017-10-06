import logging
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin

from registration.backends.hmac.views import RegistrationView as BaseRegistrationView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS

from users.serializers import AuthTokenSerializer

from users.forms import UserForm


logger = logging.getLogger(__name__)


class RegistrationView(BaseRegistrationView):
    """Extends default Django-registration HMAC view."""

    form_class = UserForm


class AppHomeView(LoginRequiredMixin, View):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (TokenAuthentication, )

    def get(self, request, *args, **kwargs):
        template = 'app_home.html'
        return render(request, template)


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


class PlanitObtainAuthToken(ObtainAuthToken):
    """Anonymous endpoint for users to request tokens from for authentication."""

    serializer_class = AuthTokenSerializer
