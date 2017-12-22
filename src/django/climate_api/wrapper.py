import logging
import requests

from climate_api.models import APIToken
from climate_api.utils import get_api_url, serialize_years

logger = logging.getLogger(__name__)


def make_token_api_request(route, params=None):
    url = get_api_url(route)

    token = APIToken.objects.current()
    headers = {'Authorization': 'Token {}'.format(token)}

    logger.warning("Sending API request to {}".format(url))
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()


def make_indicator_api_request(indicator, city, scenario, params=None):
    if params is None:
        params = {}

    if 'years' in params:
        params['years'] = serialize_years(params['years'])

    route = 'api/climate-data/{city}/{scenario}/indicator/{indicator}/'.format(
        city=city,
        scenario=scenario,
        indicator=indicator.name
    )
    return make_token_api_request(route, params)
