# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-11-17 20:48
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_auto_20171114_1917'),
    ]

    operations = [
        migrations.AddField(
            model_name='planituser',
            name='primary_organization',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.PlanItOrganization'),
        ),
    ]
