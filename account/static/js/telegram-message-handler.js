/**
 * فایل مدیریت نمایش پیام‌ها و فایل‌های ضمیمه در چت تلگرام
 * این فایل برای بهبود نمایش فایل‌های ضمیمه در پیام‌ها ایجاد شده است
 */

document.addEventListener('DOMContentLoaded', function() {
    //('فایل telegram-message-handler.js بارگذاری شد');
    
    /**
     * تابع اصلی برای نمایش پیام با فایل‌های ضمیمه
     * @param {Object} messageData - اطلاعات پیام شامل متن، موضوع، فایل‌های ضمیمه و...
     * @param {HTMLElement} container - کانتینر HTML برای نمایش پیام
     * @returns {HTMLElement} - المنت پیام ایجاد شده
     */
    window.renderMessageWithAttachments = function(messageData, container) {
        if (!messageData || !container) {
            console.error('پارامترهای ورودی برای تابع renderMessageWithAttachments ناقص است');
            return null;
        }
        
        //('نمایش پیام با فایل‌های ضمیمه:', messageData);
        
        // ایجاد المنت پیام
        const messageDiv = document.createElement('div');
        messageDiv.className = `telegram-message ${messageData.is_outgoing ? 'telegram-message-outgoing' : 'telegram-message-incoming'}`;
        messageDiv.id = `message-${messageData.id || Date.now()}`;
        messageDiv.dataset.messageId = messageData.id || '';
        
        // استایل‌دهی پیام بر اساس نوع (ورودی/خروجی)
        messageDiv.style.cssText = `
            max-width: 75%;
            margin-bottom: 10px;
            align-self: ${messageData.is_outgoing ? 'flex-end' : 'flex-start'};
            animation: fadeInMessage 0.2s ease-out;
            width: fit-content;
        `;
        
        // ایجاد محتوای پیام
        const messageContent = document.createElement('div');
        messageContent.className = 'telegram-message-content';
        messageContent.style.cssText = `
            display: inline-block;
            padding: 10px 15px;
            border-radius: 8px;
            background-color: ${messageData.is_outgoing ? '#0F9D58' : '#3A4053'};
            border-bottom-${messageData.is_outgoing ? 'right' : 'left'}-radius: 4px;
            text-align: right;
            direction: rtl;
            width: 100%;
        `;
        
        // افزودن موضوع پیام اگر وجود داشت
        if (messageData.subject && messageData.subject.trim() !== '') {
            const subjectElement = document.createElement('div');
            subjectElement.className = 'telegram-message-subject';
            subjectElement.textContent = messageData.subject;
            subjectElement.style.cssText = `
                font-weight: bold;
                margin-bottom: 5px;
                color: #fff;
            `;
            messageContent.appendChild(subjectElement);
        }
        
        // افزودن متن پیام اگر وجود داشت
        if (messageData.body && messageData.body.trim() !== '') {
            const bodyElement = document.createElement('div');
            bodyElement.className = 'telegram-message-body';
            bodyElement.textContent = messageData.body;
            bodyElement.style.cssText = `
                color: #fff;
                word-break: break-word;
            `;
            messageContent.appendChild(bodyElement);
        }
        
        // افزودن زمان پیام
        const messageTime = document.createElement('p');
        messageTime.className = 'telegram-message-time';
        
        // فرمت‌بندی زمان
        const messageDate = messageData.created_at ? new Date(messageData.created_at) : new Date();
        const timeStr = messageDate.getHours().toString().padStart(2, '0') + ':' + 
                        messageDate.getMinutes().toString().padStart(2, '0');
        
        messageTime.textContent = timeStr;
        messageTime.style.cssText = `
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 2px;
            margin-bottom: 0;
            padding: 0 5px;
            display: block;
            width: 100%;
            text-align: ${messageData.is_outgoing ? 'left' : 'right'};
        `;
        
        // اضافه کردن محتوا به پیام
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        // افزودن پیام به کانتینر
        container.appendChild(messageDiv);
        
        // بررسی و نمایش فایل‌های ضمیمه
        if (messageData.attachments && messageData.attachments.length > 0) {
            messageData.attachments.forEach(attachment => {
                if (typeof window.createAttachmentPreview === 'function') {
                    window.createAttachmentPreview(attachment, messageDiv);
                }
            });
        }
        
        return messageDiv;
    };
    
    /**
     * تابع به‌روزرسانی پیام‌های موجود برای نمایش فایل‌های ضمیمه
     */
    function updateExistingMessages() {
        //('به‌روزرسانی پیام‌های موجود برای نمایش فایل‌های ضمیمه');
        
        // یافتن تمام پیام‌های موجود در چت
        const messages = document.querySelectorAll('.telegram-message');
        
        messages.forEach(message => {
            // بررسی اگر پیام دارای شناسه است
            const messageId = message.dataset.messageId;
            if (!messageId) return;
            
            // یافتن اطلاعات پیام از طریق API یا داده‌های موجود
            // این بخش باید با توجه به ساختار داده‌های پروژه پیاده‌سازی شود
            
            // مثال:
            if (window.chatMessages && window.chatMessages[messageId]) {
                const messageData = window.chatMessages[messageId];
                
                // بررسی و نمایش فایل‌های ضمیمه
                if (messageData.attachments && messageData.attachments.length > 0) {
                    messageData.attachments.forEach(attachment => {
                        // بررسی اگر فایل قبلاً نمایش داده نشده است
                        const existingAttachment = message.querySelector(`.telegram-attachment-container[data-file-url="${attachment.file_url}"]`);
                        if (!existingAttachment && typeof window.createAttachmentPreview === 'function') {
                            window.createAttachmentPreview(attachment, message);
                        }
                    });
                }
            }
        });
    }
    
    /**
     * تابع دریافت اطلاعات فایل از سرور
     * @param {string} fileUrl - آدرس فایل
     * @returns {Promise} - وعده حاوی اطلاعات فایل (اندازه و نوع)
     */
    function getFileInfo(fileUrl) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', fileUrl, true);
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const size = xhr.getResponseHeader('Content-Length');
                    const type = xhr.getResponseHeader('Content-Type');
                    
                    resolve({
                        size: size ? parseInt(size) : 0,
                        type: type || ''
                    });
                } else {
                    reject(new Error(`خطا در دریافت اطلاعات فایل: ${xhr.status}`));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('خطای شبکه در دریافت اطلاعات فایل'));
            };
            
            xhr.send();
        });
    }
    
    // به‌روزرسانی پیام‌های موجود پس از بارگذاری صفحه
    setTimeout(updateExistingMessages, 500);
    
    //('مدیریت نمایش پیام‌ها و فایل‌های ضمیمه با موفقیت راه‌اندازی شد');
}); 