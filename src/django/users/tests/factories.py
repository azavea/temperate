import factory

from datetime import datetime, timezone

from django.contrib.gis.geos import Point

from users.models import PlanItUser, PlanItLocation, PlanItOrganization


class LocationFactory(factory.DjangoModelFactory):
    class Meta:
        model = PlanItLocation

    @classmethod
    def _adjust_kwargs(cls, **kwargs):
        # Accept coordinates as an (x,y) list/tuple
        coords = kwargs.pop('coords', None)
        if coords:
            kwargs['point'] = Point(*coords)

        return kwargs

    name = factory.Sequence(lambda n: 'Test Location {}'.format(n))
    is_coastal = False
    georegion = factory.SubFactory('planit_data.tests.factories.GeoRegionFactory')
    point = Point(1, 1)
    datasets = ['LOCA', 'NEX-GDDP']


class OrganizationFactory(factory.DjangoModelFactory):
    class Meta:
        model = PlanItOrganization

    name = factory.Sequence(lambda n: 'Test Organization {}'.format(n))
    location = factory.SubFactory(LocationFactory)
    created_at = datetime(2018, 1, 1, tzinfo=timezone.utc)
    plan_due_date = datetime(2050, 1, 1, tzinfo=timezone.utc)
    subscription = PlanItOrganization.Subscription.FREE_TRIAL
    subscription_end_date = datetime(2018, 1, 14, tzinfo=timezone.utc)


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = PlanItUser

    first_name = 'Test'
    last_name = 'User'
    is_staff = False
    is_superuser = True
    email = factory.Sequence(lambda n: 'user{}@azavea.com'.format(n))
    password = 'password'
    primary_organization = factory.SubFactory(OrganizationFactory)

    @factory.post_generation
    def organizations(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            return

        if extracted:
            # A list of organizations were passed in, use them
            for organization in extracted:
                self.organizations.add(organization)
        else:
            self.organizations.add(self.primary_organization)
