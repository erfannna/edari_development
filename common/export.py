from jalali_date_new.utils import datetime2jalali
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os
import io
from django.conf import settings
import arabic_reshaper
from bidi.algorithm import get_display


# PDF styling variables
TABLE_STYLE = TableStyle([
    ("FONTSIZE", (0, 0), (-1, 0), 12),
    ("LEADING", (0, 0), (-1, -1), 20),
    ("FONTNAME", (0, 0), (-1, -1), "Vazirmatn"),  # استفاده از فونت فارسی
    ("BACKGROUND", (0, 0), (-1, 0), colors.gray),  # پس‌زمینه‌ی هدر
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),  # رنگ متن هدر
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),  # راست‌چین کردن متن
    ("VALIGN", (0, 0), (-1, -1), "TOP"),  # بالاچین کردن متن
    ("BOTTOMPADDING", (0, 0), (-1, 0), 10),  # فاصله پایین هدر
    ("TOPPADDING", (0, 0), (-1, 0), 10),  # فاصله بالا هدر
    ("GRID", (0, 0), (-1, -1), 1, colors.black),  # خطوط جدول
])

FONT_PATH = os.path.join(settings.BASE_DIR, "static/fonts/Vazirmatn-Regular.ttf")
pdfmetrics.registerFont(TTFont("Vazirmatn", FONT_PATH))

BOLD_FONT_PATH = os.path.join(settings.BASE_DIR, "static/fonts/Vazirmatn-Bold.ttf")
pdfmetrics.registerFont(TTFont("VazirmatnBold", BOLD_FONT_PATH))

P_STYLE = ParagraphStyle(name='Right',
                         alignment=TA_CENTER,
                         fontName='Vazirmatn',
                         fontSize=10)
T_STYLE = ParagraphStyle(name='Right',
                         alignment=TA_CENTER,
                         fontName='VazirmatnBold',
                         fontSize=18,
                         spaceAfter=30)

def fix_persian_text(text):
    """ Persian Chars Fix for ReportLab """
    if text is None:
        return ""
    reshaped_text = arabic_reshaper.reshape(text)  # اصلاح اتصال حروف
    return get_display(reshaped_text)  # تنظیم راست به چپ


def generate_buy_order_pdf(logs):
    buffer = io.BytesIO()

    # ایجاد PDF با حاشیه‌های کمتر
    pdf = SimpleDocTemplate(buffer, pagesize=landscape(A4),
                          topMargin=10,    # کاهش حاشیه بالا
                          bottomMargin=20,  # حاشیه پایین
                          leftMargin=30,
                          rightMargin=30)

    # کاهش فاصله عنوان از جدول و کاهش فاصله بالای عنوان
    title_style = ParagraphStyle(name='Title',
                         alignment=TA_CENTER,
                         fontName='VazirmatnBold',
                         fontSize=18,
                         spaceAfter=25,   # فاصله مناسب بین عنوان و جدول
                         spaceBefore=0)   # بدون فاصله از بالا

    title = Paragraph(fix_persian_text("سوابق درخواست های خرید کالا"), title_style)
    elements = [title]

    # **۱. ساخت هدر جدول**
    data = [["انجام شد", "وضعیت", "تاریخ", "توضیحات", "نوع", "تعداد", "برند", "نام کالا", "متقاضی", "شناسه"]]
    data = [[fix_persian_text(str(x)) for x in data[0]]]

    # **۲. اضافه کردن داده‌ها از دیتابیس**
    for log in logs:
        data.append([
            fix_persian_text(str("بله")) if log.completed else fix_persian_text(str("خیر")),
            fix_persian_text(str(log.status)),
            datetime2jalali(log.created).strftime("%Y/%m/%d - %H:%M"),
            Paragraph(fix_persian_text(str(log.description)) or "-", P_STYLE),
            fix_persian_text(str(log.order_type)),
            log.count,
            Paragraph(fix_persian_text(str(log.brand)), P_STYLE),
            Paragraph(fix_persian_text(str(log.name)), P_STYLE),
            Paragraph(fix_persian_text(str(log.user)), P_STYLE),
            log.id
        ])

    # **۳. ساخت جدول**
    table = Table(data, colWidths=[50, 70, 100, 150, 50, 50, 80, 100, 80, 50], style=TABLE_STYLE, repeatRows=1)

    # **۵. اضافه کردن جدول به PDF**
    elements.append(table)
    pdf.build(elements)

    buffer.seek(0)
    return buffer


