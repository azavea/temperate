# -*- coding: utf-8 -*-
# Generated by Django 1.11.22 on 2019-11-22 00:38
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0049_auto_20191122_1643'),
    ]

    operations = [
        migrations.AddField(
            model_name='impactmaplayer',
            name='legend_units',
            field=models.CharField(blank=True, max_length=256),
        ),
    ]