from django.urls import path
from . import views


app_name = 'organization'

urlpatterns = [
    path('vacation-request', views.vacation_request, name='vacation_request'),
    path('vacation-requests', views.vacation_requests, name='vacation_requests'),
    path('alternative-requests', views.alternative_request_logs, name='alternative_requests'),
    path('vacation-requests/<int:pk>', views.vacation_request_review, name='vacation_request_review'),
    path('alternative-requests/<int:pk>', views.alter_request_review, name='alternative_request_review'),
    # ویو جدید برای مدیریت هوشمند بررسی درخواست‌ها
    path('vacation-review/<int:pk>', views.smart_vacation_review, name='smart_vacation_review'),
    path('vacation-request-logs', views.vacation_request_logs, name='vacation_request_logs'),
    path('problem-report', views.problem_report, name='problem_report'),
    path('problem-report/<int:problem_id>', views.problem_report, name='problem_report'),
    path('problem-reports', views.problem_reports, name='problem_reports'),
    path('problem-report-logs', views.problem_report_logs, name='problem_report_logs'),
    path('export-pdf/<str:content>', views.export_to_pdf, name='export_pdf'),
    path('debug-vacation-requests', views.debug_vacation_requests, name='debug_vacation_requests'),
    path('vacation-request-logs-card', views.vacation_request_logs_card, name='vacation_logs_card'),
    # ویو های جدید برای مدیریت تسک ها و Todo List
    path('new-task', views.new_task, name='new_task'),
    path('tasks/<int:pk>', views.creator_task_review, name='creator_task_review'),
    path('open-tasks/<int:pk>', views.task_review, name='task_review'),
    path('task-logs', views.task_list_view, name='task_logs'),
    path('privileged-task-logs', views.privileged_task_list_view, name='privileged_task_logs'),
    path('open-tasks', views.open_task_list_view, name='open_tasks'),
    
    # سیستم پیام‌رسانی داخلی
    path('new-message', views.new_message, name='new_message'),
    path('sent-messages', views.sent_messages_view, name='sent_messages'),
    path('received-messages', views.received_messages_view, name='received_messages'),
    path('all-messages', views.all_messages_view, name='all_messages'),
    path('message/<int:pk>', views.message_detail, name='message_detail'),
    
    # API های پیام‌رسانی برای چت‌باکس
    path('api/received-messages', views.api_received_messages, name='api_received_messages'),
    path('api/sent-messages', views.api_sent_messages, name='api_sent_messages'),
    path('api/message/<int:pk>', views.api_message_detail, name='api_message_detail'),
    path('api/send-message', views.api_send_message, name='api_send_message'),
    path('api/mark-message-seen/<int:pk>', views.api_mark_message_seen, name='api_mark_message_seen'),
    path('api/get-users', views.api_get_users, name='api_get_users'),
] 