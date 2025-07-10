from django.conf import settings
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from datetime import timedelta
from django.urls import reverse
from django.urls import resolve
from django.utils.http import urlencode
from django.core.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from threading import local


VACATION_TYPE = [
    ("ساعتی", "ساعتی"),
    ("روزانه", "روزانه")
]


VACATION_STATUS = [
    ("بررسی نشده", "بررسی نشده"),
    ("تایید جانشین", "تایید جانشین"),
    ("رد جانشین", "رد جانشین"),
    ("موافقت شده", "موافقت شده"),
    ("رد شده", "رد شده")
]


class Log(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name="user_actions",
                             verbose_name="کاربر")
    action = models.TextField(max_length=250,
                            blank=True,
                            verbose_name="عمل انجام شده")
    created = models.DateTimeField(auto_now_add=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    def __str__(self):
        return str(f"لاگ شماره: {self.pk}")

    class Meta:
        verbose_name = 'لاگ'
        verbose_name_plural = 'لاگ ها'
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]


class VacationRequest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name="user_vacation_req",
                             verbose_name="نام متقاضی")
    alternative = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    on_delete=models.CASCADE,
                                    related_name="alter_vacation_req",
                                    verbose_name="جایگزین")
    start_date = models.DateTimeField(blank=False,
                                      verbose_name="تاریخ شروع")
    end_date = models.DateTimeField(blank=False,
                                    verbose_name="تاریخ پایان")
    duration = models.PositiveIntegerField(verbose_name="مدت")
    type = models.CharField(max_length=20,
                            choices=VACATION_TYPE,
                            verbose_name="نوع مرخصی")
    description = models.TextField(max_length=250,
                                   blank=True,
                                   verbose_name="توضیحات")
    status = models.CharField(max_length=20,
                              choices=VACATION_STATUS,
                              default="بررسی نشده",
                              verbose_name="وضعیت مرخصی")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'درخواست مرخصی'
        verbose_name_plural = 'درخواست های مرخصی'

    def __str__(self):
        return str(f'مرخصی {self.type} برای {self.user}')

    def get_absolute_url(self):
        return reverse('organization:smart_vacation_review', args=[self.pk])


class ProblemReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name="user_problem_reports",
                             verbose_name="اعلام کننده")
    type = models.CharField(max_length=50,
                            blank=False,
                            verbose_name="نوع خطا")
    description = models.TextField(max_length=250,
                                   blank=True,
                                   verbose_name="توضیحات")
    corrective_actions = models.TextField(max_length=250,
                                          blank=True,
                                          verbose_name="اقدامات اصلاحی")
    prevention_actions = models.TextField(max_length=250,
                                          blank=True,
                                          verbose_name="اقدامات پیشگیری")
    effective = models.BooleanField(default=True,
                                    verbose_name="مؤثر بوده/نبوده")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'ثبت خطا'
        verbose_name_plural = 'خطاهای ثبت شده'

    def __str__(self):
        return str(self.type)


class TodoList(models.Model):
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   on_delete=models.CASCADE,
                                   related_name='created_tasks',
                                   verbose_name="ایجاد کننده",
                                   null=True)
    title = models.CharField(max_length=255,
                             verbose_name="موضوع تسک")
    description = models.TextField(verbose_name="توضیحات",
                                   blank=True)
    created_at = models.DateTimeField(auto_now_add=True,
                                      verbose_name="تاریخ ایجاد")
    remind_at = models.DateTimeField(blank=False,
                                     verbose_name="موعد")
    guide_file = models.FileField(upload_to='task_guides/',
                                  null=True,
                                  blank=True,
                                  verbose_name="فایل راهنما")

    assigned_to = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                         through='TaskAssignment',
                                         related_name='assigned_tasks',
                                         verbose_name="انجام دهندگان")

    class Meta:
        verbose_name = 'تسک'
        verbose_name_plural = 'تسک ها'

    def __str__(self):
        return self.title


