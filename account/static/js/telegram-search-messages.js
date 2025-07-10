/**
 * مدیریت جستجو در پیام‌های چت
 * این فایل برای جستجو در پیام‌های داخل چت استفاده می‌شود
 */

document.addEventListener('DOMContentLoaded', function() {
    // متغیرهای مورد نیاز
    let activeConversationMessages = [];
    let searchResultItems = [];
    let currentHighlightedIndex = -1;
    
    // عناصر DOM
    const searchBtn = document.getElementById('telegramSearchBtn');
    const searchChat = document.getElementById('telegramSearchChat');
    const searchInput = document.getElementById('telegramSearchChatInput');
    const searchClose = document.getElementById('telegramSearchChatClose');
    const searchResultsContainer = document.getElementById('telegramSearchResults');
    const chatBody = document.getElementById('telegramChatBody');
    const backBtn = document.getElementById('telegramBackBtn'); // دکمه بازگشت
    
    // اضافه کردن رویدادها
    if (searchBtn) {
        searchBtn.addEventListener('click', toggleSearchPanel);
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', toggleSearchPanel);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }
    
    // اضافه کردن رویداد برای دکمه بازگشت
    if (backBtn) {
        backBtn.addEventListener('click', closeSearchPanel);
    }
    
    // گوش دادن به رویداد تغییر گفتگو
    document.addEventListener('conversation-changed', closeSearchPanel);
    
    // گوش دادن به رویداد بستن چت
    document.addEventListener('chat-closed', closeSearchPanel);
    
    /**
     * بستن پنل جستجو
     */
    function closeSearchPanel() {
        if (searchChat && searchChat.style.display !== 'none') {
            searchChat.style.display = 'none';
            clearSearchResults();
            clearHighlights();
        }
    }
    
    /**
     * نمایش/مخفی کردن پنل جستجو
     */
    function toggleSearchPanel() {
        if (searchChat.style.display === 'none' || !searchChat.style.display) {
            // ذخیره پیام‌های گفتگوی فعال برای جستجو
            saveActiveConversationMessages();
            
            // نمایش پنل جستجو
            searchChat.style.display = 'block';
            searchInput.focus();
            
            // پاک کردن نتایج قبلی
            clearSearchResults();
        } else {
            // مخفی کردن پنل جستجو
            searchChat.style.display = 'none';
            
            // پاک کردن نتایج جستجو و برجسته‌سازی‌ها
            clearSearchResults();
            clearHighlights();
        }
    }
    
    /**
     * ذخیره پیام‌های گفتگوی فعال برای جستجو
     */
    function saveActiveConversationMessages() {
        activeConversationMessages = [];
        
        // پیدا کردن تمام پیام‌های متنی در چت فعال
        const messageElements = chatBody.querySelectorAll('.telegram-message');
        console.log('تعداد پیام‌های یافت شده:', messageElements.length);
        
        messageElements.forEach((messageEl, index) => {
            let messageText = '';
            let messageType = 'text';
            let fileInfo = '';
            let fileUrl = '';
            
            // بررسی محتوای متنی پیام (می‌تواند در کلاس‌های مختلف باشد)
            const messageContent = messageEl.querySelector('.telegram-message-text, .telegram-message-body');
            
            // بررسی وجود فایل در پیام
            const attachmentItem = messageEl.querySelector('.telegram-attachment-item-standalone');
            const fileNameElement = messageEl.querySelector('.telegram-attachment-filename');
            const fileTypeElement = messageEl.querySelector('.telegram-attachment-type');
            const audioElement = messageEl.querySelector('.telegram-audio-custom');
            
            if (messageContent) {
                // پیام متنی
                messageText = messageContent.textContent.trim();
                messageType = 'text';
            } else if (attachmentItem || fileNameElement || audioElement) {
                // پیام حاوی فایل
                messageType = 'file';
                
                // تلاش برای استخراج نام فایل و URL
                if (fileNameElement) {
                    // اگر المان نام فایل وجود دارد
                    fileInfo = fileNameElement.textContent.trim();
                    messageText = `فایل: ${fileInfo}`;
                    
                    // تلاش برای یافتن لینک دانلود
                    const downloadLink = messageEl.querySelector('a[download]');
                    if (downloadLink) {
                        fileUrl = downloadLink.getAttribute('href');
                        // استخراج نام فایل از URL
                        const urlParts = fileUrl.split('/');
                        const fileName = urlParts[urlParts.length - 1];
                        if (fileName) {
                            // اضافه کردن نام فایل به متن جستجو
                            messageText += ` - ${fileName}`;
                        }
                    }
                } else if (audioElement) {
                    // اگر فایل صوتی است
                    const audioTitle = audioElement.querySelector('.telegram-audio-title');
                    if (audioTitle) {
                        fileInfo = audioTitle.textContent.trim();
                        messageText = `فایل صوتی: ${fileInfo}`;
                    } else {
                        messageText = 'فایل صوتی';
                    }
                    
                    // تلاش برای یافتن URL صوت
                    const audioSource = audioElement.querySelector('audio');
                    if (audioSource) {
                        fileUrl = audioSource.getAttribute('src');
                        if (fileUrl) {
                            // استخراج نام فایل از URL
                            const urlParts = fileUrl.split('/');
                            const fileName = urlParts[urlParts.length - 1];
                            if (fileName) {
                                // اضافه کردن نام فایل به متن جستجو
                                messageText += ` - ${fileName}`;
                            }
                        }
                    }
                } else {
                    // تلاش برای استخراج نوع فایل از کلاس‌های مختلف
                    const imageElement = messageEl.querySelector('.telegram-attachment-image-standalone');
                    const videoElement = messageEl.querySelector('video');
                    const fileTypeText = messageEl.querySelector('.telegram-file-type');
                    
                    if (imageElement) {
                        fileInfo = imageElement.getAttribute('alt') || 'تصویر';
                        messageText = `تصویر: ${fileInfo}`;
                        fileUrl = imageElement.getAttribute('src');
                        
                        // تلاش برای یافتن لینک دانلود
                        const downloadLink = messageEl.querySelector('a[download]');
                        if (downloadLink) {
                            fileUrl = downloadLink.getAttribute('href') || fileUrl;
                            // استخراج نام فایل از URL
                            const urlParts = fileUrl.split('/');
                            const fileName = urlParts[urlParts.length - 1];
                            if (fileName) {
                                // اضافه کردن نام فایل به متن جستجو
                                messageText += ` - ${fileName}`;
                            }
                        }
                    } else if (videoElement) {
                        fileInfo = videoElement.getAttribute('title') || 'ویدیو';
                        messageText = `ویدیو: ${fileInfo}`;
                        fileUrl = videoElement.getAttribute('src');
                        
                        // استخراج نام فایل از URL
                        if (fileUrl) {
                            const urlParts = fileUrl.split('/');
                            const fileName = urlParts[urlParts.length - 1];
                            if (fileName) {
                                // اضافه کردن نام فایل به متن جستجو
                                messageText += ` - ${fileName}`;
                            }
                        }
                    } else if (fileTypeText) {
                        fileInfo = fileTypeText.textContent.trim();
                        messageText = fileInfo;
                        
                        // تلاش برای یافتن لینک دانلود
                        const downloadLink = messageEl.querySelector('a[download], a[href]');
                        if (downloadLink) {
                            fileUrl = downloadLink.getAttribute('href');
                            // استخراج نام فایل از URL
                            const urlParts = fileUrl.split('/');
                            const fileName = urlParts[urlParts.length - 1];
                            if (fileName) {
                                // اضافه کردن نام فایل به متن جستجو
                                messageText += ` - ${fileName}`;
                            }
                        }
                    } else {
                        // اگر هیچ اطلاعات خاصی پیدا نشد، تلاش برای یافتن هر نوع لینک
                        const anyLink = messageEl.querySelector('a[href]');
                        if (anyLink) {
                            fileUrl = anyLink.getAttribute('href');
                            // استخراج نام فایل از URL
                            const urlParts = fileUrl.split('/');
                            const fileName = urlParts[urlParts.length - 1];
                            if (fileName) {
                                messageText = `فایل ضمیمه: ${fileName}`;
                            } else {
                                messageText = 'فایل ضمیمه';
                            }
                        } else {
                            messageText = 'فایل ضمیمه';
                        }
                    }
                }
            } else {
                console.log('محتوای متنی یا فایل پیام یافت نشد در:', messageEl);
                return; // رد کردن این پیام
            }
            
            const isOutgoing = messageEl.classList.contains('telegram-message-outgoing');
            
            // پیدا کردن تاریخ پیام
            const timeEl = messageEl.querySelector('.telegram-message-time');
            const timeText = timeEl ? timeEl.textContent.trim() : '';
            
            console.log(`پیام یافت شده (${messageType}):`, messageText);
            if (fileUrl) {
                console.log('URL فایل:', fileUrl);
            }
            
            // اضافه کردن به لیست پیام‌ها
            activeConversationMessages.push({
                index: index,
                text: messageText,
                type: messageType,
                fileInfo: fileInfo,
                fileUrl: fileUrl,
                isOutgoing: isOutgoing,
                time: timeText,
                element: messageEl
            });
        });
        
        console.log('تعداد پیام‌های قابل جستجو:', activeConversationMessages.length);
    }
    
    /**
     * انجام جستجو در پیام‌ها
     */
    function performSearch() {
        // پاک کردن نتایج قبلی و برجسته‌سازی‌ها
        clearSearchResults();
        clearHighlights();
        
        const query = searchInput.value.trim();
        if (!query || query.length < 2) return;
        
        // نمایش وضعیت در حال جستجو
        showSearchingStatus();
        
        // جستجو در پیام‌ها با تأخیر کوتاه برای نمایش وضعیت جستجو
        setTimeout(() => {
            searchResultItems = activeConversationMessages.filter(message => {
                // جستجو در متن پیام
                if (message.text.toLowerCase().includes(query.toLowerCase())) {
                    return true;
                }
                
                // جستجو در URL فایل
                if (message.fileUrl && message.fileUrl.toLowerCase().includes(query.toLowerCase())) {
                    return true;
                }
                
                return false;
            });
            
            // نمایش نتایج جستجو
            displaySearchResults(query);
        }, 300);
    }
    
    /**
     * نمایش وضعیت در حال جستجو
     */
    function showSearchingStatus() {
        const searchingStatus = document.createElement('div');
        searchingStatus.className = 'telegram-searching-status';
        searchingStatus.innerHTML = `
            <div class="telegram-searching-spinner">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </div>
            <div class="telegram-searching-text">در حال جستجو...</div>
        `;
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.appendChild(searchingStatus);
    }
    
    /**
     * نمایش نتایج جستجو
     * @param {string} query - عبارت جستجو شده
     */
    function displaySearchResults(query) {
        // پاک کردن محتوای قبلی
        searchResultsContainer.innerHTML = '';
        
        if (searchResultItems.length === 0) {
            const noResult = document.createElement('div');
            noResult.className = 'telegram-empty-message';
            noResult.style.padding = '10px';
            noResult.textContent = 'هیچ پیامی یافت نشد.';
            searchResultsContainer.appendChild(noResult);
            return;
        }
        
        // نمایش تعداد نتایج
        const resultCountElement = document.createElement('div');
        resultCountElement.className = 'telegram-search-result-count';
        resultCountElement.textContent = `${searchResultItems.length} نتیجه یافت شد`;
        searchResultsContainer.appendChild(resultCountElement);
        
        // ایجاد کانتینر برای نتایج جستجو
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'telegram-search-results-container';
        searchResultsContainer.appendChild(resultsContainer);
        
        // ایجاد المان برای هر نتیجه
        searchResultItems.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'telegram-search-result-item';
            resultItem.dataset.index = index;
            
            // برجسته کردن متن جستجو شده
            const highlightedText = highlightText(result.text, query);
            
            // برجسته کردن URL فایل اگر وجود دارد
            let fileUrlHtml = '';
            if (result.fileUrl) {
                const fileName = extractFileName(result.fileUrl);
                // بررسی اینکه آیا عبارت جستجو در URL فایل وجود دارد
                if (result.fileUrl.toLowerCase().includes(query.toLowerCase())) {
                    // برجسته کردن نام فایل
                    const highlightedFileName = highlightText(fileName, query);
                    fileUrlHtml = `<div class="telegram-search-result-file-url" title="${result.fileUrl}">${highlightedFileName}</div>`;
                } else {
                    fileUrlHtml = `<div class="telegram-search-result-file-url" title="${result.fileUrl}">${fileName}</div>`;
                }
            }
            
            // آیکون مناسب برای نوع پیام
            let typeIcon = '';
            if (result.type === 'file') {
                // انتخاب آیکون مناسب بر اساس نوع فایل
                if (result.text.includes('تصویر:')) {
                    typeIcon = '<i class="fa-solid fa-image telegram-search-result-icon"></i>';
                } else if (result.text.includes('ویدیو:')) {
                    typeIcon = '<i class="fa-solid fa-video telegram-search-result-icon"></i>';
                } else if (result.text.includes('فایل صوتی:')) {
                    typeIcon = '<i class="fa-solid fa-music telegram-search-result-icon"></i>';
                } else if (result.text.includes('پیام صوتی:')) {
                    typeIcon = '<i class="fa-solid fa-microphone telegram-search-result-icon"></i>';
                } else if (result.text.includes('PDF')) {
                    typeIcon = '<i class="fa-solid fa-file-pdf telegram-search-result-icon"></i>';
                } else if (result.text.includes('Word')) {
                    typeIcon = '<i class="fa-solid fa-file-word telegram-search-result-icon"></i>';
                } else if (result.text.includes('Excel')) {
                    typeIcon = '<i class="fa-solid fa-file-excel telegram-search-result-icon"></i>';
                } else {
                    typeIcon = '<i class="fa-solid fa-file telegram-search-result-icon"></i>';
                }
            } else {
                typeIcon = '<i class="fa-solid fa-comment telegram-search-result-icon"></i>';
            }
            
            // ایجاد محتوای نتیجه
            resultItem.innerHTML = `
                <div class="telegram-search-result-header">
                    <div class="telegram-search-result-type">
                        ${typeIcon}
                    </div>
                    <div class="telegram-search-result-info">
                        ${result.isOutgoing ? 'ارسالی' : 'دریافتی'} • ${result.time}
                    </div>
                </div>
                <div class="telegram-search-result-text">${highlightedText}</div>
                ${fileUrlHtml}
            `;
            
            // اضافه کردن رویداد کلیک
            resultItem.addEventListener('click', () => {
                scrollToMessage(result);
                highlightMessage(result, index);
            });
            
            // اضافه کردن به لیست نتایج
            resultsContainer.appendChild(resultItem);
        });
    }
    
    /**
     * برجسته کردن متن جستجو شده
     * @param {string} text - متن اصلی
     * @param {string} query - عبارت جستجو شده
     * @returns {string} متن با برجسته‌سازی
     */
    function highlightText(text, query) {
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<span class="telegram-search-highlight">$1</span>');
    }
    
    /**
     * اسکیپ کردن کاراکترهای خاص در عبارت جستجو برای استفاده در regex
     * @param {string} string - رشته ورودی
     * @returns {string} رشته اسکیپ شده
     */
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * اسکرول به پیام مورد نظر
     * @param {Object} message - اطلاعات پیام
     */
    function scrollToMessage(message) {
        // برداشتن برجسته‌سازی از همه پیام‌ها
        clearHighlights();
        
        // اسکرول به پیام
        message.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // برجسته کردن پیام
        message.element.classList.add('telegram-message-highlighted');
        
        // اضافه کردن کلاس انیمیشن
        message.element.classList.add('telegram-message-highlight-animation');
        
        // حذف کلاس انیمیشن بعد از اتمام
        setTimeout(() => {
            message.element.classList.remove('telegram-message-highlight-animation');
        }, 2000);
    }
    
    /**
     * برجسته کردن پیام و نتیجه جستجو
     * @param {Object} message - اطلاعات پیام
     * @param {number} index - شاخص نتیجه
     */
    function highlightMessage(message, index) {
        // برداشتن برجسته‌سازی از همه نتایج قبلی
        const allResultItems = searchResultsContainer.querySelectorAll('.telegram-search-result-item');
        allResultItems.forEach(item => {
            item.classList.remove('telegram-search-result-active');
        });
        
        // برجسته کردن نتیجه فعلی
        const currentResultItem = searchResultsContainer.querySelector(`.telegram-search-result-item[data-index="${index}"]`);
        if (currentResultItem) {
            currentResultItem.classList.add('telegram-search-result-active');
        }
        
        // به‌روزرسانی شاخص فعلی
        currentHighlightedIndex = index;
    }
    
    /**
     * پاک کردن نتایج جستجو
     */
    function clearSearchResults() {
        searchResultsContainer.innerHTML = '';
        currentHighlightedIndex = -1;
    }
    
    /**
     * پاک کردن برجسته‌سازی‌ها
     */
    function clearHighlights() {
        const highlightedMessages = chatBody.querySelectorAll('.telegram-message-highlighted');
        highlightedMessages.forEach(el => {
            el.classList.remove('telegram-message-highlighted');
            el.classList.remove('telegram-message-highlight-animation');
        });
    }
    
    /**
     * مدیریت کلیدهای فشرده شده در فیلد جستجو
     * @param {KeyboardEvent} e - رویداد کیبورد
     */
    function handleSearchKeydown(e) {
        // اگر نتیجه‌ای وجود ندارد، کاری انجام نده
        if (searchResultItems.length === 0) return;
        
        if (e.key === 'Enter') {
            // اگر Enter فشرده شد، به نتیجه بعدی/قبلی برو
            if (e.shiftKey) {
                // Shift+Enter: نتیجه قبلی
                navigateToPreviousResult();
            } else {
                // Enter: نتیجه بعدی
                navigateToNextResult();
            }
            e.preventDefault();
        } else if (e.key === 'Escape') {
            // اگر Escape فشرده شد، پنل جستجو را ببند
            toggleSearchPanel();
            e.preventDefault();
        }
    }
    
    /**
     * رفتن به نتیجه بعدی
     */
    function navigateToNextResult() {
        if (searchResultItems.length === 0) return;
        
        // محاسبه شاخص بعدی (به صورت چرخشی)
        const nextIndex = (currentHighlightedIndex + 1) % searchResultItems.length;
        
        // اسکرول و برجسته کردن نتیجه بعدی
        scrollToMessage(searchResultItems[nextIndex]);
        highlightMessage(searchResultItems[nextIndex], nextIndex);
    }
    
    /**
     * رفتن به نتیجه قبلی
     */
    function navigateToPreviousResult() {
        if (searchResultItems.length === 0) return;
        
        // محاسبه شاخص قبلی (به صورت چرخشی)
        const prevIndex = (currentHighlightedIndex - 1 + searchResultItems.length) % searchResultItems.length;
        
        // اسکرول و برجسته کردن نتیجه قبلی
        scrollToMessage(searchResultItems[prevIndex]);
        highlightMessage(searchResultItems[prevIndex], prevIndex);
    }
    
    /**
     * تابع debounce برای جلوگیری از اجرای مکرر جستجو
     * @param {Function} func - تابع اصلی
     * @param {number} wait - زمان تأخیر به میلی‌ثانیه
     * @returns {Function} تابع debounce شده
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // اضافه کردن استایل‌های جدید به صفحه
    addSearchStyles();
    
    /**
     * اضافه کردن استایل‌های مورد نیاز برای برجسته‌سازی پیام‌ها
     */
    function addSearchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .telegram-message-highlighted {
                position: relative;
                z-index: 2;
                box-shadow: 0 0 0 2px #0F9D58;
            }
            
            .telegram-message-highlight-animation {
                animation: highlightPulse 2s ease;
            }
            
            @keyframes highlightPulse {
                0% { box-shadow: 0 0 0 2px rgba(15, 157, 88, 0.7); }
                50% { box-shadow: 0 0 0 4px rgba(15, 157, 88, 0.5); }
                100% { box-shadow: 0 0 0 2px rgba(15, 157, 88, 0.7); }
            }
            
            .telegram-search-result-item {
                padding: 10px 12px;
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                background-color: #363C4E;
                transition: all 0.2s ease;
            }
            
            .telegram-search-result-item:hover {
                background-color: #3A4053;
            }
            
            .telegram-search-result-active {
                background-color: #0F9D58;
            }
            
            .telegram-search-result-active .telegram-search-result-info,
            .telegram-search-result-active .telegram-search-result-text,
            .telegram-search-result-active .telegram-search-result-file-url {
                color: white;
            }
            
            .telegram-search-result-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            
            .telegram-search-result-type {
                display: flex;
                align-items: center;
            }
            
            .telegram-search-result-icon {
                margin-right: 8px;
                font-size: 14px;
                color: #0F9D58;
            }
            
            .telegram-search-result-active .telegram-search-result-icon {
                color: white;
            }
            
            .telegram-search-result-info {
                font-size: 11px;
                color: #9AA0B5;
            }
            
            .telegram-search-result-text {
                font-size: 13px;
                color: #fff;
                line-height: 1.4;
                word-break: break-word;
                max-height: 60px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
            }
            
            .telegram-search-result-file-url {
                font-size: 11px;
                color: #6c90b9;
                margin-top: 5px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                direction: ltr;
                text-align: left;
            }
            
            .telegram-search-highlight {
                background-color: rgba(15, 157, 88, 0.3);
                padding: 0 2px;
                border-radius: 3px;
                font-weight: bold;
            }
            
            .telegram-search-result-active .telegram-search-highlight {
                background-color: rgba(255, 255, 255, 0.3);
            }
            
            /* استایل‌های وضعیت جستجو */
            .telegram-searching-status {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                text-align: center;
            }
            
            .telegram-searching-spinner {
                font-size: 24px;
                color: #0F9D58;
                margin-bottom: 10px;
            }
            
            .telegram-searching-text {
                color: #9AA0B5;
                font-size: 14px;
            }
            
            /* استایل نشانگر تعداد نتایج */
            .telegram-search-result-count {
                padding: 5px 10px;
                margin-bottom: 10px;
                color: #9AA0B5;
                font-size: 12px;
                text-align: center;
                border-bottom: 1px solid #3A4053;
                padding-bottom: 8px;
            }
            
            /* استایل کانتینر نتایج جستجو */
            .telegram-search-results-container {
                max-height: calc(100% - 40px);
                overflow-y: auto;
                padding: 0 5px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * استخراج نام فایل از URL
     * @param {string} url - آدرس فایل
     * @returns {string} نام فایل
     */
    function extractFileName(url) {
        if (!url) return '';
        
        try {
            const urlParts = url.split('/');
            let fileName = urlParts[urlParts.length - 1];
            
            // حذف پارامترهای URL
            if (fileName.includes('?')) {
                fileName = fileName.split('?')[0];
            }
            
            // کوتاه کردن نام فایل اگر خیلی طولانی باشد
            if (fileName.length > 30) {
                fileName = fileName.substring(0, 15) + '...' + fileName.substring(fileName.length - 10);
            }
            
            return fileName;
        } catch (error) {
            console.error('خطا در استخراج نام فایل:', error);
            return 'فایل';
        }
    }
}); 