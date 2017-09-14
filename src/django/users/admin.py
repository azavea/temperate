from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import PlanItUser

admin.site.register(PlanItUser, UserAdmin)
