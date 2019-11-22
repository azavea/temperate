import logging

from django.conf import settings
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from django.db import transaction
from django.db.models import Q
from django.db.utils import IntegrityError

from omgeo import Geocoder
from omgeo.places import PlaceQuery
from omgeo.postprocessors import AttrFilter
from omgeo.services import EsriWGS

from users.models import PlanItOrganization, PlanItLocation

logger = logging.getLogger('planit_data')


class Command(BaseCommand):
    """Used to re-geocode all existing organizations"""

    help = ('Used to re-geocode all existing organizations')

    def handle(self, *args, **options):
        postprocessors = [AttrFilter(['Locality'], 'locator_type')]
        postprocessors += EsriWGS.DEFAULT_POSTPROCESSORS[1:]
        geocoder = Geocoder([('omgeo.services.EsriWGS', {
            'postprocessors': postprocessors,
            'settings': {
                'client_id': settings.ESRI_CLIENT_ID,
                'client_secret': settings.ESRI_CLIENT_SECRET,
            }
        })])

        user_loc_ids = (
            PlanItOrganization.objects
            .filter(source=PlanItOrganization.Source.USER)
            .distinct('location_id')
            .values_list('location_id', flat=True)
        )
        user_locs = (
            PlanItLocation.objects
            .exclude(Q(name="") | Q(admin=""))
            .filter(id__in=user_loc_ids)
        )
        deleted_loc_ids = set()
        for loc in user_locs:
            if loc.id in deleted_loc_ids:
                continue

            pq = PlaceQuery(str(loc), for_storage=True)
            coordinates = geocoder.get_candidates(pq)[0]
            old_point = loc.point
            loc.point = Point([coordinates.x, coordinates.y])
            logger.info("Geocoding for {}, old location '{}', new '{}'".format(loc, old_point,
                                                                               loc.point))
            try:
                loc.save()
            except IntegrityError:
                with transaction.atomic():
                    # If the newly geocoded location conflicts with other locations
                    # delete them and re-assign their organizations to use this location
                    conflicting_locations = (
                        PlanItLocation.objects.filter(name=loc.name, admin=loc.admin)
                        .exclude(id=loc.id)
                    )
                    conflicting_ids = {l.id for l in conflicting_locations}
                    deleted_loc_ids |= conflicting_ids

                    (PlanItOrganization.objects
                     .filter(location_id__in=conflicting_ids)
                     .update(location_id=loc.id))
                    logger.info("Deleting {} duplicate locations for '{}'".format(
                        len(conflicting_ids), loc))
                    conflicting_locations.delete()

                    # Should be safe to save now without an IntegrityError
                    loc.save()
