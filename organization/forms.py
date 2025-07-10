from django import forms
from jalali_date_new.fields import JalaliDateField, JalaliDateTimeField
from jalali_date_new.widgets import AdminJalaliDateWidget, AdminJalaliTimeWidget,\
									AdminJalaliDateTimeWidget
from .models import VacationRequest, ProblemReport, TodoList, TaskAssignment, Message, Attachment
from account.models import User


VACATION_STATUS = [
    ("تمام موارد", "تمام موارد"),
    ("بررسی نشده", "بررسی نشده"),
    ("تایید جانشین", "تایید جانشین"),
    ("رد جانشین", "رد جانشین"),
    ("موافقت شده", "موافقت شده"),
    ("رد شده", "رد شده")
]

VACATION_BOSS_STATUS = [
    ("تایید جانشین", "تایید جانشین"),
    ("موافقت شده", "موافقت شده"),
    ("رد شده", "رد شده")
]

VACATION_ALTER_STATUS = [
    ("بررسی نشده", "بررسی نشده"),
    ("تایید جانشین", "تایید جانشین"),
    ("رد جانشین", "رد جانشین")
]

PROBLEM_STATUS = [
    ("تمام موارد", "تمام موارد"),
    (True, "موثر بوده"),
    (False, "موثر نبوده")
]


class VacationRequestForm(forms.ModelForm):

    class Meta:
        model = VacationRequest
        fields = ('type', 'alternative', 'start_date', 'end_date', 'duration', 'description')
        widgets = {
            'alternative': forms.Select(attrs={
                'class': "formTextBox",
                'id': "alternative",
                'placeholder': "جایگزین",
            }),
            'duration': forms.NumberInput(attrs={
                'class': "formTextBox",
                'id': "duration",
                'placeholder': "مدت",
            }),
            'type': forms.Select(attrs={
                'class': "formTextBox",
                'id': "type",
                'placeholder': "نوع مرخصی",
            }),
            'description': forms.Textarea(attrs={
                'class': "formTextBox",
                'id': "description",
                'placeholder': "توضیحات",
            })
        }

    def __init__(self, *args, **kwargs):
        super(VacationRequestForm, self).__init__(*args, **kwargs)
        self.fields['start_date'] = JalaliDateTimeField(label="تاریخ شروع",
                                                        widget=AdminJalaliDateTimeWidget)
        self.fields['start_date'].widget.attrs.update({'class': 'formTextBox'})
        self.fields['start_date'].widget.attrs.update({'placeholder': 'تاریخ و ساعت شروع'})

        self.fields['end_date'] = JalaliDateTimeField(label="تاریخ پایان",
                                                      widget=AdminJalaliDateTimeWidget)
        self.fields['end_date'].widget.attrs.update({'class': 'formTextBox'})
        self.fields['end_date'].widget.attrs.update({'placeholder': 'تاریخ و ساعت پایان'})


class VacationRequestBossReviewForm(forms.ModelForm):

    class Meta:
        model = VacationRequest
        fields = ('status',)
        widgets = {
            'status': forms.Select(attrs={
                'class': "formTextBox",
                'id': "status",
            }),
        }

    def __init__(self, *args, **kwargs):
        super(VacationRequestBossReviewForm, self).__init__(*args, **kwargs)
        self.fields['status'].choices = VACATION_BOSS_STATUS


class VacationRequestAlterReviewForm(forms.ModelForm):

    class Meta:
        model = VacationRequest
        fields = ('status',)
        widgets = {
            'status': forms.Select(attrs={
                'class': "formTextBox",
                'id': "status",
            }),
        }

    def __init__(self, *args, **kwargs):
        super(VacationRequestAlterReviewForm, self).__init__(*args, **kwargs)
        self.fields['status'].choices = VACATION_ALTER_STATUS


class ProblemReportForm(forms.ModelForm):

    class Meta:
        model = ProblemReport
        fields = ('type', 'corrective_actions', 'prevention_actions', 'description', 'effective')
        widgets = {
            'type': forms.TextInput(attrs={
                'class': "formTextBox",
                'id': "type",
                'maxlength': "150",
                'placeholder': "نوع خطا",
                'required': "true"
            }),
            'description': forms.Textarea(attrs={
                'class': "formTextBox",
                'id': "description",
                'placeholder': "توضیحات",
                'maxlength': "250"
            }),
            'corrective_actions': forms.Textarea(attrs={
                'class': "formTextBox",
                'id': "corrective_actions",
                'placeholder': "اقدامات اصلاحی",
                'maxlength': "250"
            }),
            'prevention_actions': forms.Textarea(attrs={
                'class': "formTextBox",
                'id': "description",
                'placeholder': "اقدامات پیشگیری",
                'maxlength': "250"
            }),
            'effective': forms.CheckboxInput(attrs={
                'class': "effective-toggle",
                'id': "effective",
                'data-true-text': "مؤثر بوده",
                'data-false-text': "مؤثر نبوده"
            })
        }

    def __init__(self, *args, **kwargs):
        super(ProblemReportForm, self).__init__(*args, **kwargs)
        self.fields['effective'].label = "مؤثر بوده/نبوده"


