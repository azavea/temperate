# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-01-15 00:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_auto_20171211_1726'),
    ]

    operations = [
        migrations.AlterField(
            model_name='planitlocation',
            name='name',
            field=models.CharField(blank=True, default='', max_length=256),
            preserve_default=False,
        ),
    ]