from django.conf import settings
from django.db import models
from django.urls import reverse
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone


ORDER_TYPE = [
    ("عادی", "عادی"),
    ("فوری", "فوری")
]

REQUEST_STATUS = [
    ("بررسی نشده", "بررسی نشده"),
    ("بررسی بیشتر", "بررسی بیشتر"),
    ("موافقت شده", "موافقت شده"),
    ("رد شده", "رد شده")
]


class Note(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name="user_notes",
                             verbose_name="نویسنده")
    text = models.TextField(max_length=250,
                            blank=True,
                            verbose_name="متن یادداشت")
    created = models.DateTimeField(auto_now_add=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    def __str__(self):
        return str(self.text)

    class Meta:
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]


class ProductBuyOrder(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name="user_buy_orders",
                             verbose_name="نام متقاضی")
    name = models.CharField(max_length=150,
                            blank=False,
                            verbose_name="نام کالا",
                            error_messages={
                                'required': "این فیلد الزامی می باشد."
                            })
    brand = models.CharField(max_length=50,
                             blank=False,
                             verbose_name="برند")
    count = models.PositiveIntegerField(default=1,
                                        blank=False,
                                        verbose_name="تعداد")
    order_type = models.CharField(max_length=20,
                                  choices=ORDER_TYPE,
                                  verbose_name="نوع سفارش")
    description = models.TextField(max_length=250,
                                   blank=True,
                                   verbose_name="توضیحات")
    status = models.CharField(max_length=20,
                              choices=REQUEST_STATUS,
                              default="بررسی نشده",
                              verbose_name="وضعیت درخواست")
    completed = models.BooleanField(default=False,
                                    verbose_name="انجام شد")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'درخواست خرید کالا'
        verbose_name_plural = 'درخواست های خرید کالا'

    def __str__(self):
        return str(f'خرید کالا {self.name} برای {self.user}')

    def get_absolute_url(self):
        return reverse('shop:buy_order_review', kwargs={'pk': self.pk})


class ProductStockroomOrder(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name="user_stock_orders",
                             verbose_name="نام متقاضی")
    name = models.CharField(max_length=150,
                            blank=False,
                            verbose_name="نام کالا")
    brand = models.CharField(max_length=50,
                             blank=False,
                             verbose_name="برند")
    count = models.PositiveIntegerField(default=1,
                                        blank=False,
                                        verbose_name="تعداد")
    order_type = models.CharField(max_length=20,
                                  choices=ORDER_TYPE,
                                  verbose_name="نوع سفارش")
    description = models.TextField(max_length=250,
                                   blank=True,
                                   verbose_name="توضیحات")
    status = models.CharField(max_length=20,
                              choices=REQUEST_STATUS,
                              default="بررسی نشده",
                              verbose_name="وضعیت درخواست")
    completed = models.BooleanField(default=False,
                                    verbose_name="انجام شد")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'درخواست کالا از انبار'
        verbose_name_plural = 'درخواست های کالا از انبار'

    def __str__(self):
        return str(f'ارسال کالا {self.name} از انبار برای {self.user}')

    def get_absolute_url(self):
        return reverse('shop:stockroom_order_review', kwargs={'pk': self.pk})