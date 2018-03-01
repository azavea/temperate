from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core import signing

from django.contrib.auth.password_validation import validate_password

from time import time

from users.models import PlanItOrganization, PlanItUser
from registration.forms import RegistrationFormUniqueEmail


class PasswordResetInitForm(forms.Form):
    """
    Form to initiate a password reset

    On validation, sends an email to the user with a password reset link.
    """
    # TODO (issue #668): rate limit this endpoint to prevent abuse
    email = forms.EmailField(help_text=None, widget=forms.TextInput(attrs={'placeholder': ''}))

    def generate_token(self, uid):
        return(signing.dumps({'action': 'resetpass',
                              'uid': uid,
                              'expire': time() + settings.PASSWORD_RESET_EXPIRE}))

    def send_email(self):
        try:
            user = PlanItUser.objects.get(email=self.cleaned_data['email'])
            uid = user.id
            token = self.generate_token(uid)
            url = settings.PASSWORD_RESET_URL.format(token=token)
            context = {'user': user, 'url': url}
            user.email_user('password_reset_email', context)
        except PlanItUser.DoesNotExist:
            # We don't don't complain if the user isn't found because that would allow
            # someone to enumerate users from the public internet.
            pass


class PasswordResetForm(forms.Form):
    """
    Form to complete a password reset
    """
    password1 = forms.CharField(help_text=None,
                                label='Password',
                                widget=forms.PasswordInput(attrs={'placeholder': ''}),
                                validators=[validate_password])
    password2 = forms.CharField(help_text=None,
                                label='Password confirmation',
                                widget=forms.PasswordInput(attrs={'placeholder': ''}))
    token = forms.CharField(help_text=None,
                            label='Reset token',
                            widget=forms.HiddenInput(attrs={'placeholder': ''}))

    def is_valid(self):
        valid = super(PasswordResetForm, self).is_valid()
        if not valid:
            return False
        if self.cleaned_data['user'] is None:
            self.errors['non_field_errors'] = ['Invalid password reset link.']
            return False
        if self.cleaned_data['token_data']['expire'] < time():
            self.errors['non_field_errors'] = ['Password reset link has expired.']
            return False
        if self.cleaned_data['password1'] != self.cleaned_data['password2']:
            self.errors['non_field_errors'] = ['Passwords must match.']
            return False
        return True

    def clean(self):
        super(PasswordResetForm, self).clean()
        try:
            self.cleaned_data['token_data'] = signing.loads(self.cleaned_data['token'])
            self.cleaned_data['user'] = PlanItUser.objects.get(
                id=self.cleaned_data['token_data']['uid'])
        except signing.BadSignature:
            self.cleaned_data['user'] = None


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
    """Form to email a request to add a city."""

    email = forms.EmailField(help_text=None, widget=forms.TextInput(attrs={'placeholder': ''}))
    first_name = forms.CharField(max_length=30, required=False,
                                 widget=forms.TextInput(attrs={'placeholder': ''}))
    last_name = forms.CharField(max_length=30, required=False,
                                widget=forms.TextInput(attrs={'placeholder': ''}))
    city = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'placeholder': ''}))
    state = forms.CharField(max_length=30, widget=forms.TextInput(attrs={'placeholder': ''}))
    subject = forms.CharField(max_length=80, required=False,
                              widget=forms.TextInput(attrs={'placeholder': ''}))
    description = forms.CharField(max_length=280, required=False,
                                  widget=forms.TextInput(attrs={'placeholder': ''}))

    def is_valid(self):
        valid = super(AddCityForm, self).is_valid()
        if not valid:
            return False
        if self.cleaned_data['city'] is None:
            self.errors['non_field_errors'] = ['No city specified.']
            return False
        if self.cleaned_data['state'] is None:
            self.errors['non_field_errors'] = ['No state specified.']
            return False
        if self.cleaned_data['email'] is None:
            self.errors['non_field_errors'] = ['User not provided.']
            return False
        return True

    def send_email(self):
        message = 'City, State: {}, {}. {}'.format(self.cleaned_data['city'],
                                                   self.cleaned_data['state'],
                                                   self.cleaned_data['description'])
        send_mail(self.cleaned_data['subject'],
                  message,
                  self.cleaned_data['email'],
                  [settings.DEFAULT_TO_EMAIL],
                  fail_silently=False)
