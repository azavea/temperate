# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-10-27 19:29
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0006_apitoken'),
    ]

    operations = [
        migrations.DeleteModel(
            name='APIToken',
        ),
    ]
