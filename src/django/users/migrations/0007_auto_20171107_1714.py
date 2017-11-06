# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-11-08 22:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_auto_20171010_1637'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlanItOrganization',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256, unique=True)),
                ('api_city_id', models.IntegerField(null=True)),
                ('units', models.CharField(choices=[('IMPERIAL', 'imperial'), ('METRIC', 'metric')], default='IMPERIAL', max_length=16)),
            ],
        ),
        migrations.RemoveField(
            model_name='planituser',
            name='organization',
        ),
        migrations.AddField(
            model_name='planituser',
            name='organizations',
            field=models.ManyToManyField(blank=True, related_name='user_organizations', to='users.PlanItOrganization'),
        ),
        migrations.RemoveField(
            model_name='planituser',
            name='api_city_id',
        ),
    ]
