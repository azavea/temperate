from django.apps import AppConfig


class PlanitDataConfig(AppConfig):
    name = 'planit_data'
    verbose_name = 'Temperate Data'

    def ready(self):
        import planit_data.signals # noqa
