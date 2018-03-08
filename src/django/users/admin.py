from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from users.forms import UserValidationMixin
from users.models import PlanItLocation, PlanItOrganization, PlanItUser


class PlanItUserChangeForm(UserValidationMixin, UserChangeForm):
    pass


class PlanItUserAddForm(UserValidationMixin, UserCreationForm):
    pass


# Need to change a few things in the built-in UserAdmin because we don't have a username field
UserAdmin.fieldsets = (
    (None, {'fields': ('email', 'password')}),
    ('Personal info', {'fields': ('first_name', 'last_name', 'organizations',
                                  'primary_organization',)}),
    ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser',
                                'groups', 'user_permissions')}),
    ('Important dates', {'fields': ('last_login', 'date_joined')}),
)
UserAdmin.add_fieldsets = (
    (None, {
        'classes': ('wide',),
        'fields': ('email', 'password1', 'password2', 'first_name', 'last_name',
                   'organizations', 'primary_organization',),
    }),
)
UserAdmin.list_display = ('email', 'first_name', 'last_name', 'is_staff')
UserAdmin.search_fields = ('first_name', 'last_name', 'email', 'organizations')
UserAdmin.ordering = ('email',)
UserAdmin.form = PlanItUserChangeForm
UserAdmin.add_form = PlanItUserAddForm

admin.site.register(PlanItUser, UserAdmin)
admin.site.register(PlanItOrganization)
admin.site.register(PlanItLocation)
