/**
 * فایل اصلاح کننده مشکلات پخش‌کننده صوتی تلگرام
 * این فایل مشکل تداخل توابع setupTelegramAudio را حل می‌کند
 * نسخه: 1.0.0
 */

// اجرای کد پس از بارگذاری صفحه
document.addEventListener('DOMContentLoaded', function() {
    console.log("تلگرام صوتی فیکس بارگذاری شد");
    
    // ذخیره تابع اصلی
    const originalSetupTelegramAudio = window.setupTelegramAudio;
    
    // جایگزینی تابع با نسخه جدید که هر دو نوع پارامتر را پشتیبانی می‌کند
    window.setupTelegramAudio = function(audioUrlOrContainer, button, skipPlay = false) {
        // بررسی نوع پارامتر اول - اگر یک المان DOM باشد، آن را به عنوان container در نظر می‌گیریم
        if (audioUrlOrContainer instanceof Element || audioUrlOrContainer instanceof HTMLDocument) {
            console.log("setupTelegramAudio با container فراخوانی شد");
            
            // این حالت برای تابع setupTelegramAudio(container) است
            const container = audioUrlOrContainer;
            const audioElements = container.querySelectorAll('audio');
            
            if (!audioElements || audioElements.length === 0) {
                console.warn("هیچ المان صوتی در container یافت نشد");
                return;
            }
            
            audioElements.forEach(audio => {
                if (audio.getAttribute('data-setup') === 'true') return;
                audio.setAttribute('data-setup', 'true');
                
                const customAudio = audio.closest('.telegram-audio-custom');
                if (!customAudio) return;
                
                const playBtn = customAudio.querySelector('.telegram-audio-play');
                if (playBtn) {
                    playBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        window.toggleTelegramAudio(audio, playBtn);
                    });
                }
                
                // اضافه کردن سایر رویدادها و منطق مورد نیاز
            });
            return;
        }
        
        // اگر به اینجا رسیدیم، پارامتر اول یک URL است
        // فراخوانی تابع اصلی
        if (typeof originalSetupTelegramAudio === 'function') {
            console.log("setupTelegramAudio با URL فراخوانی شد");
            return originalSetupTelegramAudio.call(window, audioUrlOrContainer, button, skipPlay);
        } else {
            console.error("تابع اصلی setupTelegramAudio یافت نشد");
        }
    };
}); 