# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-03-09 18:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0030_update_defaultrisk_meta_ordering'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organizationaction',
            name='name',
            field=models.CharField(max_length=1024),
        ),
    ]