# -*- coding: utf-8 -*-
# Generated by Django 1.11.9 on 2018-01-31 20:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_planitorganization_created_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='planitlocation',
            name='admin',
            field=models.CharField(blank=True, max_length=16),
        ),
    ]