class TaskAssignment(models.Model):
    STATUS_CHOICES = [
        ('بررسی نشده', 'بررسی نشده'),
        ("بررسی بیشتر", "بررسی بیشتر"),
        ('رد شده', 'رد شده'),
        ('تایید شده', 'تایید شده'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             verbose_name="انجام دهنده")
    task = models.ForeignKey(TodoList,
                             on_delete=models.CASCADE)
    status = models.CharField(max_length=20,
                              choices=STATUS_CHOICES,
                              default='بررسی نشده',
                              verbose_name="وضعیت تسک")
    is_done = models.BooleanField(default=False,
                                  verbose_name="انجام شده؟")

    def __str__(self):
        return f"{self.task.title} -> {self.user.username}"


"""
Messaging between users with scheduling option

مدل جدید برای ایجاد و کنترل جداول پایگاه داده قابلیت ارسال پیام و پاسخ پیام بین کاربران
class Message: پیام اصلی که یک یا چند گیرنده و ممکمن است یک پاسخ به یک پیام دیگر باشد
class Attachment: ضمیمه پیام شامل تصویر، صوت یا ویدئو
"""
class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL,
                               on_delete=models.CASCADE,
                               related_name='sent_messages',
                               verbose_name='فرستنده')
    recipients = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                        related_name='received_messages',
                                        verbose_name='گیرندگان')
    subject = models.CharField(max_length=255,
                               blank=False,
                               verbose_name='موضوع')
    body = models.TextField(blank=True,
                            verbose_name='متن')
    reply_to = models.ForeignKey('self',
                                 null=True,
                                 blank=True,
                                 on_delete=models.SET_NULL,
                                 related_name='replies',
                                 verbose_name='پاسخ به')
    scheduled_time = models.DateTimeField(null=True,
                                          blank=True,
                                          verbose_name='زمانبندی ارسال')
    created_at = models.DateTimeField(auto_now_add=True,
                                      verbose_name='زمان ایجاد')
    sent = models.BooleanField(default=False,
                               verbose_name='وضعیت ارسال')

    class Meta:
        verbose_name = 'پیام'
        verbose_name_plural = 'پیام ها'
        permissions = [
            ("privileged_view_messages", "می تواند تمام پیام های کاربران را ببیند"),
        ]

    def __str__(self):
        return self.subject

class Attachment(models.Model):
    message = models.ForeignKey(Message,
                                on_delete=models.CASCADE,
                                related_name='attachments',
                                verbose_name='پیام مربوطه')
    file = models.FileField(upload_to='message_attachments/',
                            blank=True,
                            verbose_name='فایل')
    uploaded_at = models.DateTimeField(auto_now_add=True,
                                       verbose_name='زمان آپلود')

    class Meta:
        verbose_name = 'ضمیمه پیام'
        verbose_name_plural = 'ضمیمه های پیام'

    def file_type(self):
        name = self.file.name.lower()
        if name.endswith(('.jpg', '.jpeg', '.png', '.gif')):
            return 'image'
        elif name.endswith(('.mp3', '.wav', '.ogg')):
            return 'audio'
        elif name.endswith(('.mp4', '.mov', '.avi')):
            return 'video'
        elif name.endswith(('.pdf', '.PDF', '.docx', '.xlsx')):
            return 'document'
        return 'other'


class MessageSeen(models.Model):
    """مدل ذخیره اطلاعات خوانده شدن پیام‌ها توسط کاربران"""
    message = models.ForeignKey(Message,
                               on_delete=models.CASCADE,
                               related_name='seen_by_users',
                               verbose_name='پیام')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                            on_delete=models.CASCADE,
                            related_name='seen_messages',
                            verbose_name='کاربر')
    seen_at = models.DateTimeField(auto_now_add=True,
                                 verbose_name='زمان مشاهده')

    class Meta:
        verbose_name = 'مشاهده پیام'
        verbose_name_plural = 'مشاهده‌های پیام'
        unique_together = ('message', 'user')  # هر کاربر فقط یک بار می‌تواند پیام را مشاهده کند

    def __str__(self):
        return f"{self.user} - {self.message.subject} - {self.seen_at}"