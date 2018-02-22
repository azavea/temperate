"""URLconf for registration and activation, using django-registration's HMAC activation workflow."""

from django.conf.urls import include, url

from users.views import (PlanitHomeView,
                         RegistrationView,
                         UserProfileView,
                         PasswordResetInitView,
                         PasswordResetView)


urlpatterns = [
    url(r'^register/$',
        RegistrationView.as_view(),
        name='registration_register'),
    url(r'^password_reset/send_email/$',
        PasswordResetInitView.as_view(),
        name='password_reset_send_email'),
    url(r'^password_reset/$',
        PasswordResetView.as_view(),
        name='password_reset'),
    url(r'^api/new_token/', PlanitHomeView().new_token, name='new_token'),
    url(r'^api/$', PlanitHomeView.as_view(), name='planit_home'),
    url(r'^profile/$', UserProfileView.as_view(), name='edit_profile'),
    url(r'', include('registration.backends.hmac.urls')),
]
