from django import template
from jalali_date_new.utils import datetime2jalali

register = template.Library()

@register.filter
def to_jalali(value, arg):
    """Converts date to Jalali format"""

    return datetime2jalali(value).strftime(arg)