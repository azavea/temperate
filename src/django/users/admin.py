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
                                  'primary_organization',
                                  'trial_end_notified')}),
    ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser',
                                'can_create_multiple_organizations',
                                'groups', 'user_permissions')}),
    ('Important dates', {'fields': ('last_login', 'date_joined')}),
)
UserAdmin.add_fieldsets = (
    (None, {
        'classes': ('wide',),
        'fields': ('email', 'password1', 'password2', 'first_name', 'last_name',
                   'organizations', 'primary_organization', 'can_create_multiple_organizations',),
    }),
)
UserAdmin.list_display = (
    'email',
    'first_name',
    'last_name',
    'is_staff',
    'trial_end_notified',
    'can_create_multiple_organizations',
)
UserAdmin.search_fields = ('first_name', 'last_name', 'email', 'organizations__name')
UserAdmin.list_filter += ('trial_end_notified', 'can_create_multiple_organizations',)
UserAdmin.ordering = ('email',)
UserAdmin.form = PlanItUserChangeForm
UserAdmin.add_form = PlanItUserAddForm


@admin.register(PlanItOrganization)
class PlanItOrganizationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_by', 'source', 'subscription',)
    list_filter = ('source', 'subscription',)


admin.site.register(PlanItUser, UserAdmin)
admin.site.register(PlanItLocation)
