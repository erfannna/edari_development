from django.contrib import admin
from django.db import models
from jalali_date_new.fields import JalaliDateTimeField, JalaliDateField
from jalali_date_new.widgets import AdminJalaliDateTimeWidget, AdminJalaliTimeWidget,\
									AdminJalaliDateWidget
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = (
        "id_number", "first_name", "last_name")
    list_filter = (
        "is_staff", "is_superuser", "is_active", "groups")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("اطلاعات شخصی", {"fields": (
            "first_name", "last_name", "id_number", "phone_number")}),
        ("مجوزها", {"fields": (
            "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("تاریخ های مهم", {"fields": (
            "last_login",)})
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "id_number", "phone_number", "password1", "password2"
            )}),
    )
    search_fields = ("last_name", "id_number")
    ordering = ("id", "id_number")
    formfield_overrides = {
        models.DateTimeField:
            {
                'form_class': JalaliDateTimeField,
                "widget": AdminJalaliDateTimeWidget,
            },
    }