# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-01-05 19:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0017_auto_20171219_1912'),
    ]

    operations = [
        migrations.CreateModel(
            name='RelatedAdaptiveValue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256, unique=True)),
            ],
        ),
    ]
