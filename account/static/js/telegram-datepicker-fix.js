/**
 * اصلاح مشکلات تقویم در چت تلگرام - نسخه 4.0
 */

document.addEventListener('DOMContentLoaded', function() {
    //('فایل اصلاح تقویم تلگرام نسخه 4.0 بارگذاری شد');
    
    // اضافه کردن استایل‌های CSS مورد نیاز برای پنل زمانبندی
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* اصلاح استایل پنل زمانبندی */
        #schedulePanel {
            position: absolute !important;
            bottom: 60px !important;
            left: 0 !important;
            right: 0 !important;
            background-color: #2C3142 !important;
            padding: 10px !important;
            border-top: 1px solid #3A4053 !important;
            z-index: 9999 !important;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2) !important;
        }
    `;
    document.head.appendChild(styleElement);
    
    // اصلاح پنل زمانبندی
    const schedulePanel = document.getElementById('schedulePanel');
    if (schedulePanel) {
        schedulePanel.style.position = 'absolute';
        schedulePanel.style.bottom = '60px';
        schedulePanel.style.left = '0';
        schedulePanel.style.right = '0';
        schedulePanel.style.zIndex = '9999';
        
        // اطمینان از قرار گرفتن پنل در کانتینر چت، نه کانتینر ورودی
        const telegramChatContainer = document.querySelector('.telegram-chat-container');
        if (telegramChatContainer && !telegramChatContainer.contains(schedulePanel)) {
            telegramChatContainer.appendChild(schedulePanel);
        }
    }
    
    //('اصلاحات تقویم تلگرام با موفقیت اعمال شد');
}); 