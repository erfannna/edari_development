import time
import uuid
from django.utils import timezone
import json
import sys

class UploadProgressMiddleware:
    """
    میدل‌ور برای پیگیری پیشرفت آپلود فایل‌ها با استفاده از اطلاعات واقعی
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'POST' and request.path == '/organization/new-message' and 'file' in request.FILES:
            # ایجاد یک شناسه منحصر به فرد برای این آپلود
            upload_id = str(uuid.uuid4())
            
            # دریافت اندازه کل فایل
            total_size = request.FILES['file'].size
            
            # ذخیره اطلاعات اولیه آپلود در جلسه کاربر
            request.session[f'upload_progress_{upload_id}'] = {
                'progress': 0,
                'total_size': total_size,
                'uploaded_size': 0,
                'status': 'در حال آپلود',
                'filename': request.FILES['file'].name,
                'timestamp': timezone.now().isoformat()
            }
            
            # ذخیره فوری تغییرات جلسه
            request.session.modified = True
            request.session.save()
            
            # اضافه کردن شناسه آپلود به درخواست برای استفاده در ویو
            request.upload_id = upload_id
            
            # اطلاع رسانی شروع آپلود
            print(f"شروع آپلود با شناسه: {upload_id}, فایل: {request.FILES['file'].name}, اندازه: {total_size} بایت")
            
            # جایگزینی متد خواندن فایل برای پیگیری پیشرفت آپلود
            original_read = request.FILES['file'].read
            
            def read_callback(size):
                # خواندن بلاک داده
                data = original_read(size)
                
                # دریافت مقدار خوانده شده تا این لحظه
                uploaded_size = request.FILES['file'].file.tell()
                
                # محاسبه دقیق درصد پیشرفت
                if total_size > 0:
                    progress = int((uploaded_size / total_size) * 100)
                else:
                    progress = 0
                    
                # ثبت پیشرفت در سیستم
                print(f"آپلود فایل {request.FILES['file'].name}: {progress}%, خوانده شده: {uploaded_size} از {total_size} بایت", file=sys.stderr)
                
                # به‌روزرسانی اطلاعات در جلسه
                request.session[f'upload_progress_{upload_id}'] = {
                    'progress': progress,
                    'total_size': total_size,
                    'uploaded_size': uploaded_size,
                    'status': 'تکمیل شده' if uploaded_size >= total_size else 'در حال آپلود',
                    'filename': request.FILES['file'].name,
                    'timestamp': timezone.now().isoformat()
                }
                
                # اعمال فوری تغییرات جلسه
                request.session.modified = True
                
                # بازگرداندن داده خوانده شده
                return data
                
            # جایگزینی متد خواندن فایل با تابع سفارشی
            request.FILES['file'].read = read_callback
            
        # پردازش درخواست توسط ویو
        response = self.get_response(request)
        
        # اگر پاسخ موفقیت‌آمیز بود و شناسه آپلود وجود داشت
        if hasattr(request, 'upload_id') and 200 <= response.status_code < 300:
            # اضافه کردن شناسه آپلود به پاسخ JSON
            try:
                content_type = response.get('Content-Type', '')
                if not content_type and hasattr(response, 'headers'):
                    content_type = response.headers.get('Content-Type', '')
                
                print(f"نوع محتوای پاسخ: {content_type}")
                
                if content_type and 'application/json' in content_type:
                    # پاسخ JSON
                    content = json.loads(response.content.decode('utf-8'))
                    content['upload_id'] = request.upload_id
                    response.content = json.dumps(content).encode('utf-8')
                    print(f"شناسه آپلود {request.upload_id} به پاسخ JSON اضافه شد")
                else:
                    # پاسخ غیر JSON - تبدیل به JSON
                    from django.http import JsonResponse
                    original_response = response
                    response = JsonResponse({
                        'success': True,
                        'upload_id': request.upload_id,
                        'message': 'فایل با موفقیت آپلود شد',
                        'original_status_code': original_response.status_code
                    })
                    
                # علامت‌گذاری آپلود به عنوان تکمیل شده
                progress_data = request.session.get(f'upload_progress_{request.upload_id}', {})
                progress_data.update({
                    'progress': 100,
                    'status': 'تکمیل شده',
                    'timestamp': timezone.now().isoformat()
                })
                request.session[f'upload_progress_{request.upload_id}'] = progress_data
                request.session.modified = True
                
                # ثبت پیشرفت تکمیل شده
                print(f"آپلود با شناسه {request.upload_id} تکمیل شد", file=sys.stderr)
                    
            except Exception as e:
                print(f"خطا در بروزرسانی شناسه آپلود: {str(e)}", file=sys.stderr)
                import traceback
                traceback.print_exc()
                
        return response 