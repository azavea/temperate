from django.conf import settings


def app_settings(request):
    return {
        'CCAPP_HOME': settings.CCAPP_HOME
    }
