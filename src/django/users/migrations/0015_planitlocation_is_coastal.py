# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-11-22 20:51
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_planitorganization_weather_events'),
    ]

    operations = [
        migrations.AddField(
            model_name='planitlocation',
            name='is_coastal',
            field=models.BooleanField(default=False),
        ),
    ]
