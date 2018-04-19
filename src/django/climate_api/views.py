import logging
import re

from django.conf import settings
from django.http import StreamingHttpResponse

import requests

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import APIToken
from .utils import get_api_url


logger = logging.getLogger(__name__)


class ClimateAPIProxyView(APIView):

    compiled_regexps = [re.compile(regex) for regex in settings.CCAPI_ROUTE_WHITELIST]

    STREAMING_CHUNK_SIZE = 512 * 1024

    def get(self, request, route, *args, **kwargs):
        """Proxy views to Climate API.

        - Attach authentication
        - Limit request by route

        Requests to this endpoint are limited by default to hosts in ALLOWED_HOSTS, we should
        never allow CORS on this endpoint.

        """
        # Check whitelist
        if not any(regex.match(route) for regex in self.compiled_regexps):
            return Response(None, status=status.HTTP_404_NOT_FOUND)

        # Make API request
        api_url = get_api_url(route)
        api_headers = {
            'Accept': request.META.get('HTTP_ACCEPT'),
            'Authorization': 'Token {}'.format(APIToken.objects.current()),
        }
        api_response = requests.get(api_url,
                                    headers=api_headers,
                                    params=request.query_params,
                                    stream=True,
                                    timeout=settings.CCAPI_REQUEST_TIMEOUT)

        if api_response.status_code in (401, 403):
            # Don't propagate Unauthorized errors, since they will be interpreted by the UI and
            # result in the user being inadvertently logged out.
            raise APIException("Temperate failed to authenticate with Climate API")

        return StreamingHttpResponse(
            (chunk for chunk in api_response.iter_content(self.STREAMING_CHUNK_SIZE)),
            content_type=api_response.headers['content-type'],
            status=api_response.status_code
        )
