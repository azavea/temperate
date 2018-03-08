from django.apps import AppConfig

from registration.signals import user_activated

from .signals import user_activated_callback


class UsersConfig(AppConfig):
    name = 'users'


user_activated.connect(user_activated_callback, dispatch_uid="user_activated_uid")
