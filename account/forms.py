from django import forms
from .models import User


class LoginForm(forms.Form):

    id_number = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': "text-input",
            'id': "id_number",
            'type': "number",
            'maxlength': "10",
            'placeholder': "کد ملی",
            'novalidate': 'novalidate',
            'autocomplete': 'off'
        }),
        required=False
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'id': 'password',
            'class': "text-input",
            'placeholder': "رمز عبور",
            'novalidate': 'novalidate',
            'autocomplete': 'off'
        }),
        required=False
    )