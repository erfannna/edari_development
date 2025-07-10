from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.db import models
from jalali_date_new.fields import JalaliDateTimeField, JalaliDateField
from jalali_date_new.widgets import AdminJalaliDateTimeWidget, AdminJalaliTimeWidget,\
									AdminJalaliDateWidget
from jalali_date_new.utils import datetime2jalali
from .models import ProductBuyOrder, ProductStockroomOrder, Note
from organization.admin import LogInline


class NoteInline(GenericTabularInline):
    model = Note
    verbose_name="یادداشت"
    verbose_name_plural="یادداشت ها"

    def get_extra(self, request, obj=None, **kwargs):
        extra = 1
        return extra


@admin.register(ProductBuyOrder)
class ProductBuyOrderAdmin(admin.ModelAdmin):
    readonly_fields = ['created_jalali']
    list_display = (
        "id", "name", "brand", "count", "order_type", "user", "created_jalali", "completed")
    list_filter = (
        "user", "order_type", "completed")
    fieldsets = (
        (None, {"fields": ("user",)}),
        ("اطلاعات کالا", {"fields": (
            "name", "brand", "count", "order_type", "description")}),
        ("وضعیت درخواست", {"fields": (
            "status", "completed")}),
        ("تاریخ و زمان", {"fields": (
            "created_jalali",), })
    )
    formfield_overrides = {
        models.DateTimeField:
        {
            'form_class': JalaliDateTimeField,
            "widget": AdminJalaliDateTimeWidget,
        },
    }
    inlines = [
        NoteInline,
        LogInline
    ]

    @admin.display(description='تاریخ ایجاد', ordering='created')
    def created_jalali(self, obj):
        return datetime2jalali(obj.created).strftime('%Y-%m-%d - %H:%M')


@admin.register(ProductStockroomOrder)
class ProductStockroomOrderAdmin(admin.ModelAdmin):
    readonly_fields = ['created_jalali']
    list_display = (
        "id", "name", "brand", "count", "order_type", "user", "created_jalali", "completed")
    list_filter = (
        "user", "order_type", "completed")
    fieldsets = (
        (None, {"fields": ("user",)}),
        ("اطلاعات کالا", {"fields": (
            "name", "brand", "count", "order_type", "description")}),
        ("وضعیت درخواست", {"fields": (
            "status", "completed")}),
        ("تاریخ و زمان", {"fields": (
            "created_jalali",), })
    )
    formfield_overrides = {
        models.DateTimeField:
            {
                'form_class': JalaliDateTimeField,
                "widget": AdminJalaliDateTimeWidget,
            },
    }
    inlines = [
        NoteInline,
        LogInline
    ]

    @admin.display(description='تاریخ ایجاد', ordering='created')
    def created_jalali(self, obj):
        return datetime2jalali(obj.created).strftime('%Y-%m-%d - %H:%M')