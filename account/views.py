from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from django.http import JsonResponse
from .forms import LoginForm
from organization.models import VacationRequest, ProblemReport, TaskAssignment
from shop.models import ProductBuyOrder, ProductStockroomOrder
from django.utils import timezone


def user_login(request):
    # اگر کاربر قبلا لاگین کرده باشد، به داشبورد هدایت می‌شود
    if request.user.is_authenticated:
        return redirect('account:dashboard')
        
    if request.method == 'POST':
        next_url = request.POST.get('next')
        form = LoginForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            user = authenticate(request,
                                id_number=cd['id_number'],
                                password=cd['password'])
            if user is not None:
                if user.is_active:
                    login(request, user)
                    # اطمینان از معتبر بودن مسیر next_url
                    if next_url and next_url.strip():
                        return redirect(next_url)
                    else:
                        return redirect('account:dashboard')
                else:
                    return render(request, "login.html",
                                  {"form": form, "status": "red", "message": "حساب شما غیرفعال است."})
            else:
                return render(request, "login.html",
                              {"form": form, "status": "red", "message": "کد ملی یا رمز عبور نامعتبر است."})
    else:
        next_url = request.GET.get('next')
        if next_url is None or not next_url.strip():
            next_url = 'account:dashboard'

        form = LoginForm(request.GET)
        return render(request, "login.html",
                      {"form": form, "next": next_url})


def user_logout(request):
    logout(request)

    return redirect('account:login')


def home(request):

    return redirect('account:dashboard')


