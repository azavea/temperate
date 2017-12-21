"""planit URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static

from rest_framework import routers

from climate_api.views import ClimateAPIProxyView
import planit_data.views as planit_data_views
import action_steps.views as action_steps_views
from users.views import CurrentUserView, PlanitObtainAuthToken, OrganizationViewSet, UserViewSet

router = routers.DefaultRouter()
router.register(r'community-system', planit_data_views.CommunitySystemViewSet)
router.register(r'organizations', OrganizationViewSet)
router.register(r'users', UserViewSet)
router.register(r'risks', planit_data_views.OrganizationRiskView, base_name='organizationrisk')
router.register(r'weather-event', planit_data_views.WeatherEventViewSet)

urlpatterns = [
    url(r'^api/climate-api/(?P<route>.*)$',
        ClimateAPIProxyView.as_view(), name='climate-api-proxy'),
    url(r'^api/concern/$',
        planit_data_views.ConcernViewSet.as_view({'get': 'list'}), name='concern-list'),
    url(r'^api/concern/(?P<pk>[0-9]+)/$',
        planit_data_views.ConcernViewSet.as_view({'get': 'retrieve'}), name='concern-detail'),
    url(r'^api/weather-event-rank/$',
        planit_data_views.WeatherEventRankView.as_view(), name='weather-event-rank-list'),


    url(r'^admin/', admin.site.urls),

    # user management
    url(r'^accounts/', include('users.urls')),
    url(r'^api/user/$', CurrentUserView.as_view(), name='current_user'),
    url(r'^api-token-auth/', PlanitObtainAuthToken.as_view()),

    # Health check
    url(r'^health-check/', include('watchman.urls')),

    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
