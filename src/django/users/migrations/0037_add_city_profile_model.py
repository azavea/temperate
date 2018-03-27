# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-03-23 13:36
from __future__ import unicode_literals

import annoying.fields
import bitfield.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0036_align_org_risks_weather_events'),
    ]

    operations = [
        migrations.CreateModel(
            name='CityProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('about_economic_sector', models.CharField(blank=True, default='', max_length=64)),
                ('about_operational_budget_usd', models.IntegerField(blank=True, null=True)),
                ('about_adaptation_status', models.CharField(blank=True, default='', max_length=64)),
                ('about_commitment_status', models.CharField(blank=True, default='', max_length=64)),
                ('about_mitigation_status', models.CharField(blank=True, default='', max_length=64)),
                ('about_sustainability_description', models.TextField(blank=True, default='')),
                ('about_sustainability_progress', models.TextField(blank=True, default='')),
                ('about_master_planning', models.TextField(blank=True, default='')),
                ('assessment_status', models.CharField(blank=True, default='', max_length=32)),
                ('assessment_hazards_considered', models.CharField(blank=True, default='', max_length=32)),
                ('assessment_assets_considered', models.CharField(blank=True, default='', max_length=32)),
                ('assessment_populations_identified', models.CharField(blank=True, default='', max_length=32)),
                ('plan_status', models.CharField(blank=True, default='', max_length=32)),
                ('plan_type', models.CharField(blank=True, default='', max_length=32)),
                ('action_status', models.CharField(blank=True, default='', max_length=32)),
                ('action_prioritized_description', models.TextField(blank=True, default='')),
                ('action_prioritized', bitfield.models.BitField((('cost_benefit', 'Benefit-cost analysis'), ('cost_effectiveness', 'Cost-effectiveness'), ('multiple_criteria', 'Multiple-criteria decision analysis'), ('consensus', 'Stakeholder consensus decision-making'), ('experiment', 'Experiment and observe')), default=0)),
                ('organization', annoying.fields.AutoOneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='city_profile', to='users.PlanItOrganization')),
            ],
        ),
    ]