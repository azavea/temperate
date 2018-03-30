# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-03-30 15:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0039_auto_20180329_1648'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cityprofile',
            name='action_status',
            field=models.CharField(blank=True, choices=[('yes', 'Yes'), ('notyet', 'Not yet'), ('inprogress', 'It’s in progress'), ('donotknow', 'I don’t know')], default='', max_length=128),
        ),
        migrations.AlterField(
            model_name='cityprofile',
            name='assessment_assets_considered',
            field=models.CharField(blank=True, choices=[('none', 'None'), ('some', 'Some'), ('all', 'All'), ('allplus', 'All, including their interdependencies')], default='', max_length=32),
        ),
        migrations.AlterField(
            model_name='cityprofile',
            name='assessment_hazards_considered',
            field=models.CharField(blank=True, choices=[('none', 'None'), ('oneormore', 'At least one'), ('multiple', 'Multiple hazards and their effect on our city'), ('multipleandeffects', 'Multiple hazards, including how they might affect one another')], default='', max_length=32),
        ),
        migrations.AlterField(
            model_name='cityprofile',
            name='assessment_populations_identified',
            field=models.CharField(blank=True, choices=[('none', 'None'), ('some', 'Some'), ('all', 'All'), ('allplus', 'All, including their interdependencies')], default='', max_length=32),
        ),
        migrations.AlterField(
            model_name='cityprofile',
            name='assessment_status',
            field=models.CharField(blank=True, choices=[('yes', 'Yes'), ('no', 'Not yet'), ('donotknow', 'I Don’t know')], default='', max_length=128),
        ),
        migrations.AlterField(
            model_name='cityprofile',
            name='plan_status',
            field=models.CharField(blank=True, choices=[('yes', 'Yes'), ('notyet', 'Not yet'), ('inprogress', 'It’s in progress'), ('donotknow', 'I don’t know')], default='', max_length=128),
        ),
    ]