@login_required
def dashboard(request):
    # استخراج داده‌های آماری برای quick-stats
    
    # تعداد درخواست‌های مرخصی در انتظار برای این کاربر
    vacation_requests_count = 0
    vacation_hourly_count = 0
    vacation_daily_count = 0
    vacation_pending_count = 0
    vacation_approved_count = 0
    vacation_rejected_count = 0
    
    if request.user.has_perm('organization.view_vacationrequest'):
        # کل درخواست‌های بررسی نشده
        vacation_requests = VacationRequest.objects.filter(
            Q(alternative=request.user, status="بررسی نشده") |  # درخواست‌های جانشینی
            Q(user=request.user, status="بررسی نشده")  # درخواست‌های خود کاربر
        )
        vacation_requests_count = vacation_requests.count()
        
        # تفکیک بر اساس نوع مرخصی
        vacation_hourly_count = vacation_requests.filter(type="ساعتی").count()
        vacation_daily_count = vacation_requests.filter(type="روزانه").count()
        
        # تفکیک بر اساس وضعیت
        all_user_requests = VacationRequest.objects.filter(
            Q(alternative=request.user) | Q(user=request.user)
        )
        vacation_pending_count = all_user_requests.filter(status="بررسی نشده").count()
        vacation_approved_count = all_user_requests.filter(status__in=["موافقت شده", "تایید جانشین"]).count()
        vacation_rejected_count = all_user_requests.filter(status__in=["رد شده", "رد جانشین"]).count()
    
    # تعداد درخواست‌های جانشینی بررسی نشده - محاسبه برای همه کاربران بدون نیاز به مجوز خاص
    alternative_requests_count = VacationRequest.objects.filter(
        alternative=request.user, status="بررسی نشده"
    ).count()
    
    # تعداد درخواست‌های خرید در انتظار
    buy_orders_count = 0
    buy_normal_count = 0
    buy_urgent_count = 0
    
    if request.user.has_perm('shop.view_productbuyorder'):
        # کل درخواست‌های بررسی نشده
        buy_orders = ProductBuyOrder.objects.filter(status="بررسی نشده")
        buy_orders_count = buy_orders.count()
        
        # تفکیک بر اساس نوع سفارش
        buy_normal_count = buy_orders.filter(order_type="عادی").count()
        buy_urgent_count = buy_orders.filter(order_type="فوری").count()
    
    # تعداد درخواست‌های کالا از انبار در انتظار
    stockroom_orders_count = 0
    stockroom_normal_count = 0
    stockroom_urgent_count = 0
    
    if request.user.has_perm('shop.view_productstockroomorder'):
        # کل درخواست‌های بررسی نشده
        stockroom_orders = ProductStockroomOrder.objects.filter(status="بررسی نشده")
        stockroom_orders_count = stockroom_orders.count()
        
        # تفکیک بر اساس نوع سفارش
        stockroom_normal_count = stockroom_orders.filter(order_type="عادی").count()
        stockroom_urgent_count = stockroom_orders.filter(order_type="فوری").count()
    
    # تعداد گزارش‌های مشکل
    problem_reports_count = 0
    problem_types = {}
    
    if request.user.has_perm('organization.view_problemreport'):
        problem_reports = ProblemReport.objects.filter(user=request.user)
        problem_reports_count = problem_reports.count()
        
        # گروه‌بندی گزارش‌ها بر اساس نوع
        problem_types_list = problem_reports.values_list('type', flat=True).distinct()
        for p_type in problem_types_list:
            type_count = problem_reports.filter(type=p_type).count()
            problem_types[p_type] = type_count
    
    # تعداد تسک‌های انجام نشده برای کاربر (تا امروز)
    open_tasks_count = 0
    tasks_today_count = 0
    tasks_before_today_count = 0
    
    if (request.user.has_perm("organization.add_todolist") or request.user.has_perm("organization.add_taskassignment")):
        # تسک‌های اختصاص یافته به کاربر که هنوز انجام نشده‌اند
        today = timezone.now().date()
        
        # تمام تسک‌های انجام نشده تا امروز
        open_tasks = TaskAssignment.objects.filter(
            user=request.user,
            is_done=False,
            task__remind_at__date__lte=today  # کمتر یا مساوی امروز
        )
        open_tasks_count = open_tasks.count()
        
        # تسک‌های امروز
        tasks_today_count = open_tasks.filter(
            task__remind_at__date=today
        ).count()
        
        # تسک‌های روزهای قبل
        tasks_before_today_count = open_tasks.filter(
            task__remind_at__date__lt=today  # کمتر از امروز
        ).count()
    
    # Items count received unread messages and pending messages
    user_unread_messages_count = 0
    user_pending_messages_count = 0
    
    # اگر مدل پیام فعال شده باشد، تعداد پیام‌های خوانده نشده و در انتظار را محاسبه میکنیم
    if hasattr(request.user, 'received_messages'):
        user_unread_messages_count = request.user.received_messages.filter(sent=False).count()
        user_pending_messages_count = request.user.sent_messages.filter(sent=False).count()
    
    context = {
        "title": "داشبورد",
        "vacation_requests_count": vacation_requests_count,
        "vacation_hourly_count": vacation_hourly_count,
        "vacation_daily_count": vacation_daily_count,
        "vacation_pending_count": vacation_pending_count,
        "vacation_approved_count": vacation_approved_count,
        "vacation_rejected_count": vacation_rejected_count,
        "alternative_requests_count": alternative_requests_count,
        
        "buy_orders_count": buy_orders_count,
        "buy_normal_count": buy_normal_count,
        "buy_urgent_count": buy_urgent_count,
        
        "stockroom_orders_count": stockroom_orders_count,
        "stockroom_normal_count": stockroom_normal_count,
        "stockroom_urgent_count": stockroom_urgent_count,
        
        "problem_reports_count": problem_reports_count,
        "problem_types": problem_types,
        
        "open_tasks_count": open_tasks_count,
        "tasks_today_count": tasks_today_count,
        "tasks_before_today_count": tasks_before_today_count,
        
        "user_unread_messages_count": user_unread_messages_count,
        "user_pending_messages_count": user_pending_messages_count
    }
    
    return render(request, "dashboard.html", context)


