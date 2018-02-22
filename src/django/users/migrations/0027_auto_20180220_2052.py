# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-02-20 20:52
from __future__ import unicode_literals

from django.db import migrations


def forwards_func(apps, schema_editor):
    # drop defalt organization
    PlanItOrganization = apps.get_model('users', 'PlanItOrganization')
    db_alias = schema_editor.connection.alias
    PlanItOrganization.objects.using(db_alias).filter(name='User Organization').delete()


def reverse_func(apps, schema_editor):
    # add default organization and put any users without an organization in it
    PlanItOrganization = apps.get_model('users', 'PlanItOrganization')
    PlanItUser = apps.get_model('users', 'PlanItUser')
    db_alias = schema_editor.connection.alias
    default_org = PlanItOrganization.objects.using(db_alias).create(name='User Organization',
                                                                    units='IMPERIAL')
    users_without_org = PlanItUser.objects.using(db_alias).filter(organizations=None)
    for user in users_without_org:
        user.organizations.add(default_org)
        user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0026_set_org_subscription_end_date'),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]
