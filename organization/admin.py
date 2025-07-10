from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.db import models
from jalali_date_new.fields import JalaliDateTimeField, JalaliDateField
from jalali_date_new.widgets import AdminJalaliDateTimeWidget, AdminJalaliTimeWidget,\
									AdminJalaliDateWidget
from jalali_date_new.utils import datetime2jalali
from .models import VacationRequest, ProblemReport, Log, TodoList, TaskAssignment
from django.utils.safestring import mark_safe
from django.urls import reverse
from shop.models import Note


class LogInline(GenericTabularInline):
    model = Log
    verbose_name="لاگ"
    verbose_name_plural="لاگ ها"
    readonly_fields = ['user', 'action', 'created_jalali']

    @admin.display(description='زمان دقیق اقدام', ordering='created')
    def created_jalali(self, obj):
        return datetime2jalali(obj.created).strftime('%Y-%m-%d - %H:%M')

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request, obj):
        return False


class NoteInline(GenericTabularInline):
    model = Note
    verbose_name="یادداشت"
    verbose_name_plural="یادداشت ها"

    readonly_fields = ['created_jalali']

    @admin.display(description='زمان', ordering='created')
    def created_jalali(self, obj):
        return datetime2jalali(obj.created).strftime('%Y-%m-%d - %H:%M')

    def get_extra(self, request, obj=None, **kwargs):
        extra = 1
        return extra

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(VacationRequest)
class VacationRequestAdmin(admin.ModelAdmin):
    readonly_fields = ['created_jalali']
    list_display = (
        "id", "user", "alternative", "start_jalali", "type", "duration", "status")
    list_filter = (
        "user", "alternative", "status")
    fieldsets = (
        (None, {"fields": ("user",)}),
        ("جزئیات درخواست", {"fields": (
            "alternative", "type", "duration", "description")}),
        ("تاریخ و زمان", {"fields": (
            "start_date", "end_date", "created_jalali",), }),
        ("وضعیت درخواست", {"fields": (
            "status",)}),

    )
    formfield_overrides = {
        models.DateTimeField:
            {
                'form_class': JalaliDateTimeField,
                "widget": AdminJalaliDateTimeWidget,
            },
    }
    inlines = [
        LogInline
    ]

    @admin.display(description='تاریخ ایجاد', ordering='created')
    def created_jalali(self, obj):
        return datetime2jalali(obj.created).strftime('%Y-%m-%d - %H:%M')

    @admin.display(description='تاریخ شروع')
    def start_jalali(self, obj):
        return datetime2jalali(obj.start_date).strftime('%Y-%m-%d ساعت %H:%M')

    @admin.display(description='تاریخ پایان')
    def end_jalali(self, obj):
        return datetime2jalali(obj.end_date).strftime('%Y-%m-%d ساعت %H:%M')


@admin.register(ProblemReport)
class ProblemReportAdmin(admin.ModelAdmin):
    readonly_fields = ['created_jalali']
    list_display = (
        "id", "type", "user", "description", "created_jalali", "effective")
    list_filter = (
        "user", "type", "effective")
    fieldsets = (
        ("اعلام کننده", {"fields": (
            "user",)}),
        ("جزئیات", {"fields": (
            "description", "corrective_actions", "prevention_actions",)}),
        ("وضعیت کنونی", {"fields": (
            "effective",)}),
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

    @admin.display(description='تاریخ ایجاد', ordering='created')
    def created_jalali(self, obj):
        return datetime2jalali(obj.created).strftime('%Y-%m-%d - %H:%M')


@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    readonly_fields = ['user', 'action', 'created',]
    list_display = ['user', 'log_content', 'action', 'created_jalali']
    fieldsets = (
        ("عامل", {"fields": (
            "user",)}),
        ("جزئیات", {"fields": (
            "action", "log_content")}),
        ("تاریخ و زمان", {"fields": (
            "created_jalali",), })
    )

    @admin.display(description='زمان دقیق اقدام', ordering='created')
    def created_jalali(self, obj):
        return datetime2jalali(obj.created).strftime('%Y-%m-%d - %H:%M')

    @admin.display(description='هدف', ordering='created')
    def log_content(self, obj):
        if obj.content_object:
            html = f'<a href="{reverse("admin:%s_%s_change" % (obj.content_object._meta.app_label,  obj.content_object._meta.model_name), args=[obj.object_id])}">{obj.content_object}</a>'
            return mark_safe(html)
        else:
            return "درخواست حذف شده"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return True

    def has_change_permission(self, request, obj=None):
        return False



class TaskAssignmentInline(admin.TabularInline):
    model = TaskAssignment
    extra = 0
    readonly_fields = ('status', 'is_done', 'remind_at_jalali')
    can_delete = False
    verbose_name = 'وضعیت کاربران'
    verbose_name_plural = 'وضعیت کاربران'
    fieldsets = (
        ("کاربر", {"fields": (
            "user",)}),
        ("وضعیت تسک", {"fields": (
            "status", "is_done",)}),
        ("تاریخ و زمان", {"fields": (
            "remind_at_jalali",), }),
    )

    @admin.display(description='زمان یادآوری', ordering='remind_at')
    def remind_at_jalali(self, obj):
        return datetime2jalali(obj.task.remind_at).strftime('%Y-%m-%d - %H:%M')


@admin.register(TodoList)
class TaskAdmin(admin.ModelAdmin):
    readonly_fields = ['created_jalali']
    list_display = ['id', "created_by", 'title', 'created_jalali', 'remind_at_jalali']
    list_filter = (
        "assigned_to", "created_at", "remind_at")
    fieldsets = (
        (None, {"fields": (
            "created_by",)}),
        ("جزئیات تسک", {"fields": (
            "title", "description")}),
        ("ضمیمه", {"fields": (
            "guide_file",)}),
        ("تاریخ و زمان", {"fields": (
            "created_jalali", "remind_at"), }),
    )

    formfield_overrides = {
        models.DateTimeField:
            {
                'form_class': JalaliDateTimeField,
                "widget": AdminJalaliDateTimeWidget,
            },
    }
    inlines = [TaskAssignmentInline, NoteInline]

    @admin.display(description='زمان ایجاد', ordering='created_at')
    def created_jalali(self, obj):
        return datetime2jalali(obj.created_at).strftime('%Y-%m-%d - %H:%M')

    @admin.display(description='زمان یادآوری', ordering='remind_at')
    def remind_at_jalali(self, obj):
        return datetime2jalali(obj.remind_at).strftime('%Y-%m-%d - %H:%M')