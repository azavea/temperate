from django.conf import settings


def get_api_url(route):
    environment = settings.ENVIRONMENT.lower()
    base_url = {
        'production': 'https://app.climate.azavea.com',
        'staging': 'https://app.staging.climate.azavea.com',
        'development': 'https://app.staging.climate.azavea.com',
    }.get(environment)

    return "{}/{}".format(base_url, route)
