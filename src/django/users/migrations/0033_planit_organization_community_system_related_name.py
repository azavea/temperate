# -*- coding: utf-8 -*-
# Generated by Django 1.11.10 on 2018-03-06 15:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0032_add_org_subscription_pending'),
    ]

    operations = [
        migrations.AlterField(
            model_name='planitorganization',
            name='community_systems',
            field=models.ManyToManyField(blank=True, related_name='organizations', to='planit_data.CommunitySystem'),
        ),
    ]
