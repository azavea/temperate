# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-03-12 13:54
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0032_concern_static_value_units'),
    ]

    operations = [
        migrations.AlterField(
            model_name='concern',
            name='indicator',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='planit_data.Indicator'),
        ),
    ]