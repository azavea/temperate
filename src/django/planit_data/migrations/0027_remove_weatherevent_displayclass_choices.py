# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-02-12 16:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0026_add_communitysystem_displayclass'),
    ]

    operations = [
        migrations.AlterField(
            model_name='weatherevent',
            name='display_class',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
    ]
