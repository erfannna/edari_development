/**
 * فایل نمایش درصد پیشرفت آپلود فایل در چت تلگرام
 * این نسخه از API بک‌اند برای دریافت درصد پیشرفت واقعی استفاده می‌کند
 */

document.addEventListener('DOMContentLoaded', function() {
    //('فایل telegram-upload-progress.js بارگذاری شد');
    
    // بررسی وجود تابع sendFile
    if (typeof window.sendFile === 'function') {
        //('تابع sendFile یافت شد - نیازی به جایگزینی نیست');
        return;
    }
    
    // جایگزینی تابع sendMessage اصلی با نسخه جدید که درصد پیشرفت آپلود را نمایش می‌دهد
    if (typeof window.originalSendMessage === 'undefined' && typeof window.sendMessage === 'function') {
        //('تابع sendMessage اصلی ذخیره شد و با نسخه جدید جایگزین می‌شود');
        
        // ذخیره تابع اصلی
        window.originalSendMessage = window.sendMessage;
        
        // جایگزینی با تابع جدید
        window.sendMessage = function() {
            //('تابع sendMessage جدید فراخوانی شد');
            
            // بررسی اگر پنل زمانبندی باز است و تاریخ انتخاب نشده
            const schedulePanel = document.getElementById('schedulePanel');
            
            // اگر پنل زمانبندی نمایش داده نشده، از تابع اصلی استفاده می‌کنیم
            if (!schedulePanel || schedulePanel.style.display === 'none') {
                return window.originalSendMessage.apply(this, arguments);
            }
            
            // اگر پنل زمانبندی باز است اما تاریخ انتخاب نشده
            if (schedulePanel && schedulePanel.style.display !== 'none' && !window.scheduledTime) {
                return window.originalSendMessage.apply(this, arguments);
            }
            
            // بررسی وجود فایل
            let hasFile = false;
            if (window.selectedFile || window.recordedAudio || window.fileToSend) {
                hasFile = true;
            }
            
            // اگر فایلی وجود ندارد، از تابع اصلی استفاده می‌کنیم
            if (!hasFile) {
                return window.originalSendMessage.apply(this, arguments);
            }
            
            // در اینجا کد مربوط به ارسال فایل با نمایش درصد پیشرفت را اجرا می‌کنیم
            //('ارسال فایل با نمایش درصد پیشرفت...');
            
            // یافتن محل مناسب برای نمایش پیام پیشرفت
            const chatBody = document.querySelector('.telegram-chat-body');
            if (!chatBody) {
                console.error('کانتینر چت یافت نشد! استفاده از تابع اصلی...');
                return window.originalSendMessage.apply(this, arguments);
            }
            
            // ایجاد یک پیام موقت برای نمایش پیشرفت آپلود
            const uploadMessage = createUploadProgressMessage();
            chatBody.appendChild(uploadMessage);
            
            // استفاده از مدیریت اسکرول جدید
            window.telegramScrollManager.scrollToBottom();
            
            // دریافت متن پیام
            const messageInput = document.getElementById('telegramInput');
            const message = messageInput ? messageInput.value.trim() : '';
            
            // بررسی وجود گیرنده
            let recipientId = null;
            
            // یافتن شناسه گیرنده از گفتگوی فعال
            if (window.activeConversation && window.activeConversation.userId) {
                recipientId = window.activeConversation.userId;
            } else {
                // اگر شناسه گیرنده یافت نشد، از تابع اصلی استفاده می‌کنیم
                return window.originalSendMessage.apply(this, arguments);
            }
            
            // پاک کردن فیلد ورودی
            if (messageInput) {
                messageInput.value = '';
            }
            
            // ایجاد FormData برای ارسال فایل
            const formData = new FormData();
            
            // افزودن اطلاعات پیام به FormData
            formData.append('recipients[]', recipientId);
            
            // استفاده از نام کاربر یا شناسه کاربر برای موضوع پیام
            let subjectText = "پیام جدید";
            if (window.activeConversation) {
                if (window.activeConversation.name && window.activeConversation.name.trim() !== '') {
                    subjectText = `گفتگو با ${window.activeConversation.name}`;
                } else if (window.activeConversation.userId) {
                    subjectText = `گفتگو با کاربر ${window.activeConversation.userId}`;
                }
            }
            formData.append('subject', subjectText);
            
            formData.append('body', message || '');
            
            // اگر پیام در پاسخ به پیام دیگری است
            if (window.activeConversation && window.activeConversation.messages && window.activeConversation.messages[0]) {
                formData.append('reply_to', window.activeConversation.messages[0].id);
            }
            
            // اگر تاریخ زمانبندی انتخاب شده، آن را اضافه کن
            if (window.scheduledTime) {
                formData.append('scheduled_time', window.scheduledTime);
            }
            
            // افزودن فایل به FormData
            let fileSize = 0;
            let fileName = '';
            if (window.selectedFile) {
                formData.append('file', window.selectedFile);
                fileSize = window.selectedFile.size;
                fileName = window.selectedFile.name;
            } else if (window.recordedAudio) {
                formData.append('file', window.recordedAudio);
                fileSize = window.recordedAudio.size;
                fileName = 'فایل صوتی ضبط شده';
            } else if (window.fileToSend) {
                formData.append('file', window.fileToSend);
                fileSize = window.fileToSend.size;
                fileName = window.fileToSend.name || 'فایل';
            }
            
            //(`اندازه فایل برای آپلود: ${fileSize} بایت، نام فایل: ${fileName}`);
            
            // ایجاد یک نمونه از XMLHttpRequest
            const xhr = new XMLHttpRequest();
            
            // متغیر برای نگهداری شناسه آپلود
            let uploadId = null;
            
            // تنظیم رویداد برای زمان تکمیل درخواست
            xhr.addEventListener('load', function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        //('پاسخ سرور:', response);
                        
                        // دریافت شناسه آپلود
                        if (response.upload_id) {
                            uploadId = response.upload_id;
                            //(`شناسه آپلود دریافت شد: ${uploadId}`);
                            
                            // به‌روزرسانی متن به 100%
                            const progressText = uploadMessage.querySelector('.upload-progress-percent');
                            const messageTime = uploadMessage.querySelector('.telegram-message-time');
                            
                            if (progressText) {
                                progressText.textContent = '100%';
                            }
                            
                            if (messageTime) {
                                messageTime.textContent = '100%';
                            }
                        }
                        
                        // مخفی کردن پنل‌ها - فوراً و بدون تاخیر
                        const filePreview = document.getElementById('filePreview');
                        if (filePreview) {
                            filePreview.style.display = 'none';
                            //('پیش‌نمایش فایل مخفی شد (بدون تاخیر)');
                        }
                        
                        if (schedulePanel) {
                            schedulePanel.style.display = 'none';
                            //('پنل زمان‌بندی مخفی شد (بدون تاخیر)');
                        }
                        
                        const voiceRecorder = document.getElementById('voiceRecorder');
                        if (voiceRecorder) {
                            voiceRecorder.style.display = 'none';
                            //('پنل ضبط صدا مخفی شد (بدون تاخیر)');
                        }
                        
                        // پاک کردن متغیرهای جهانی
                        window.selectedFile = null;
                        window.scheduledTime = null;
                        window.recordedAudio = null;
                        window.fileToSend = null;
                        
                        // به‌روزرسانی رابط کاربری - فوراً و بدون تاخیر
                        if (typeof window.updateUIAfterSend === 'function') {
                            // اجرای فوری تابع updateUIAfterSend
                            window.updateUIAfterSend(response);
                        } else {
                            // بارگذاری مجدد گفتگوها
                            if (typeof window.loadConversations === 'function') {
                                window.loadConversations();
                            }
                            
                            // نمایش مجدد دکمه‌های ورودی اگر تابع updateUIAfterSend وجود نداشت
                            const inputContainer = document.querySelector('.telegram-input-container');
                            if (inputContainer) {
                                inputContainer.classList.remove('file-preview-active');
                                //('کلاس file-preview-active از عنصر والد حذف شد (بدون تاخیر)');
                            }
                        }
                    } catch (e) {
                        console.error('خطا در تجزیه پاسخ JSON:', e);
                    }
                } else {
                    console.error('خطا در ارسال پیام:', xhr.status, xhr.statusText);
                    
                    // نمایش پیام خطا
                    let errorMessage = 'خطا در ارسال پیام.';
                    
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        if (errorData && errorData.error) {
                            errorMessage += ' ' + errorData.error;
                        }
                    } catch (e) {
                        if (xhr.status === 500) {
                            errorMessage += ' (خطای سرور داخلی)';
                        } else if (xhr.status === 413) {
                            errorMessage += ' (حجم فایل بیش از حد مجاز است)';
                        }
                    }
                    
                    alert(errorMessage);
                }
            });
            
            // تنظیم رویداد برای خطاهای شبکه
            xhr.addEventListener('error', function() {
                console.error('خطای شبکه در ارسال پیام');
                alert('خطای شبکه در ارسال پیام. لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.');
            });
            
            // تنظیم رویداد برای لغو درخواست
            xhr.addEventListener('abort', function() {
                //('ارسال پیام لغو شد');
            });
            
            // تابع بررسی پیشرفت آپلود از سرور
            function checkUploadProgress(id) {
                if (!id) {
                    console.error('شناسه آپلود وجود ندارد!');
                    return;
                }
                
                //(`بررسی پیشرفت آپلود با شناسه: ${id}`);
                
                // افزودن timestamp برای جلوگیری از کش شدن
                const timestamp = new Date().getTime();
                
                // اطمینان از اینکه uploadMessage هنوز در DOM وجود دارد
                if (!uploadMessage || !uploadMessage.parentNode) {
                    console.error('عنصر پیام آپلود از DOM حذف شده است!');
                    return;
                }
                
                //('آدرس درخواست API:', `/organization/upload-progress-raw?upload_id=${id}&_=${timestamp}`);
                
                fetch(`/organization/upload-progress-raw?upload_id=${id}&_=${timestamp}`, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                })
                    .then(response => {
                        //('وضعیت پاسخ پیشرفت:', response.status, response.statusText);
                        if (!response.ok) {
                            throw new Error(`خطای HTTP: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        //('اطلاعات پیشرفت آپلود خام:', data);
                        
                        // بررسی اگر داده وجود ندارد یا خطا دارد
                        if (!data) {
                            console.error('پاسخ API خالی یا نامعتبر است!');
                            return;
                        }
                        
                        // بررسی اگر پیام خطا وجود دارد
                        if (data.error) {
                            console.error(`خطا در API: ${data.error}`);
                            return;
                        }
                        
                        // بررسی اگر داده عدد خام باشد
                        let progressValue = 0;
                        if (data.progress !== undefined) {
                            progressValue = parseFloat(data.progress);
                            //(`پیشرفت آپلود خام: ${progressValue}%`);
                        } else {
                            console.error('مقدار پیشرفت در پاسخ API وجود ندارد!');
                        }
                        
                        // بررسی معتبر بودن مقدار پیشرفت
                        if (isNaN(progressValue)) {
                            console.error('مقدار پیشرفت دریافتی معتبر نیست!');
                            // استفاده از مقدار پیش‌فرض
                            progressValue = 0;
                        }
                        
                        // دیباگ - نمایش وضعیت قبل از تغییر
                        //(`وضعیت عناصر قبل از به‌روزرسانی:`);
                        
                        const progressText = uploadMessage.querySelector('.upload-progress-percent');
                        //(`متن درصد پیشرفت: ${progressText ? progressText.textContent : 'یافت نشد'}`);
                        
                        const messageTime = uploadMessage.querySelector('.telegram-message-time');
                        //(`متن زمان پیام: ${messageTime ? messageTime.textContent : 'یافت نشد'}`);
                        
                        // به‌روزرسانی درصد پیشرفت - فقط عدد
                        if (progressText) {
                            progressText.textContent = `${Math.round(progressValue)}%`;
                            //(`درصد پیشرفت به‌روز شد: ${progressText.textContent}`);
                        } else {
                            console.error('عنصر متن پیشرفت یافت نشد!');
                        }
                        
                        // به‌روزرسانی متن زمان پیام - فقط عدد
                        if (messageTime) {
                            messageTime.textContent = `${Math.round(progressValue)}%`;
                            //(`زمان پیام به‌روز شد: ${messageTime.textContent}`);
                        } else {
                            console.error('عنصر زمان پیام یافت نشد!');
                        }
                        
                        // دیباگ - اطلاعات بیشتر درباره پیام
                        //('ساختار پیام آپلود:', uploadMessage);
                        
                        // اگر آپلود تکمیل نشده، بلافاصله دوباره بررسی کن
                        if (progressValue < 100) {
                            //(`بررسی مجدد پیشرفت بلافاصله...`);
                            checkUploadProgress(id);
                        } else {
                            //('آپلود تکمیل شد');
                            
                            // به‌روزرسانی متن پیشرفت به 100%
                            if (progressText) {
                                progressText.textContent = '100%';
                                //('درصد پیشرفت به 100% تنظیم شد');
                            }
                            
                            // به‌روزرسانی متن زمان پیام به 100%
                            if (messageTime) {
                                messageTime.textContent = '100%';
                                //('زمان پیام به 100% تنظیم شد');
                            }
                        }
                    })
                    .catch(error => {
                        console.error('خطا در دریافت اطلاعات پیشرفت آپلود:', error);
                        // در صورت خطا، با کمی تأخیر دوباره تلاش می‌کنیم
                        setTimeout(() => {
                            checkUploadProgress(id);
                        }, 500);
                    });
            }
            
            // دریافت توکن CSRF
            function getCookie(name) {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
            
            // باز کردن درخواست و ارسال داده‌ها
            xhr.open('POST', '/organization/new-message', true);
            xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
            xhr.timeout = 300000; // تایم‌اوت 5 دقیقه
            
            // اضافه کردن رویداد برای دریافت پاسخ
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    //(`XHR Response Status: ${xhr.status}, StatusText: ${xhr.statusText}`);
                    if (xhr.getAllResponseHeaders) {
                        //(`XHR Response Headers: ${xhr.getAllResponseHeaders()}`);
                    }
                    
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            //('پاسخ JSON دریافتی از سرور:', response);
                            
                            if (response.upload_id) {
                                uploadId = response.upload_id;
                                //(`شناسه آپلود دریافت شد: ${uploadId}`);
                                
                                // شروع بررسی پیشرفت آپلود
                                //('شروع بررسی پیشرفت آپلود بلافاصله...');
                                checkUploadProgress(uploadId);
                            } else {
                                console.warn('شناسه آپلود در پاسخ سرور یافت نشد!', response);
                                
                                // نمایش 100% در صورت عدم وجود شناسه آپلود
                                const progressText = uploadMessage.querySelector('.upload-progress-percent');
                                const messageTime = uploadMessage.querySelector('.telegram-message-time');
                                
                                if (progressText) {
                                    progressText.textContent = '100%';
                                }
                                
                                if (messageTime) {
                                    messageTime.textContent = '100%';
                                }
                            }
                        } catch (e) {
                            console.error('خطا در تجزیه پاسخ JSON:', e);
                            //('متن خام پاسخ:', xhr.responseText);
                        }
                    } else {
                        console.error(`خطا در دریافت پاسخ: ${xhr.status} ${xhr.statusText}`);
                    }
                }
            };
            
            xhr.send(formData);
            
            // جلوگیری از اجرای تابع اصلی
            return false;
        };
    }
    
    // تابع ایجاد پیام موقت برای نمایش پیشرفت آپلود
    function createUploadProgressMessage() {
        // ایجاد یک شناسه منحصر به فرد برای پیام
        const messageId = 'upload-progress-' + Date.now();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'telegram-message telegram-message-outgoing';
        messageDiv.id = messageId;
        messageDiv.style.cssText = `
            max-width: 75%;
            margin-bottom: 10px;
            align-self: flex-start;
            animation: fadeInMessage 0.2s ease-out;
            width: fit-content;
        `;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'telegram-message-content';
        messageContent.style.cssText = `
            display: inline-block;
            padding: 10px 15px;
            border-radius: 8px;
            background-color: #0F9D58;
            border-bottom-left-radius: 4px;
            text-align: right;
            direction: rtl;
            width: 100%;
            min-width: 200px;
        `;
        
        const uploadTitle = document.createElement('div');
        uploadTitle.className = 'telegram-message-subject';
        uploadTitle.textContent = 'در حال آپلود فایل';
        uploadTitle.style.cssText = `
            font-weight: bold;
            margin-bottom: 5px;
            color: #fff;
        `;
        
        // اضافه کردن نام فایل در حال آپلود
        let fileName = '';
        if (window.selectedFile) {
            fileName = window.selectedFile.name;
        } else if (window.recordedAudio) {
            fileName = 'فایل صوتی ضبط شده';
        } else if (window.fileToSend) {
            fileName = window.fileToSend.name || 'فایل';
        }
        
        const fileNameElement = document.createElement('div');
        fileNameElement.className = 'upload-file-name';
        fileNameElement.textContent = fileName;
        fileNameElement.style.cssText = `
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        `;
        
        const progressText = document.createElement('div');
        progressText.className = 'upload-progress-percent';
        progressText.textContent = '0%';
        progressText.style.cssText = `
            font-size: 14px;
            color: white;
            margin: 5px 0;
            font-weight: bold;
        `;
        
        const messageTime = document.createElement('p');
        messageTime.className = 'telegram-message-time';
        messageTime.textContent = '0%';
        messageTime.style.cssText = `
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 2px;
            margin-bottom: 0;
            padding: 0 5px;
            display: block;
            width: 100%;
            text-align: right;
        `;
        
        messageContent.appendChild(uploadTitle);
        
        // اضافه کردن نام فایل فقط اگر وجود داشته باشد
        if (fileName) {
            messageContent.appendChild(fileNameElement);
        }
        
        messageContent.appendChild(progressText);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        return messageDiv;
    }
}); 