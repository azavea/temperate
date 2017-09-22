from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import PlanItUser

# Need to change a few things in the built-in UserAdmin because we don't have a username field
UserAdmin.fieldsets = (
    (None, {'fields': ('email', 'password')}),
    ('Personal info', {'fields': ('first_name', 'last_name')}),
    ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser',
                                'groups', 'user_permissions')}),
    ('Important dates', {'fields': ('last_login', 'date_joined')}),
)
UserAdmin.add_fieldsets = (
    (None, {
        'classes': ('wide',),
        'fields': ('email', 'password1', 'password2'),
    }),
)
UserAdmin.list_display = ('email', 'first_name', 'last_name', 'is_staff')
UserAdmin.search_fields = ('first_name', 'last_name', 'email')
UserAdmin.ordering = ('email',)

admin.site.register(PlanItUser, UserAdmin)
