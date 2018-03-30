# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-03-30 18:59
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0040_auto_20180330_1525'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cityprofile',
            name='plan_type',
            field=models.CharField(blank=True, choices=[('standalone', 'Standalone adaptation plan'), ('general', 'Included in a general city plan'), ('sector', 'Included in a city sector plan'), ('combined', 'Addressed in a combined adaptation and mitigation climate action plan'), ('none', 'None of these')], default='', max_length=32),
        ),
    ]
