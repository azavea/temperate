# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-05-04 18:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0046_planituser_trial_end_notified'),
    ]

    operations = [
        migrations.AlterField(
            model_name='planituser',
            name='trial_end_notified',
            field=models.NullBooleanField(default=False),
        ),
    ]