@login_required
def dashboard_stats(request):
    """ارائه آمار داشبورد به صورت JSON برای بروزرسانی با AJAX"""
    
    # تعداد درخواست‌های مرخصی در انتظار برای این کاربر
    vacation_requests_count = 0
    vacation_hourly_count = 0
    vacation_daily_count = 0
    vacation_pending_count = 0
    vacation_approved_count = 0
    vacation_rejected_count = 0
    
    if request.user.has_perm('organization.view_vacationrequest'):
        # کل درخواست‌های بررسی نشده
        vacation_requests = VacationRequest.objects.filter(
            Q(alternative=request.user, status="بررسی نشده") |  # درخواست‌های جانشینی
            Q(user=request.user, status="بررسی نشده")  # درخواست‌های خود کاربر
        )
        vacation_requests_count = vacation_requests.count()
        
        # تفکیک بر اساس نوع مرخصی
        vacation_hourly_count = vacation_requests.filter(type="ساعتی").count()
        vacation_daily_count = vacation_requests.filter(type="روزانه").count()
        
        # تفکیک بر اساس وضعیت
        all_user_requests = VacationRequest.objects.filter(
            Q(alternative=request.user) | Q(user=request.user)
        )
        vacation_pending_count = all_user_requests.filter(status="بررسی نشده").count()
        vacation_approved_count = all_user_requests.filter(status__in=["موافقت شده", "تایید جانشین"]).count()
        vacation_rejected_count = all_user_requests.filter(status__in=["رد شده", "رد جانشین"]).count()
    
    # تعداد درخواست‌های جانشینی بررسی نشده - محاسبه برای همه کاربران بدون نیاز به مجوز خاص
    alternative_requests_count = VacationRequest.objects.filter(
        alternative=request.user, status="بررسی نشده"
    ).count()
    
    # تعداد درخواست‌های خرید در انتظار
    buy_orders_count = 0
    buy_normal_count = 0
    buy_urgent_count = 0
    
    if request.user.has_perm('shop.view_productbuyorder'):
        # کل درخواست‌های بررسی نشده
        buy_orders = ProductBuyOrder.objects.filter(status="بررسی نشده")
        buy_orders_count = buy_orders.count()
        
        # تفکیک بر اساس نوع سفارش
        buy_normal_count = buy_orders.filter(order_type="عادی").count()
        buy_urgent_count = buy_orders.filter(order_type="فوری").count()
    
    # تعداد درخواست‌های کالا از انبار در انتظار
    stockroom_orders_count = 0
    stockroom_normal_count = 0
    stockroom_urgent_count = 0
    
    if request.user.has_perm('shop.view_productstockroomorder'):
        # کل درخواست‌های بررسی نشده
        stockroom_orders = ProductStockroomOrder.objects.filter(status="بررسی نشده")
        stockroom_orders_count = stockroom_orders.count()
        
        # تفکیک بر اساس نوع سفارش
        stockroom_normal_count = stockroom_orders.filter(order_type="عادی").count()
        stockroom_urgent_count = stockroom_orders.filter(order_type="فوری").count()
    
    # تعداد گزارش‌های مشکل
    problem_reports_count = 0
    problem_types = {}
    
    if request.user.has_perm('organization.view_problemreport'):
        problem_reports = ProblemReport.objects.filter(user=request.user)
        problem_reports_count = problem_reports.count()
        
        # گروه‌بندی گزارش‌ها بر اساس نوع
        problem_types_list = problem_reports.values_list('type', flat=True).distinct()
        for p_type in problem_types_list:
            type_count = problem_reports.filter(type=p_type).count()
            problem_types[p_type] = type_count
    
    # تعداد تسک‌های انجام نشده برای کاربر (تا امروز)
    open_tasks_count = 0
    tasks_today_count = 0
    tasks_before_today_count = 0
    
    if (request.user.has_perm("organization.add_todolist") or request.user.has_perm("organization.add_taskassignment")):
        # تسک‌های اختصاص یافته به کاربر که هنوز انجام نشده‌اند
        today = timezone.now().date()
        
        # تمام تسک‌های انجام نشده تا امروز
        open_tasks = TaskAssignment.objects.filter(
            user=request.user,
            is_done=False,
            task__remind_at__date__lte=today  # کمتر یا مساوی امروز
        )
        open_tasks_count = open_tasks.count()
        
        # تسک‌های امروز
        tasks_today_count = open_tasks.filter(
            task__remind_at__date=today
        ).count()
        
        # تسک‌های روزهای قبل
        tasks_before_today_count = open_tasks.filter(
            task__remind_at__date__lt=today  # کمتر از امروز
        ).count()
    
    data = {
        "vacation_requests_count": vacation_requests_count,
        "vacation_hourly_count": vacation_hourly_count,
        "vacation_daily_count": vacation_daily_count,
        "vacation_pending_count": vacation_pending_count,
        "vacation_approved_count": vacation_approved_count,
        "vacation_rejected_count": vacation_rejected_count,
        "alternative_requests_count": alternative_requests_count,
        
        "buy_orders_count": buy_orders_count,
        "buy_normal_count": buy_normal_count,
        "buy_urgent_count": buy_urgent_count,
        
        "stockroom_orders_count": stockroom_orders_count,
        "stockroom_normal_count": stockroom_normal_count,
        "stockroom_urgent_count": stockroom_urgent_count,
        
        "problem_reports_count": problem_reports_count,
        "problem_types": problem_types,
        
        "open_tasks_count": open_tasks_count,
        "tasks_today_count": tasks_today_count,
        "tasks_before_today_count": tasks_before_today_count
    }
    
    return JsonResponse(data)