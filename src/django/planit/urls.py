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
import action_steps.views as action_steps_views
import planit_data.views as planit_data_views
from users.views import (
    AddCityView,
    CityProfileOptionsView,
    CurrentUserView,
    get_user,
    PlanitObtainAuthToken,
    OrganizationViewSet,
    UserViewSet,
)

router = routers.DefaultRouter()
router.register(r'action-categories', action_steps_views.ActionCategoryViewSet)
router.register(r'action-types', action_steps_views.ActionTypeViewSet)
router.register(r'collaborators', action_steps_views.CollaboratorViewSet)
router.register(r'community-system', planit_data_views.CommunitySystemViewSet)
router.register(r'organizations', OrganizationViewSet, base_name='planitorganization')
router.register(r'related-adaptive-values', planit_data_views.RelatedAdaptiveValueViewSet)
router.register(r'users', UserViewSet, base_name='planituser')
router.register(r'risks', planit_data_views.OrganizationRiskView, base_name='organizationrisk')
router.register(r'actions', planit_data_views.OrganizationActionViewSet,
                base_name='organizationaction')
router.register(r'suggestions', planit_data_views.SuggestedActionViewSet,
                base_name='suggestedaction')
router.register(r'weather-event', planit_data_views.WeatherEventViewSet,
                base_name='weatherevent')
router.register(r'organization-weather-event', planit_data_views.OrganizationWeatherEventViewSet,
                base_name='organizationweatherevent')
router.register(r'concern', planit_data_views.ConcernViewSet, base_name='concern')
router.register(r'counties', planit_data_views.CountyViewSet, base_name='county')
router.register(r'impacts', planit_data_views.ImpactViewSet, base_name='impact')

urlpatterns = [
    url(r'^api/climate-api/(?P<route>.*)$',
        ClimateAPIProxyView.as_view(), name='climate-api-proxy'),
    url(r'^api/plan/export/', planit_data_views.PlanExportView.as_view(), name='export-plan'),
    url(r'^api/plan/submit/', planit_data_views.PlanSubmitView.as_view(), name='submit-plan'),
    url(r'^api/city-profile-options/', CityProfileOptionsView.as_view(), name='cityprofileoptions'),

    url(r'^admin/', admin.site.urls),

    # user management
    url(r'^accounts/', include('users.urls')),
    url(r'^api/add_city/', AddCityView.as_view(), name='add_city'),

    url(r'^api/user/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        get_user,
        name='user_from_uid_token'),
    url(r'^api/user/$', CurrentUserView.as_view(), name='current_user'),
    url(r'^api-token-auth/', PlanitObtainAuthToken.as_view(), name='token_auth'),

    # Health check
    url(r'^health-check/', include('watchman.urls')),

    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        url(r'^emails/', include('dbes.urls', namespace='dbes')),
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
