from django.contrib import admin

from .models import (
    Collaborator
)

for Model in (Collaborator,):
    admin.site.register(Model)
