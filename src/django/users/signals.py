from django.conf import settings


def user_activated_callback(user, request, **kwargs):
    """Listen to when a user has successfully activated their account.

    Signal sent by django-registration.
    """
    context = {
        'user': user,
        'url': settings.PLANIT_APP_HOME,
        'support_email': settings.SUPPORT_EMAIL
    }
    user.email_user('registration_complete_email', context)
