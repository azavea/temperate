# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2021-03-26 19:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0051_impactmaplayer_layer_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='organizationrisk',
            name='is_modified',
            field=models.BooleanField(default=False),
        ),
    ]