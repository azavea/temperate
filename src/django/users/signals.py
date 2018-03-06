def user_activated_callback(user, request, **kwargs):
    """Listen to when a user has successfully activated their account.

    Signal sent by django-registration.
    """
    user.send_registration_complete_email()
