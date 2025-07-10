/**
 * فایل telegram-reply-viewer.js
 * برای نمایش پیام‌های ریپلای شده از روی reply_to_id بالای پیام اصلی
 * این فایل از اطلاعات موجود استفاده می‌کند و درخواست اضافه‌ای به سرور ارسال نمی‌کند
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('فایل telegram-reply-viewer.js بارگذاری شد');
    
    // متغیر سراسری برای ذخیره تمام پیام‌ها
    window.messagesCache = {};
    
    // اضافه کردن استایل‌های مورد نیاز برای نمایش پیام‌های ریپلای شده
    addReplyViewerStyles();
    
    // هوک کردن تابع renderMessages برای پردازش پیام‌های ریپلای شده
    setupRenderMessagesHook();
    
    /**
     * اضافه کردن استایل‌های مورد نیاز برای نمایش پیام‌های ریپلای شده
     */
    function addReplyViewerStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* استایل برای نمایش پیام‌های ریپلای شده */
            .telegram-replied-to-message {
                padding: 8px 12px;
                background-color: rgba(0, 0, 0, 0.2);
                border-right: 2px solid #0F9D58;
                margin-bottom: 5px;
                border-radius: 8px;
                font-size: 12px;
                color: #fff;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                text-overflow: ellipsis;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                transition: all 0.2s ease;
            }
            
            .telegram-message.telegram-message-outgoing .telegram-replied-to-message {
                border-right: none;
                border-left: 2px solidrgb(0, 230, 119);
                background-color: rgb(13 80 78 / 80%);
                border-right: 2px solid rgba(240, 240, 240, 0.78);
            }
            
            /* استایل ویژه برای ریپلای در فایل‌های پیوست */
            .telegram-attachment-item-standalone .telegram-replied-to-message {
                border-radius: 8px 8px 0 0;
                margin: 0;
                width: 100%;
                box-sizing: border-box;
                background-color: rgba(0, 0, 0, 0.3);
                padding: 10px 12px;
                min-height: 40px;
                position: relative;
                z-index: 2;
            }
            
            /* استایل برای قرار دادن ریپلای پیام‌های صوتی و ویدیویی */
            .telegram-audio-custom-wrapper {
                position: relative;
                width: 100%;
            }
            
            .telegram-attachment-item-standalone .telegram-replied-to-message + .telegram-audio-custom,
            .telegram-attachment-item-standalone .telegram-replied-to-message + .telegram-video-container,
            .telegram-attachment-item-standalone .telegram-replied-to-message + img,
            .telegram-attachment-item-standalone .telegram-replied-to-message + .telegram-file-box {
                border-top-left-radius: 0 !important;
                border-top-right-radius: 0 !important;
                margin-top: 0 !important;
            }
            
            /* تنظیم استایل برای کادر اصلی پیام‌های دارای فایل پیوست */
            .telegram-message .telegram-attachment-item-standalone {
                overflow: visible !important;
                padding-top: 0 !important;
                margin-top: 5px !important;
            }
            
            .telegram-message.telegram-message-outgoing .telegram-attachment-item-standalone .telegram-replied-to-message {
                background-color: rgba(13, 80, 78, 0.9);
            }
            
            .telegram-message.telegram-message-outgoing .telegram-replied-to-message:hover {
                box-shadow: 0 2px 5px rgb(0 0 0 / 40%);
            }
            
            .telegram-message.telegram-message-outgoing .telegram-replied-to-message i,
            .telegram-message.telegram-message-outgoing .telegram-replied-sender {
                color: #00E676;
            }
            
            .telegram-message.telegram-message-outgoing .telegram-reply-connection {
                right: auto;
                left: 10px;
                background-color: #00E676;
                opacity: 0.8;
            }
            
            /* استایل برای ایجاد فاصله بین پیام ریپلای شده و متن اصلی */
            .telegram-message-body-with-reply {
                margin-top: 6px;
            }
            
            /* نمایش نوع پیام (تصویر، فایل، صوت) */
            .telegram-replied-message-type {
                display: flex;
                align-items: center;
                gap: 3px;
            }
            
            .telegram-replied-message-type i,
            .telegram-replied-message-type span {
                color: #9AA0B5;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    /**
     * هوک کردن تابع renderMessages برای پردازش پیام‌های ریپلای شده
     */
    function setupRenderMessagesHook() {
        // بررسی اینکه آیا تابع renderMessages وجود دارد
        if (typeof window.renderMessages === 'function') {
            console.log('تابع renderMessages یافت شد، هوک در حال انجام');
            
            // ذخیره تابع اصلی
            const originalRenderMessages = window.renderMessages;
            
            // جایگزینی تابع با نسخه جدید
            window.renderMessages = function(messages) {
                // ذخیره پیام‌ها در cache برای استفاده بعدی
                if (Array.isArray(messages)) {
                    messages.forEach(msg => {
                        if (msg.id) {
                            window.messagesCache[msg.id] = msg;
                        }
                    });
                }
                
                // فراخوانی تابع اصلی
                originalRenderMessages.apply(this, arguments);
                
                // پردازش و نمایش پیام‌های ریپلای شده بعد از رندر پیام‌ها
                setTimeout(function() {
                    processRepliedToMessages();
                }, 200);
            };
            
            console.log('تابع renderMessages با موفقیت هوک شد');
        } else {
            console.warn('تابع renderMessages یافت نشد، تلاش دوباره بعد از 1 ثانیه');
            
            // تلاش مجدد بعد از 1 ثانیه
            setTimeout(function() {
                if (typeof window.renderMessages === 'function') {
                    const originalRenderMessages = window.renderMessages;
                    window.renderMessages = function(messages) {
                        // ذخیره پیام‌ها در cache برای استفاده بعدی
                        if (Array.isArray(messages)) {
                            messages.forEach(msg => {
                                if (msg.id) {
                                    window.messagesCache[msg.id] = msg;
                                }
                            });
                        }
                        
                        // فراخوانی تابع اصلی
                        originalRenderMessages.apply(this, arguments);
                        
                        // پردازش و نمایش پیام‌های ریپلای شده بعد از رندر پیام‌ها
                        setTimeout(function() {
                            processRepliedToMessages();
                        }, 200);
                    };
                    
                    console.log('تابع renderMessages با موفقیت هوک شد (تلاش دوم)');
                } else {
                    // تنظیم یک MutationObserver به عنوان راه حل نهایی
                    setupMutationObserver();
                }
            }, 1000);
        }
        
        // ذخیره پیام‌ها از API
        hookApiRequests();
    }
    
    /**
     * هوک کردن درخواست‌های API برای ذخیره اطلاعات پیام‌ها
     */
    function hookApiRequests() {
        // ذخیره تابع اصلی $.ajax
        const originalAjax = $.ajax;
        
        // جایگزینی تابع با نسخه جدید
        $.ajax = function(options) {
            const originalSuccess = options.success;
            
            // اگر درخواست برای دریافت پیام‌ها است
            if (options.url === '/api/received-messages' || options.url === '/api/sent-messages' || options.url.startsWith('/api/message/')) {
                options.success = function(response) {
                    // ذخیره پیام‌ها در کش
                    if (options.url === '/api/received-messages' || options.url === '/api/sent-messages') {
                        if (response.messages && Array.isArray(response.messages)) {
                            response.messages.forEach(msg => {
                                if (msg.id) {
                                    window.messagesCache[msg.id] = msg;
                                }
                            });
                        }
                    } else if (options.url.startsWith('/api/message/') && response.message) {
                        // ذخیره یک پیام خاص
                        if (response.message.id) {
                            window.messagesCache[response.message.id] = response.message;
                        }
                    }
                    
                    // فراخوانی callback اصلی
                    if (originalSuccess) {
                        originalSuccess.apply(this, arguments);
                    }
                };
            }
            
            // فراخوانی تابع اصلی
            return originalAjax.apply(this, arguments);
        };
    }
    
    /**
     * تنظیم MutationObserver برای شناسایی پیام‌های جدید
     * (این تابع فقط در صورت عدم موفقیت هوک renderMessages استفاده می‌شود)
     */
    function setupMutationObserver() {
        const chatBody = document.getElementById('telegramChatBody');
        if (!chatBody) {
            console.warn('المنت telegramChatBody یافت نشد');
            return;
        }
        
        const observer = new MutationObserver(function(mutations) {
            let hasNewMessages = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    hasNewMessages = true;
                }
            });
            
            if (hasNewMessages) {
                processRepliedToMessages();
            }
        });
        
        observer.observe(chatBody, { childList: true, subtree: true });
    }
    
    /**
     * پردازش و نمایش پیام‌های ریپلای شده
     */
    function processRepliedToMessages() {
        // بررسی همه پیام‌ها برای یافتن پیام‌های ریپلای شده
        document.querySelectorAll('.telegram-message').forEach(messageElement => {
            // اگر قبلاً پردازش شده است، آن را نادیده بگیر
            if (messageElement.dataset.replyProcessed === 'true') {
                return;
            }
            
            // استخراج شناسه پیام
            const messageId = messageElement.dataset.messageId;
            if (!messageId) {
                return;
            }
            
            // یافتن اطلاعات پیام از API یا کش پیام‌ها
            let messageInfo = null;
            
            // تلاش برای یافتن اطلاعات پیام از messagesCache
            if (window.activeMessages) {
                messageInfo = window.activeMessages.find(msg => msg.id === messageId);
            }
            
            // اگر اطلاعات پیام یافت نشد، از messagesCache استفاده کن
            if (!messageInfo && window.messagesCache && window.messagesCache[messageId]) {
                messageInfo = window.messagesCache[messageId];
            }
            
            // اگر اطلاعات پیام یافت شد و پیام ریپلای شده است
            if (messageInfo && (messageInfo.has_reply_to === true || messageInfo.reply_to_id)) {
                const replyToId = messageInfo.reply_to_id;
                
                if (replyToId) {
                    // یافتن پیام اصلی از messagesCache
                    let originalMessage = null;
                    
                    if (window.messagesCache && window.messagesCache[replyToId]) {
                        originalMessage = window.messagesCache[replyToId];
                    } else if (window.activeMessages) {
                        originalMessage = window.activeMessages.find(msg => msg.id === replyToId.toString());
                    }
                    
                    // اگر پیام اصلی یافت شد، آن را نمایش بده
                    if (originalMessage) {
                        displayReplyToMessage(messageElement, originalMessage);
                    } else {
                        // اگر پیام اصلی در کش یافت نشد، آن را با API بارگذاری کن
                        // توجه: این مورد نادر است و تنها زمانی اتفاق می‌افتد که کش خالی باشد
                        fetchMessageById(replyToId).then(fetchedMessage => {
                            if (fetchedMessage) {
                                displayReplyToMessage(messageElement, fetchedMessage);
                            }
                        });
                    }
                }
            }
            
            // علامت‌گذاری پیام به عنوان پردازش شده
            messageElement.dataset.replyProcessed = 'true';
        });
    }
    
    /**
     * نمایش پیام ریپلای شده بالای پیام اصلی
     * @param {HTMLElement} messageElement - المنت پیام فعلی
     * @param {Object} originalMessage - اطلاعات پیام اصلی
     */
    function displayReplyToMessage(messageElement, originalMessage) {
        // ایجاد المنت پیام ریپلای شده
        const repliedToElement = document.createElement('div');
        repliedToElement.className = 'telegram-replied-to-message';
        
        // استخراج متن پیام اصلی و نوع پیام
        let originalMessageText = '';
        let messageTypeHTML = '';
        let senderName = '';
        
        // استخراج نام فرستنده اصلی (اگر موجود باشد)
        if (originalMessage.sender && originalMessage.sender.name) {
            senderName = originalMessage.sender.name;
        }
        
        // بررسی نوع پیام اصلی و استخراج متن مناسب
        if (originalMessage.body && originalMessage.body.trim() !== '') {
            // پیام متنی
            originalMessageText = originalMessage.body.trim();
            // محدود کردن طول متن برای نمایش
            if (originalMessageText.length > 40) {
                originalMessageText = originalMessageText.substring(0, 40) + '...';
            }
        } else if (originalMessage.attachments && originalMessage.attachments.length > 0) {
            // پیام با فایل پیوست
            const attachment = originalMessage.attachments[0];
            if (attachment.file_type) {
                switch (attachment.file_type.toLowerCase()) {
                    case 'image':
                        originalMessageText = 'تصویر';
                        messageTypeHTML = '<span class="telegram-replied-message-type"><i class="fa-solid fa-image"></i></span>';
                        break;
                    case 'audio':
                        originalMessageText = 'فایل صوتی';
                        messageTypeHTML = '<span class="telegram-replied-message-type"><i class="fa-solid fa-music"></i></span>';
                        break;
                    case 'video':
                        originalMessageText = 'فایل ویدیویی';
                        messageTypeHTML = '<span class="telegram-replied-message-type"><i class="fa-solid fa-video"></i></span>';
                        break;
                    case 'pdf':
                        originalMessageText = 'فایل PDF';
                        messageTypeHTML = '<span class="telegram-replied-message-type"><i class="fa-solid fa-file-pdf"></i></span>';
                        break;
                    default:
                        originalMessageText = 'فایل پیوست';
                        messageTypeHTML = '<span class="telegram-replied-message-type"><i class="fa-solid fa-paperclip"></i></span>';
                }
            } else {
                originalMessageText = 'فایل پیوست';
                messageTypeHTML = '<span class="telegram-replied-message-type"><i class="fa-solid fa-paperclip"></i></span>';
            }
        } else if (originalMessage.subject && originalMessage.subject !== 'بدون موضوع') {
            // اگر پیام فقط موضوع دارد
            originalMessageText = originalMessage.subject;
        } else {
            // پیام خالی
            originalMessageText = 'پیام بدون محتوا';
        }
        
        // ایجاد نوار عمودی برای نمایش ارتباط بین پیام‌ها
        const connectionBar = document.createElement('div');
        connectionBar.className = 'telegram-reply-connection';
        repliedToElement.appendChild(connectionBar);
        
        // تنظیم محتوای المنت
        let replyContent = `<i class="fa-solid fa-reply"></i>`;
        
        // اگر نام فرستنده موجود باشد، آن را نمایش بده
        if (senderName) {
            replyContent += `<span class="telegram-replied-sender">${senderName}</span>`;
        }
        
        // اضافه کردن آیکون نوع پیام (اگر وجود داشته باشد)
        if (messageTypeHTML) {
            replyContent += messageTypeHTML;
        }
        
        // اضافه کردن متن پیام
        replyContent += originalMessageText;
        
        repliedToElement.innerHTML = replyContent;
        repliedToElement.title = 'کلیک کنید تا به پیام اصلی بروید';
        repliedToElement.dataset.originalMessageId = originalMessage.id;
        
        // اضافه کردن رویداد کلیک برای اسکرول به پیام اصلی
        repliedToElement.addEventListener('click', function() {
            scrollToMessage(originalMessage.id);
        });
        
        // بررسی نوع پیام و اضافه کردن المنت پیام ریپلای شده به موقعیت مناسب
        const isAttachmentMessage = messageElement.querySelector('.telegram-attachment-item-standalone') !== null;
        
        if (isAttachmentMessage) {
            // پیام دارای فایل پیوست مستقل (عکس، ویدیو، صوت، PDF و ...)
            const attachmentItem = messageElement.querySelector('.telegram-attachment-item-standalone');
            if (attachmentItem) {
                // اصلاح استایل کادر اصلی پیام دارای فایل پیوست
                attachmentItem.style.display = 'flex';
                attachmentItem.style.flexDirection = 'column';
                attachmentItem.style.overflow = 'visible';
                
                // قرار دادن المنت ریپلای داخل کلاس telegram-attachment-item-standalone
                // و در ابتدای آن، قبل از همه المنت‌های فرزند
                attachmentItem.insertBefore(repliedToElement, attachmentItem.firstChild);
                
                // شناسایی نوع پیوست برای اصلاح استایل
                const isAudio = attachmentItem.querySelector('.telegram-audio-custom') !== null;
                const isVideo = attachmentItem.querySelector('.telegram-video-container') !== null;
                const isImage = attachmentItem.querySelector('img.telegram-attachment-image-standalone') !== null;
                const isPDF = attachmentItem.querySelector('.telegram-file-box') !== null;
                
                // اصلاح استایل برای انواع مختلف فایل
                if (isAudio) {
                    const audioCustom = attachmentItem.querySelector('.telegram-audio-custom');
                    if (audioCustom) {
                        audioCustom.style.borderTopLeftRadius = '0';
                        audioCustom.style.borderTopRightRadius = '0';
                        audioCustom.style.marginTop = '0';
                    }
                }
                
                if (isVideo) {
                    const videoContainer = attachmentItem.querySelector('.telegram-video-container');
                    if (videoContainer) {
                        videoContainer.style.borderTopLeftRadius = '0';
                        videoContainer.style.borderTopRightRadius = '0';
                        videoContainer.style.marginTop = '0';
                    }
                }
                
                if (isImage) {
                    const image = attachmentItem.querySelector('img.telegram-attachment-image-standalone');
                    if (image) {
                        image.style.borderTopLeftRadius = '0';
                        image.style.borderTopRightRadius = '0';
                        image.style.marginTop = '0';
                    }
                }
                
                if (isPDF) {
                    const fileBox = attachmentItem.querySelector('.telegram-file-box');
                    if (fileBox) {
                        fileBox.style.borderTopLeftRadius = '0';
                        fileBox.style.borderTopRightRadius = '0';
                        fileBox.style.marginTop = '0';
                    }
                }
                
                // تنظیم استایل خاص برای پیام‌های ریپلای در فایل‌های پیوست
                repliedToElement.style.display = 'flex';
                repliedToElement.style.alignItems = 'center';
                repliedToElement.style.width = '100%';
                
                // اصلاح استایل برای ریپلای در پیام‌های صوتی
                if (isAudio) {
                    // افزایش ارتفاع کلی باکس برای پیام‌های صوتی
                    attachmentItem.style.paddingBottom = '5px';
                }
            }
        } else {
            // پیام متنی معمولی
            const messageContent = messageElement.querySelector('.telegram-message-content');
            if (messageContent) {
                messageContent.insertBefore(repliedToElement, messageContent.firstChild);
                
                // اضافه کردن کلاس برای ایجاد فاصله بین پیام ریپلای شده و متن اصلی
                const messageBody = messageElement.querySelector('.telegram-message-body');
                if (messageBody) {
                    messageBody.classList.add('telegram-message-body-with-reply');
                }
            }
        }
    }
    
    /**
     * دریافت اطلاعات پیام با شناسه از API
     * @param {string|number} messageId - شناسه پیام
     * @returns {Promise} - وعده حاوی اطلاعات پیام
     */
    function fetchMessageById(messageId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/message/${messageId}`,
                type: 'GET',
                success: function(response) {
                    if (response.message) {
                        // ذخیره پیام در کش
                        window.messagesCache[messageId] = response.message;
                        resolve(response.message);
                    } else {
                        resolve(null);
                    }
                },
                error: function() {
                    resolve(null);
                }
            });
        });
    }
    
    /**
     * اسکرول به پیام با شناسه مشخص
     * @param {string} messageId - شناسه پیام
     */
    function scrollToMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            // پیدا کردن المنت فایل پیوست
            const attachmentItem = messageElement.querySelector('.telegram-attachment-item-standalone');
            
            // ایجاد افکت پالس قبل از اعمال استایل اصلی
            const pulseEffect = (element) => {
                element.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                element.style.transform = 'scale(1.03)';
                element.style.zIndex = '100';
                
                // رنگ‌های مختلف برای پیام‌های ارسالی و دریافتی
                const isOutgoing = messageElement.classList.contains('telegram-message-outgoing');
                
                if (isOutgoing) {
                    // پیام‌های ارسالی - رنگ سبز درخشان‌تر
                    element.style.backgroundColor = 'rgba(15, 157, 88, 0.4)';
                    element.style.boxShadow = '0 0 15px rgba(15, 157, 88, 0.6), 0 0 30px rgba(15, 157, 88, 0.3)';
                    
                } else {
                    // پیام‌های دریافتی - رنگ آبی درخشان
                    element.style.backgroundColor = 'rgba(33, 150, 243, 0.4)';
                    element.style.boxShadow = '0 0 15px rgba(33, 150, 243, 0.6), 0 0 30px rgba(33, 150, 243, 0.3)';
                }
                
                // بازگشت به حالت عادی با اندازه کمی بزرگتر
                setTimeout(() => {
                    element.style.transform = 'scale(1.01)';
                    if (isOutgoing) {
                        element.style.backgroundColor = 'rgba(15, 157, 88, 0.25)';
                        element.style.boxShadow = '0 0 10px rgba(15, 157, 88, 0.4)';
                    } else {
                        element.style.backgroundColor = 'rgba(33, 150, 243, 0.25)';
                        element.style.boxShadow = '0 0 10px rgba(33, 150, 243, 0.4)';
                    }
                }, 300);
            };
            
            // اعمال افکت بر اساس نوع پیام
            if (attachmentItem) {
                pulseEffect(attachmentItem);
            } else {
                pulseEffect(messageElement);
            }
            
            // اسکرول به پیام با تأخیر کوتاه برای دیدن بهتر افکت
            setTimeout(() => {
                messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            
            // حذف برجستگی بعد از چند ثانیه
            setTimeout(function() {
                const targetElement = attachmentItem || messageElement;
                
                // انیمیشن محو شدن افکت
                targetElement.style.transition = 'all 0.5s ease';
                targetElement.style.backgroundColor = '';
                targetElement.style.boxShadow = '';
                targetElement.style.transform = 'scale(1)';
                targetElement.style.borderLeft = '';
                targetElement.style.borderRight = '';
                
                setTimeout(function() {
                    targetElement.style.transition = '';
                    targetElement.style.zIndex = '';
                }, 500);
            }, 3000); // زمان طولانی‌تر برای نمایش بهتر
        }
    }
    
    // تلاش اولیه برای پردازش پیام‌های ریپلای شده بعد از بارگذاری صفحه
    setTimeout(function() {
        processRepliedToMessages();
    }, 1500);
    
    // پردازش مجدد بعد از بارگذاری کامل صفحه
    window.addEventListener('load', function() {
        setTimeout(function() {
            processRepliedToMessages();
        }, 2000);
    });
}); 