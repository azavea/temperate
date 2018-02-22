from django.conf import settings


def app_settings(request):
    return {
        'PLANIT_APP_HOME': settings.PLANIT_APP_HOME
    }
