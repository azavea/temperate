# -*- coding: utf-8 -*-
# Generated by Django 1.11.22 on 2020-04-03 14:13
from __future__ import unicode_literals

from django.db import migrations
from django.db.models import Count
from django.db.models.functions import Lower


def check_duplicates(apps, schema):
    PlanItUser = apps.get_model('users', 'PlanItUser')
    duplicates = (
        PlanItUser.objects
        .values_list('email', flat=True)
        .annotate(email_count=Count(Lower('email')))
        .filter(email_count__gt=1)
    )
    if len(duplicates) > 0:
        print("Duplicate emails: {}".format(" ".join(set(duplicates))))
        raise Exception(
            "There are multiple users with the same email but different cases. "
            "Cannot proceed to making PlanItUser.email a citext field.")


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0063_enable_citext'),
    ]

    operations = [
        migrations.RunPython(check_duplicates, migrations.RunPython.noop)
    ]
