from django.contrib import admin

from .models import (
    APIToken
)

for Model in (APIToken,):
    admin.site.register(Model)
