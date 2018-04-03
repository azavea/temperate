# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-04-03 16:14
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0042_hourly_to_custom'),
    ]

    operations = [
        migrations.AlterField(
            model_name='planitorganization',
            name='subscription',
            field=models.CharField(choices=[('free_trial', 'Free Trial'), ('basic', 'Basic'), ('review', 'Review'), ('insights', 'Insights'), ('guidance', 'Guidance'), ('custom', 'Custom')], default='free_trial', max_length=16),
        ),
    ]