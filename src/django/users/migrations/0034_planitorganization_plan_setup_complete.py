# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-03-06 15:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0033_planit_organization_community_system_related_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='planitorganization',
            name='plan_setup_complete',
            field=models.BooleanField(default=False),
        ),
    ]