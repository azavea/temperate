# -*- coding: utf-8 -*-
# Generated by Django 1.11.11 on 2018-03-24 21:25
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0036_align_org_risks_weather_events'),
        ('planit_data', '0036_weatherevent_description'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConcernValue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.FloatField()),
                ('units', models.CharField(max_length=32, null=True)),
                ('concern', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planit_data.Concern')),
                ('location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.PlanItLocation')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='concernvalue',
            unique_together=set([('concern', 'location')]),
        ),
    ]