def generate_stock_order_pdf(logs):
    buffer = io.BytesIO()

    # ایجاد PDF با حاشیه‌های کمتر
    pdf = SimpleDocTemplate(buffer, pagesize=landscape(A4),
                          topMargin=10,    # کاهش حاشیه بالا
                          bottomMargin=20,  # حاشیه پایین
                          leftMargin=30,
                          rightMargin=30)

    # کاهش فاصله عنوان از جدول و کاهش فاصله بالای عنوان
    title_style = ParagraphStyle(name='Title',
                         alignment=TA_CENTER,
                         fontName='VazirmatnBold',
                         fontSize=18,
                         spaceAfter=25,   # فاصله مناسب بین عنوان و جدول
                         spaceBefore=0)   # بدون فاصله از بالا

    title = Paragraph(fix_persian_text("سوابق درخواست های کالا از انبار"), title_style)
    elements = [title]

    # **۱. ساخت هدر جدول**
    data = [["انجام شد", "وضعیت", "تاریخ", "توضیحات", "نوع", "تعداد", "برند", "نام کالا", "متقاضی", "شناسه"]]
    data = [[fix_persian_text(str(x)) for x in data[0]]]

    # **۲. اضافه کردن داده‌ها از دیتابیس**
    for log in logs:
        data.append([
            fix_persian_text(str("بله")) if log.completed else fix_persian_text(str("خیر")),
            fix_persian_text(str(log.status)),
            datetime2jalali(log.created).strftime("%Y/%m/%d - %H:%M"),
            Paragraph(fix_persian_text(str(log.description)) or "-", P_STYLE),
            fix_persian_text(str(log.order_type)),
            log.count,
            Paragraph(fix_persian_text(str(log.brand)), P_STYLE),
            Paragraph(fix_persian_text(str(log.name)), P_STYLE),
            Paragraph(fix_persian_text(str(log.user)), P_STYLE),
            log.id
        ])

    # **۳. ساخت جدول**
    table = Table(data, colWidths=[50, 70, 100, 150, 50, 50, 80, 100, 80, 50], style=TABLE_STYLE, repeatRows=1)

    # **۵. اضافه کردن جدول به PDF**
    elements.append(table)
    pdf.build(elements)

    buffer.seek(0)
    return buffer


def generate_vacation_req_pdf(logs):
    buffer = io.BytesIO()

    # ایجاد PDF با حاشیه‌های کمتر
    pdf = SimpleDocTemplate(buffer, pagesize=landscape(A4), 
                          topMargin=10,    # کاهش بیشتر حاشیه بالا از 20 به 10
                          bottomMargin=20,  # حاشیه پایین
                          leftMargin=30,   
                          rightMargin=30)

    # کاهش فاصله عنوان از جدول و کاهش فاصله بالای عنوان
    title_style = ParagraphStyle(name='Title',
                         alignment=TA_CENTER,
                         fontName='VazirmatnBold',
                         fontSize=18,
                         spaceAfter=25,   # افزایش فاصله پایین عنوان از 10 به 25
                         spaceBefore=0)   # بدون فاصله از بالا (پیش‌فرض معمولا بیشتر است)

    title = Paragraph(fix_persian_text("سوابق درخواست های مرخصی"), title_style)
    elements = [title]

    # تغییر استایل پاراگراف برای وسط‌چین کردن متن
    p_style_centered = ParagraphStyle(name='Centered',
                                alignment=TA_CENTER,
                                fontName='Vazirmatn',
                                fontSize=10)
                                
    # استایل پاراگراف برای متن‌های تاریخ با فونت کوچکتر
    p_style_date = ParagraphStyle(name='Date',
                             alignment=TA_CENTER,
                             fontName='Vazirmatn',
                             fontSize=8)  # فونت کوچکتر برای تاریخ‌ها

    # **۱. ساخت هدر جدول**
    headers = ["شناسه", "متقاضی", "جایگزین", "نوع", "شروع", "پایان", "مدت", "توضیحات", "ثبت", "وضعیت", "امضا"]
    headers.reverse()
    reshaped_headers = [fix_persian_text(h) for h in headers]
    data = [reshaped_headers]

    # **۳. تبدیل داده‌ها به لیست و اصلاح فارسی**
    for log in logs:
        # تبدیل تاریخ‌ها به پاراگراف با فونت کوچکتر
        start_date = Paragraph(datetime2jalali(log.start_date).strftime("%Y/%m/%d - %H:%M"), p_style_date)
        end_date = Paragraph(datetime2jalali(log.end_date).strftime("%Y/%m/%d - %H:%M"), p_style_date)
        created_date = Paragraph(datetime2jalali(log.created).strftime("%Y/%m/%d - %H:%M"), p_style_date)
        
        data.append([
            "",  # ستون امضا - خالی برای پر کردن دستی
            fix_persian_text(str(log.status)),
            created_date,  # استفاده از پاراگراف برای تاریخ ثبت
            Paragraph(fix_persian_text(str(log.description)) or "-", p_style_centered),
            fix_persian_text(str(log.duration)),
            end_date,  # استفاده از پاراگراف برای تاریخ پایان
            start_date,  # استفاده از پاراگراف برای تاریخ شروع
            fix_persian_text(str(log.type)),
            Paragraph(fix_persian_text(str(log.alternative)), p_style_centered),
            Paragraph(fix_persian_text(str(log.user)), p_style_centered),
            log.id
        ])

    # **۳. ساخت جدول**
    # تنظیم عرض ستون‌ها - افزایش عرض ستون امضا و کاهش متناسب ستون توضیحات
    # ترتیب ستون‌ها: [امضا، وضعیت، ثبت، توضیحات، مدت، پایان، شروع، نوع، جایگزین، متقاضی، شناسه]
    col_widths = [90, 60, 90, 105, 40, 90, 90, 40, 80, 80, 45]  # افزایش امضا از 60 به 90، کاهش توضیحات از 135 به 105
    
    # ایجاد استایل خاص برای جدول با افزایش ارتفاع ستون امضا و وسط‌چین کردن متن
    table_style = TableStyle([
        ("FONTSIZE", (0, 0), (-1, 0), 12),
        ("LEADING", (0, 0), (-1, -1), 20),
        ("FONTNAME", (0, 0), (-1, -1), "Vazirmatn"),  # استفاده از فونت فارسی
        ("BACKGROUND", (0, 0), (-1, 0), colors.gray),  # پس‌زمینه‌ی هدر
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),  # رنگ متن هدر
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),  # وسط‌چین کردن متن (افقی)
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),  # وسط‌چین کردن متن (عمودی)
        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),  # فاصله پایین هدر
        ("TOPPADDING", (0, 0), (-1, 0), 10),  # فاصله بالا هدر
        ("GRID", (0, 0), (-1, -1), 1, colors.black),  # خطوط جدول
        
        # افزایش ارتفاع ستون امضا با افزایش فاصله بالا و پایین
        ("TOPPADDING", (0, 1), (0, -1), 20),  # فاصله بالای سلول‌های ستون امضا
        ("BOTTOMPADDING", (0, 1), (0, -1), 20),  # فاصله پایین سلول‌های ستون امضا
    ])
    
    table = Table(data, colWidths=col_widths, style=table_style, repeatRows=1)

    # **۵. اضافه کردن جدول به PDF**
    elements.append(table)
    pdf.build(elements)

    buffer.seek(0)
    return buffer


