# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-02-12 16:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0025_rename_org_weather_event_related_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='communitysystem',
            name='display_class',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
    ]