class SearchForm(forms.Form):
    start_date = JalaliDateTimeField(
        label="تاریخ شروع",
        widget=AdminJalaliDateWidget
    )
    end_date = JalaliDateTimeField(
        label="تاریخ پایان",
        widget=AdminJalaliDateWidget
    )

    status = forms.ChoiceField(
        choices=VACATION_STATUS,
        widget=forms.Select(attrs={
            'class': "formTextBox",
            'id': "status"
        }),
        label="وضعیت"
    )

    user = forms.ModelChoiceField(
        queryset=User.objects.all(),
        widget=forms.Select(attrs={
            'class': "formTextBox",
            'id': "user"
        }),
        label="متقاضی",
        required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['start_date'].widget.attrs.update({
            'class': 'formTextBox',
            'placeholder': 'تاریخ شروع'
        })
        self.fields['end_date'].widget.attrs.update({
            'class': 'formTextBox',
            'placeholder': 'تاریخ پایان'
        })


class ProblemSearchForm(forms.Form):
    start_date = JalaliDateTimeField(
        label="تاریخ شروع",
        widget=AdminJalaliDateWidget
    )
    end_date = JalaliDateTimeField(
        label="تاریخ پایان",
        widget=AdminJalaliDateWidget
    )

    status = forms.ChoiceField(
        choices=PROBLEM_STATUS,
        widget=forms.Select(attrs={
            'class': "formTextBox",
            'id': "status"
        }),
        label="موثر بوده/نبوده"
    )

    user = forms.ModelChoiceField(
        queryset=User.objects.all(),
        widget=forms.Select(attrs={
            'class': "formTextBox",
            'id': "user"
        }),
        label="کاربر",
        required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['start_date'].widget.attrs.update({
            'class': 'formTextBox',
            'placeholder': 'تاریخ شروع'
        })
        self.fields['end_date'].widget.attrs.update({
            'class': 'formTextBox',
            'placeholder': 'تاریخ پایان'
        })


class TodoListForm(forms.ModelForm):

    class Meta:
        model = TodoList
        fields = ('title', 'description', 'remind_at', 'guide_file', 'assigned_to')
        widgets = {
            'title': forms.TextInput(attrs={
                'class': "formTextBox",
                'id': "title",
                'placeholder': "موضوع تسک",
            }),
            'description': forms.Textarea(attrs={
                'class': "formTextBox",
                'id': "description",
                'placeholder': "توضیحات",
            }),
            'guide_file': forms.FileInput(attrs={
                'class': "formTextBox",
                'id': "guide_file",
                'placeholder': "فایل راهنما",
            }),
            'assigned_to': forms.SelectMultiple(attrs={
                'class': "formTextBox",
                'id': "assigned_to",
                'placeholder': "انجام دهندگان",
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['remind_at'] = JalaliDateTimeField(label="موعد انجام",
                                                       widget=AdminJalaliDateTimeWidget)
        self.fields['remind_at'].widget.attrs.update({'class': 'formTextBox',
                                                      'placeholder': 'تاریخ و زمان یادآوری'})

class TaskReviewForm(forms.ModelForm):
    class Meta:
        model = TaskAssignment
        fields = ('status', 'is_done')
        widgets = {
            'status': forms.Select(attrs={
                'class': "formTextBox",
                'id': "status",
            }),
            'is_done': forms.CheckboxInput(attrs={
                'class': "done-toggle",
                'id': "is_done"
            })
        }


"""
Messaging forms
"""

class MessageForm(forms.ModelForm):

    class Meta:
        model = Message
        fields = ('recipients', 'subject', 'body', 'scheduled_time')
        widgets = {
            'subject': forms.TextInput(attrs={
                'class': "formTextBox",
                'id': "subject",
                'placeholder': "موضوع",
            }),
            'body': forms.Textarea(attrs={
                'class': "formTextBox",
                'id': "body",
                'placeholder': "متن پیام",
            }),
            'recipients': forms.SelectMultiple(attrs={
                'class': "formTextBox",
                'id': "recipients",
                'placeholder': "گیرندگان",
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['scheduled_time'] = JalaliDateTimeField(label="زمانبندی ارسال",
                                                            widget=AdminJalaliDateTimeWidget)
        self.fields['scheduled_time'].widget.attrs.update({'class': 'formTextBox',
                                                           'placeholder': 'تاریخ و زمان ارسال'})

class AttachmentForm(forms.ModelForm):

    class Meta:
        model = Attachment
        fields = ('file',)
        widgets = {
            'file': forms.FileInput(attrs={
                'class': "formTextBox",
                'id': "file",
            }),
        }