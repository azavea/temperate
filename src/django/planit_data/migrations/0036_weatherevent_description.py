# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-03-23 16:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0035_concern_static_units_blank'),
    ]

    operations = [
        migrations.AddField(
            model_name='weatherevent',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
    ]