def generate_problem_reps_pdf(logs):
    buffer = io.BytesIO()

    # ایجاد PDF با حاشیه‌های کمتر
    pdf = SimpleDocTemplate(buffer, pagesize=landscape(A4),
                          topMargin=10,    # کاهش حاشیه بالا
                          bottomMargin=20,  # حاشیه پایین
                          leftMargin=30,
                          rightMargin=30)

    # کاهش فاصله عنوان از جدول و کاهش فاصله بالای عنوان
    title_style = ParagraphStyle(name='Title',
                         alignment=TA_CENTER,
                         fontName='VazirmatnBold',
                         fontSize=18,
                         spaceAfter=25,   # فاصله مناسب بین عنوان و جدول
                         spaceBefore=0)   # بدون فاصله از بالا

    title = Paragraph(fix_persian_text("سوابق خطاهای ثبت شده"), title_style)
    elements = [title]

    # **۱. ساخت هدر جدول**
    data = [["موثر بوده/نبوده", "تاریخ", "توضیحات", "اقدامات پیشگیری", "اقدامات اصلاحی", "نوع خطا", "اعلام کننده", "شناسه"]]
    data = [[fix_persian_text(str(x)) for x in data[0]]]

    # **۲. اضافه کردن داده‌ها از دیتابیس**
    for log in logs:
        data.append([
            fix_persian_text(str("بله")) if log.effective else fix_persian_text(str("خیر")),
            datetime2jalali(log.created).strftime("%Y/%m/%d - %H:%M"),
            Paragraph(fix_persian_text(str(log.description)) or "-", P_STYLE),
            Paragraph(fix_persian_text(str(log.prevention_actions)) or "-", P_STYLE),
            Paragraph(fix_persian_text(str(log.corrective_actions)) or "-", P_STYLE),
            fix_persian_text(str(log.type)),
            Paragraph(fix_persian_text(str(log.user)), P_STYLE),
            log.id
        ])

    # **۳. ساخت جدول**
    # افزایش عرض ستون "موثر بوده/نبوده" از 50 به 80
    col_widths = [80, 100, 100, 100, 100, 80, 80, 40]
    table = Table(data, colWidths=col_widths, style=TABLE_STYLE, repeatRows=1)

    # **۵. اضافه کردن جدول به PDF**
    elements.append(table)
    pdf.build(elements)

    buffer.seek(0)
    return buffer