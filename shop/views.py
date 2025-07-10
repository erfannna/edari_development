from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, permission_required
from .forms import ProductBuyForm, ProductStockForm,\
    ProductBuyReviewForm, ProductStockReviewForm, NoteForm
from .models import ProductBuyOrder, ProductStockroomOrder, Note
from organization.models import Log
from .forms import SearchForm
from django.contrib.contenttypes.models import ContentType
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse


@login_required
@permission_required("shop.add_productbuyorder", raise_exception=True)
def buy_order(request):
    if request.method == 'POST':
        form = ProductBuyForm(data=request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            new = form.save(commit=False)
            new.user = request.user
            new.save()

            return redirect('shop:buy_orders')
    else:
        form = ProductBuyForm(data=request.GET)

        return render(request, "ProductOrder.html",
                      {"title": "درخواست خرید کالا",
                       "user": request.user,
                       "form": form
                       })


@login_required
@permission_required("shop.view_productbuyorder", raise_exception=True)
def buy_order_review(request, pk):
    instance = ProductBuyOrder.objects.get(id=pk)

    if request.method == 'POST':
        if request.user.has_perm('shop.change_productbuyorder'):
            form = ProductBuyReviewForm(data=request.POST, instance=instance)
            note_form = NoteForm(data=request.POST)
            if form.has_changed():
                completed_check = form.data.get('completed')
                if instance.completed != bool(completed_check):
                    message = f'وضعیت درخواست را از {"انجام نشده" if instance.completed == False else "انجام شده"} به {"انجام شده" if completed_check else "انجام نشده"} تغییر داد.'
                    Log.objects.create(user=request.user,
                                       action=message,
                                       content_object=instance)
                if instance.status != form.data['status']:
                    message2 = f'وضعیت درخواست را از {instance.status} به {form.data['status']} تغییر داد.'
                    Log.objects.create(user=request.user,
                                       action=message2,
                                       content_object=instance)
            if form.is_valid() and note_form.is_valid():
                cd = form.cleaned_data
                new = form.save(commit=False)
                new.save()
                cd_note = note_form.cleaned_data
                if cd_note["text"] != "":
                    new_note = note_form.save(commit=False)
                    new_note.user = request.user
                    new_note.content_object = instance
                    new_note.save()

                return redirect('shop:buy_order_logs')
        else:
            return PermissionDenied
    else:
        form = ProductBuyReviewForm(instance=instance)
        note_form = NoteForm(data=request.GET)
        target = ContentType.objects.get_for_model(instance)
        notes = Note.objects.filter(content_type=target, object_id=instance.id)

        return render(request, "ProductOrderDetail.html",
                      {"title": "جزئیات درخواست خرید کالا",
                       "user": request.user,
                       "form": form,
                       "note_form": note_form,
                       "instance": instance,
                       "notes": notes
                       })


@login_required
@permission_required("shop.add_productstockroomorder", raise_exception=True)
def stockroom_order(request):
    if request.method == 'POST':
        form = ProductStockForm(data=request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            new = form.save(commit=False)
            new.user = request.user
            new.save()

            return redirect('shop:stockroom_orders')
    else:
        form = ProductStockForm(data=request.GET)

        return render(request, "ProductOrder.html",
                      {"title": "درخواست کالا از انبار",
                       "user": request.user,
                       "form": form})


@login_required
@permission_required("shop.view_productstockroomorder", raise_exception=True)
def stockroom_order_review(request, pk):
    instance = ProductStockroomOrder.objects.get(id=pk)
    if request.method == 'POST':
        if request.user.has_perm('shop.change_productstockroomorder') or request.user.groups.filter(name='مسئول انبار').exists():
            form = ProductStockReviewForm(data=request.POST, instance=instance)
            note_form = NoteForm(data=request.POST)
            if form.has_changed():
                completed_check = form.data.get('completed')
                if instance.completed != bool(completed_check):
                    message = f'وضعیت درخواست را از {"انجام نشده" if instance.completed == False else "انجام شده"} به {"انجام شده" if completed_check else "انجام نشده"} تغییر داد.'
                    Log.objects.create(user=request.user,
                                       action=message,
                                       content_object=instance)
                if instance.status != form.data['status']:
                    message2 = f'وضعیت درخواست را از {instance.status} به {form.data['status']} تغییر داد.'
                    Log.objects.create(user=request.user,
                                       action=message2,
                                       content_object=instance)
            if form.is_valid() and note_form.is_valid():
                cd = form.cleaned_data
                new = form.save(commit=False)
                new.save()
                cd_note = note_form.cleaned_data
                if cd_note["text"] != "":
                    new_note = note_form.save(commit=False)
                    new_note.user = request.user
                    new_note.content_object = instance
                    new_note.save()

                return redirect('shop:stockroom_order_logs')
        else:
            return PermissionDenied
    else:
        form = ProductStockReviewForm(instance=instance)
        note_form = NoteForm(data=request.GET)
        target = ContentType.objects.get_for_model(instance)
        notes = Note.objects.filter(content_type=target, object_id=instance.id)

        can_edit = request.user.has_perm('shop.change_productstockroomorder') or request.user.groups.filter(name='مسئول انبار').exists()

        return render(request, "ProductOrderDetail.html",
                      {"title": "جزئیات درخواست کالا از انبار",
                       "user": request.user,
                       "form": form,
                       "note_form": note_form,
                       "instance": instance,
                       "notes": notes,
                       "can_edit": can_edit
                       })


@login_required
@permission_required("shop.view_productbuyorder", raise_exception=True)
def buy_order_logs(request):
    logs = ProductBuyOrder.objects.all().order_by("-created")

    paginator = Paginator(logs, 15)
    page = request.GET.get("page")
    try:
        logs = paginator.page(page)
    except PageNotAnInteger:
        logs = paginator.page(1)
    except EmptyPage:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return HttpResponse('')
        logs = paginator.page(paginator.num_pages)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'LogsActionsAJAX.html',
                      {'logs': logs})

    search_form = SearchForm(data=request.GET)
    return render(request, "LogsActions.html",
                  {"title": "سوابق درخواست خرید کالا",
                   "logs": logs,
                   "report_type": "buy_orders",
                   "search_form": search_form})


@login_required
@permission_required("shop.view_productstockroomorder", raise_exception=True)
def stockroom_order_logs(request):
    logs = ProductStockroomOrder.objects.all().order_by("-created")

    paginator = Paginator(logs, 15)
    page = request.GET.get("page")
    try:
        logs = paginator.page(page)
    except PageNotAnInteger:
        logs = paginator.page(1)
    except EmptyPage:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return HttpResponse('')
        logs = paginator.page(paginator.num_pages)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'LogsActionsAJAX.html',
                      {'logs': logs})

    search_form = SearchForm(data=request.GET)
    return render(request, "LogsActions.html",
                  {"title": "سوابق درخواست کالا از انبار",
                   "logs": logs,
                   "report_type": "stock_orders",
                   "search_form": search_form})


