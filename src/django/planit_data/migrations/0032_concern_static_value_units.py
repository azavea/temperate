# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-03-12 13:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0031_auto_20180309_1801'),
    ]

    operations = [
        migrations.AddField(
            model_name='concern',
            name='static_units',
            field=models.CharField(default='', max_length=16),
        ),
        migrations.AddField(
            model_name='concern',
            name='static_value',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
