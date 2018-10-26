import requests

from django.conf import settings

from climate_api.models import APIToken
from climate_api.utils import get_api_url, serialize_years


def make_token_api_request(route, params=None):
    url = get_api_url(route)

    token = APIToken.objects.current()
    headers = {'Authorization': 'Token {}'.format(token)}

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=settings.CCAPI_REQUEST_TIMEOUT)
    response.raise_for_status()
    return response.json()


def make_indicator_point_api_request(indicator, point, scenario, params=None):
    if params is None:
        params = {}

    if 'years' in params:
        params['years'] = serialize_years(params['years'])

    point = point.transform(4326, clone=True)
    route = 'api/climate-data/{lat}/{lon}/{scenario}/indicator/{indicator}/'.format(
        lat=point.coords[1],
        lon=point.coords[0],
        scenario=scenario,
        indicator=indicator.name
    )
    return make_token_api_request(route, params)