@login_required
@permission_required("shop.add_productbuyorder", raise_exception=True)
def buy_orders(request):
    logs = ProductBuyOrder.objects.filter(user=request.user).order_by("-created")

    paginator = Paginator(logs, 15)
    page = request.GET.get("page")
    try:
        logs = paginator.page(page)
    except PageNotAnInteger:
        logs = paginator.page(1)
    except EmptyPage:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return HttpResponse('')
        logs = paginator.page(paginator.num_pages)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'LogsAJAX.html',
                      {'logs': logs})

    return render(request, "Logs.html",
                  {"title": "وضعیت درخواست خرید کالا",
                   "logs": logs})


@login_required
@permission_required("shop.add_productstockroomorder", raise_exception=True)
def stockroom_orders(request):
    logs = ProductStockroomOrder.objects.filter(user=request.user).order_by("-created")

    paginator = Paginator(logs, 15)
    page = request.GET.get("page")
    try:
        logs = paginator.page(page)
    except PageNotAnInteger:
        logs = paginator.page(1)
    except EmptyPage:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return HttpResponse('')
        logs = paginator.page(paginator.num_pages)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'LogsAJAX.html',
                      {'logs': logs})

    return render(request, "Logs.html",
                  {"title": "وضعیت درخواست کالا از انبار",
                   "logs": logs})


@login_required
@permission_required("shop.add_productbuyorder", raise_exception=True)
def buy_orders_card(request):
    logs = ProductBuyOrder.objects.filter(user=request.user).order_by("-created")
    
    paginator = Paginator(logs, 15)
    page = request.GET.get("page")
    try:
        logs = paginator.page(page)
    except PageNotAnInteger:
        logs = paginator.page(1)
    except EmptyPage:
        return HttpResponse('')
    
    return render(request, 'ProductCardAJAX.html', {'logs': logs})


@login_required
@permission_required("shop.add_productstockroomorder", raise_exception=True)
def stockroom_orders_card(request):
    logs = ProductStockroomOrder.objects.filter(user=request.user).order_by("-created")
    
    paginator = Paginator(logs, 15)
    page = request.GET.get("page")
    try:
        logs = paginator.page(page)
    except PageNotAnInteger:
        logs = paginator.page(1)
    except EmptyPage:
        return HttpResponse('')
    
    return render(request, 'ProductCardAJAX.html', {'logs': logs})