import requests

from climate_api.models import APIToken
from climate_api.utils import get_api_url


def make_token_api_request(route, params=None):
    url = get_api_url(route)

    token = APIToken.objects.current()
    headers = {'Authorization': 'Token {}'.format(token)}

    return requests.get(url, headers=headers, params=params)


def make_indicator_api_request(indicator, city, scenario, params=None):
    route = '/api/climate-data/{city}/{scenario}/indicator/{indicator_name}/'.format(
        city=city,
        scenario=scenario,
        indicator=indicator.name
    )
    return make_token_api_request(route, params)
