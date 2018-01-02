from django.contrib import admin

from .models import (
    ActionCategory,
    Collaborator
)


class ActionCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon',)
    list_editable = ('icon',)


admin.site.register(ActionCategory, ActionCategoryAdmin)
admin.site.register(Collaborator)
