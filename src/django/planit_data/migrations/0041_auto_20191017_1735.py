# -*- coding: utf-8 -*-
# Generated by Django 1.11.22 on 2019-10-17 17:35
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('planit_data', '0040_auto_20190926_2001'),
    ]

    operations = [
        migrations.CreateModel(
            name='Impact',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256, unique=True)),
                ('external_link', models.URLField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='ImpactCommunitySystemRank',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField()),
                ('community_system', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planit_data.CommunitySystem')),
                ('georegion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planit_data.ClimateAssessmentRegion')),
                ('impact', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planit_data.Impact')),
            ],
            options={
                'ordering': ['georegion', 'community_system', 'order'],
            },
        ),
        migrations.CreateModel(
            name='ImpactWeatherEventRank',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField()),
                ('georegion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planit_data.ClimateAssessmentRegion')),
                ('impact', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planit_data.Impact')),
                ('weather_event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='planit_data.WeatherEvent')),
            ],
            options={
                'ordering': ['georegion', 'weather_event', 'order'],
            },
        ),
        migrations.AddField(
            model_name='impact',
            name='community_systems',
            field=models.ManyToManyField(through='planit_data.ImpactCommunitySystemRank', to='planit_data.CommunitySystem'),
        ),
        migrations.AddField(
            model_name='impact',
            name='weather_events',
            field=models.ManyToManyField(through='planit_data.ImpactWeatherEventRank', to='planit_data.WeatherEvent'),
        ),
        migrations.AlterUniqueTogether(
            name='impactweathereventrank',
            unique_together=set([('georegion', 'weather_event', 'order')]),
        ),
        migrations.AlterUniqueTogether(
            name='impactcommunitysystemrank',
            unique_together=set([('georegion', 'community_system', 'order')]),
        ),
    ]