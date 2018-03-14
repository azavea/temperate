from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail


from users.models import PlanItOrganization, PlanItUser
from registration.forms import RegistrationFormUniqueEmail


class UserForm(RegistrationFormUniqueEmail):
    """Extends django-registration default user sign up form with other User model fields.

    Enforces 1 account per e-mail.
    """

    email = forms.EmailField(help_text=None, widget=forms.TextInput(attrs={'placeholder': ''}))
    first_name = forms.CharField(max_length=30, widget=forms.TextInput(attrs={'placeholder': ''}))
    last_name = forms.CharField(max_length=30, widget=forms.TextInput(attrs={'placeholder': ''}))
    password1 = forms.CharField(help_text=None,
                                label='Password',
                                widget=forms.PasswordInput(attrs={'placeholder': ''}))
    password2 = forms.CharField(help_text=None,
                                label='Password confirmation',
                                widget=forms.PasswordInput(attrs={'placeholder': ''}))

    class Meta:
        model = PlanItUser
        fields = ('email', 'first_name', 'last_name',)


class UserValidationMixin(object):
    def clean(self):
        cleaned_data = super().clean()
        primary_organization = cleaned_data.get('primary_organization')
        organizations = list(cleaned_data.get('organizations', []))

        if primary_organization is not None and primary_organization not in organizations:
            raise ValidationError(
                "Invalid Primary Organization: %(org)s not in the user's organizations",
                params={'org': primary_organization}, code='invalid_primary_organization'
            )


class UserProfileForm(UserValidationMixin, forms.ModelForm):
    """Defines mutable fields in the user profile and validates user-made data changes."""

    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    organizations = forms.ModelMultipleChoiceField(queryset=PlanItOrganization.objects.all(),
                                                   required=False)
    primary_organization = forms.ModelChoiceField(queryset=PlanItOrganization.objects.all(),
                                                  required=False)

    class Meta:
        model = PlanItUser
        fields = ('first_name', 'last_name', 'organizations', 'primary_organization',)


class AddCityForm(forms.Form):
    """Form to email us a request to add a city."""

    email = forms.EmailField(help_text=None, required=False)
    city = forms.CharField(max_length=100, required=True)
    state = forms.CharField(max_length=30, required=True)
    notes = forms.CharField(max_length=280, required=False)

    def send_email(self):
        message = 'City, State: {}, {}. {}'.format(self.cleaned_data['city'],
                                                   self.cleaned_data['state'],
                                                   self.cleaned_data['notes'])
        send_mail('Add my city to Temperate please',
                  message,
                  self.cleaned_data['email'],
                  [settings.DEFAULT_TO_EMAIL],
                  fail_silently=False)


class InviteUserForm(forms.Form):
    """Form to invite a user to an organization"""

    email = forms.EmailField(help_text=None, required=False)
