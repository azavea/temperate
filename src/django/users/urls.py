"""URLconf for registration and activation, using django-registration's HMAC activation workflow."""

from django.conf.urls import include, url

from users.views import RegistrationView, PlanitHomeView


urlpatterns = [
    url(r'^register/$',
        RegistrationView.as_view(),
        name='registration_register'),
    url(r'^api/new_token/', PlanitHomeView().new_token, name='new_token'),
    url(r'^api/$', PlanitHomeView.as_view(), name='planit_home'),
    url(r'', include('registration.backends.hmac.urls')),
]
