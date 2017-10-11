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

import planit_data.views as planit_data_views
from users.views import PlanitObtainAuthToken, AppHomeView, UserViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    url(r'^api/concern/$',
        planit_data_views.ConcernViewSet.as_view({'get': 'list'}), name='concern-list'),
    url(r'^api/concern/(?P<pk>[0-9]+)$',
        planit_data_views.ConcernViewSet.as_view({'get': 'retrieve'}), name='concern-detail'),

    url(r'^$', AppHomeView.as_view(), name='app_home'),

    url(r'^admin/', admin.site.urls),

    # user management
    url(r'^accounts/', include('users.urls')),
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
