// مدیریت اسکرول چت تلگرام
window.telegramScrollManager = (function() {
    let isScrolling = false;

    // تابع اصلی اسکرول به پایین
    function scrollToBottom(smooth = true) {
        if (isScrolling) return;
        
        const chatBody = document.getElementById('telegramChatBody');
        if (!chatBody) return;

        isScrolling = true;

        if (smooth) {
            chatBody.scrollTo({
                top: chatBody.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // ریست کردن وضعیت اسکرول بعد از 300ms
        setTimeout(() => {
            isScrolling = false;
        }, 300);
    }

    // اسکرول به پایین بعد از لود شدن صفحه
    document.addEventListener('DOMContentLoaded', () => {
        scrollToBottom(false);
    });

    // اسکرول به پایین بعد از لود کامل صفحه
    window.addEventListener('load', () => {
        scrollToBottom(false);
    });

    return {
        scrollToBottom
    };
})(); 