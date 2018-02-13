from django.apps import AppConfig


class PlanitDataConfig(AppConfig):
    name = 'planit_data'

    def ready(self):
        import planit_data.signals # noqa
