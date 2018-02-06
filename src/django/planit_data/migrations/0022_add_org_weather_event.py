# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-02-01 18:56
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_planitorganization_created_by'),
        ('planit_data', '0021_auto_20180124_1904'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrganizationWeatherEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField()),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='org_wx_events', to='users.PlanItOrganization')),
                ('weather_event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planit_data.WeatherEvent')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='organizationweatherevent',
            unique_together=set([('organization', 'weather_event'), ('organization', 'order')]),
        ),
    ]