/**
 * اصلاح کننده پخش‌کننده صوتی برای مرورگرهای کروم و سافاری
 * این فایل مشکلات مربوط به نوار پیشرفت و مدت زمان Infinity را حل می‌کند
 * نسخه: 1.2.0 - آخرین به‌روزرسانی: 29 خرداد 1404
 * 
 * تغییرات اخیر:
 * - ایجاد تابع مرکزی applyPosition با قابلیت تلاش مجدد برای اعمال موقعیت
 * - بهبود گردش کار کلیک روی نوار پیشرفت برای به‌روزرسانی رابط کاربری قبل از تغییر زمان
 * - اصلاح مشکل نوار پیشرفت در مرورگر کروم که باعث شروع مجدد صدا می‌شد
 * - بهبود مدیریت رویدادها و کاهش تکرار کد
 */

// جایگزینی کامل رفتار پخش‌کننده صوتی
(function() {
    // متغیرهای سراسری
    const originalAudioPlay = window.Audio.prototype.play;
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    // جایگزینی متد play برای تمام عناصر audio
    window.Audio.prototype.play = function() {
        // قبل از پخش، اطمینان حاصل کنیم که عنصر صوتی اصلاح شده است
        fixAudioElement(this);
        // فراخوانی متد اصلی
        return originalAudioPlay.apply(this, arguments);
    };
    
    // جایگزینی متد addEventListener برای شناسایی رویدادهای مرتبط با صدا
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        // اگر این یک عنصر صوتی است و رویداد مرتبط با پخش است
        if (this instanceof HTMLAudioElement && 
            (type === 'play' || type === 'timeupdate' || type === 'loadedmetadata')) {
            fixAudioElement(this);
        }
        
        // فراخوانی متد اصلی
        return originalAddEventListener.apply(this, arguments);
    };
    
    // اضافه کردن رویداد کلیک سراسری برای شناسایی کلیک روی دکمه‌های پخش و نوار پیشرفت
    document.addEventListener('click', function(event) {
        handleUserInteraction(event);
    }, true); // استفاده از فاز capture برای اطمینان از اجرای قبل از رویدادهای دیگر
    
    // اضافه کردن پشتیبانی از رویدادهای لمسی برای دستگاه‌های موبایل
    document.addEventListener('touchstart', function(event) {
        handleUserInteraction(event);
    }, { capture: true, passive: false }); // تنظیم passive: false برای امکان استفاده از preventDefault
    
    // اضافه کردن رویداد برای بررسی دوره‌ای
    setInterval(checkAllAudioElements, 1000);
    
    // اجرای اولیه پس از بارگذاری صفحه
    document.addEventListener('DOMContentLoaded', function() {
        //("اصلاح کننده پخش‌کننده صوتی بارگذاری شد");
        checkAllAudioElements();
    });
    
    // بررسی مجدد پس از بارگذاری کامل صفحه
    window.addEventListener('load', function() {
        //("صفحه کاملاً بارگذاری شد، بررسی مجدد پخش‌کننده‌های صوتی...");
        setTimeout(checkAllAudioElements, 500);
    });
    
    // بررسی مجدد در زمان‌های مختلف پس از بارگذاری
    setTimeout(checkAllAudioElements, 1000);
    setTimeout(checkAllAudioElements, 2000);
    setTimeout(checkAllAudioElements, 5000);
    
    // اضافه کردن یک رویداد گوش دهنده برای تغییرات AJAX
    (function(open) {
        XMLHttpRequest.prototype.open = function() {
            this.addEventListener("readystatechange", function() {
                if (this.readyState === 4) {
                    //("درخواست AJAX کامل شد، بررسی پخش‌کننده‌های صوتی...");
                    setTimeout(checkAllAudioElements, 500);
                }
            });
            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);
})();

/**
 * بررسی و اصلاح تمام عناصر صوتی در صفحه
 */
function checkAllAudioElements() {
    try {
        // بررسی همه عناصر audio در صفحه
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(fixAudioElement);
        
        // بررسی پخش‌کننده‌های تلگرام
        const telegramPlayers = document.querySelectorAll('.telegram-audio-custom');
        telegramPlayers.forEach(function(player) {
            const audioElement = player.querySelector('audio');
            if (audioElement) {
                fixAudioElement(audioElement);
                setupTelegramProgressUpdater(audioElement, player);
            }
        });
        
        // بررسی پخش‌کننده‌های ضمیمه
        const attachmentPlayers = document.querySelectorAll('.attachment-audio-player');
        attachmentPlayers.forEach(function(player) {
            const audioElement = player.querySelector('audio');
            if (audioElement) {
                fixAudioElement(audioElement);
                setupAttachmentProgressUpdater(audioElement, player);
            }
        });
    } catch (error) {
        console.error("خطا در بررسی عناصر صوتی:", error);
    }
}

/**
 * اصلاح یک عنصر صوتی
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 */
function fixAudioElement(audioElement) {
    if (!audioElement || !(audioElement instanceof HTMLAudioElement)) return;
    
    // بررسی اینکه آیا قبلاً اصلاح شده است
    if (audioElement.hasAttribute('data-fixed')) return;
    
    // علامت‌گذاری به عنوان اصلاح شده
    audioElement.setAttribute('data-fixed', 'true');
    
    try {
        // یافتن کانتینر پخش‌کننده
        const telegramPlayer = audioElement.closest('.telegram-audio-custom');
        const attachmentPlayer = audioElement.closest('.attachment-audio-player');
        
        if (telegramPlayer) {
            // اصلاح پخش‌کننده تلگرام
            fixTelegramPlayer(audioElement, telegramPlayer);
        } else if (attachmentPlayer) {
            // اصلاح پخش‌کننده ضمیمه
            fixAttachmentPlayer(audioElement, attachmentPlayer);
        }
        
        // حذف رویدادهای قبلی برای جلوگیری از اضافه شدن چندباره
        audioElement.removeEventListener('timeupdate', audioTimeUpdateHandler);
        audioElement.removeEventListener('play', audioPlayHandler);
        audioElement.removeEventListener('pause', audioPauseHandler);
        
        // اضافه کردن رویدادها برای به‌روزرسانی نوار پیشرفت
        audioElement.addEventListener('timeupdate', audioTimeUpdateHandler);
        audioElement.addEventListener('play', audioPlayHandler);
        audioElement.addEventListener('pause', audioPauseHandler);
    } catch (error) {
        console.error("خطا در اصلاح عنصر صوتی:", error);
    }
}

/**
 * اصلاح پخش‌کننده تلگرام
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {HTMLElement} playerContainer - کانتینر پخش‌کننده
 */
function fixTelegramPlayer(audioElement, playerContainer) {
    const playButton = playerContainer.querySelector('.telegram-audio-play');
    if (!playButton) return;
    
    // استخراج URL صوتی
    const audioUrl = playButton.getAttribute('data-url');
    if (!audioUrl) return;
    
    // استخراج مدت زمان از نام فایل
    const durationInfo = extractDurationFromFilename(audioUrl);
    
    if (durationInfo.success) {
        // ذخیره مدت زمان برای استفاده بعدی
        audioElement.setAttribute('data-duration-seconds', durationInfo.totalSeconds);
        
        // تنظیم نمایش زمان اولیه
        const timeDisplay = playerContainer.querySelector('.telegram-audio-time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `00:00 / ${durationInfo.minutes}:${durationInfo.seconds}`;
        }
    }
}

/**
 * اصلاح پخش‌کننده ضمیمه
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {HTMLElement} playerContainer - کانتینر پخش‌کننده
 */
function fixAttachmentPlayer(audioElement, playerContainer) {
    const playButton = playerContainer.querySelector('.attachment-play-btn');
    if (!playButton) return;
    
    // استخراج URL صوتی
    const audioUrl = playButton.getAttribute('data-url');
    if (!audioUrl) return;
    
    // استخراج مدت زمان از نام فایل
    const durationInfo = extractDurationFromFilename(audioUrl);
    
    if (durationInfo.success) {
        // ذخیره مدت زمان برای استفاده بعدی
        audioElement.setAttribute('data-duration-seconds', durationInfo.totalSeconds);
        
        // تنظیم نمایش زمان اولیه
        const timeDisplay = playerContainer.querySelector('.attachment-time');
        if (timeDisplay) {
            timeDisplay.textContent = `00:00/${durationInfo.minutes}:${durationInfo.seconds}`;
        }
    }
}

/**
 * رویداد به‌روزرسانی زمان صوتی
 */
function audioTimeUpdateHandler() {
    try {
        const audioElement = this;
        const telegramPlayer = audioElement.closest('.telegram-audio-custom');
        const attachmentPlayer = audioElement.closest('.attachment-audio-player');
        
        if (telegramPlayer) {
            updateTelegramProgress(audioElement, telegramPlayer);
        } else if (attachmentPlayer) {
            updateAttachmentProgress(audioElement, attachmentPlayer);
        }
    } catch (error) {
        console.error("خطا در به‌روزرسانی زمان صوتی:", error);
    }
}

/**
 * رویداد شروع پخش صوتی
 */
function audioPlayHandler() {
    try {
        const audioElement = this;
        audioElement.setAttribute('data-playing', 'true');
        
        const telegramPlayer = audioElement.closest('.telegram-audio-custom');
        const attachmentPlayer = audioElement.closest('.attachment-audio-player');
        
        if (telegramPlayer) {
            // اضافه کردن کلاس playing به کانتینر
            telegramPlayer.classList.add('playing');
            
            // بررسی مجدد نوار پیشرفت
            setupTelegramProgressUpdater(audioElement, telegramPlayer);
            
            // اطمینان از اینکه آخرین موقعیت کلیک شده اعمال شود
            if (audioElement._lastClickPosition !== undefined) {
                //("اعمال موقعیت ذخیره شده در هنگام پخش:", audioElement._lastClickPosition);
                
                // استفاده از تأخیر کوتاه برای اطمینان از اینکه پخش شروع شده است
                setTimeout(function() {
                    applyPosition(audioElement, audioElement._lastClickPosition);
                }, 50);
            }
        } else if (attachmentPlayer) {
            // اضافه کردن کلاس playing به کانتینر
            attachmentPlayer.classList.add('playing');
            
            // بررسی مجدد نوار پیشرفت
            setupAttachmentProgressUpdater(audioElement, attachmentPlayer);
            
            // اطمینان از اینکه آخرین موقعیت کلیک شده اعمال شود
            if (audioElement._lastClickPosition !== undefined) {
                //("اعمال موقعیت ذخیره شده در هنگام پخش:", audioElement._lastClickPosition);
                
                // استفاده از تأخیر کوتاه برای اطمینان از اینکه پخش شروع شده است
                setTimeout(function() {
                    applyPosition(audioElement, audioElement._lastClickPosition);
                }, 50);
            }
        }
    } catch (error) {
        console.error("خطا در رویداد شروع پخش صوتی:", error);
    }
}

/**
 * رویداد توقف پخش صوتی
 */
function audioPauseHandler() {
    const audioElement = this;
    audioElement.removeAttribute('data-playing');
    
    const telegramPlayer = audioElement.closest('.telegram-audio-custom');
    const attachmentPlayer = audioElement.closest('.attachment-audio-player');
    
    if (telegramPlayer) {
        telegramPlayer.classList.remove('playing');
    } else if (attachmentPlayer) {
        attachmentPlayer.classList.remove('playing');
    }
}

/**
 * راه‌اندازی به‌روزرسانی نوار پیشرفت تلگرام
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {HTMLElement} playerContainer - کانتینر پخش‌کننده
 */
function setupTelegramProgressUpdater(audioElement, playerContainer) {
    if (!audioElement || !playerContainer) return;
    
    // بررسی اینکه آیا قبلاً راه‌اندازی شده است
    if (playerContainer.hasAttribute('data-progress-setup')) {
        // اگر قبلاً راه‌اندازی شده، فقط رویدادها را بررسی کنیم
        const audioTrack = playerContainer.querySelector('.telegram-audio-track');
        if (audioTrack) {
            // حذف رویدادهای قبلی
            const oldClickHandlers = audioTrack._clickHandlers || [];
            oldClickHandlers.forEach(handler => {
                audioTrack.removeEventListener('click', handler);
            });
            
            // اضافه کردن رویداد جدید
            const newClickHandler = function(e) {
                handleCustomProgressBarClick(e, audioElement, playerContainer, audioTrack);
            };
            audioTrack.addEventListener('click', newClickHandler);
            audioTrack._clickHandlers = [newClickHandler];
            
            // اضافه کردن رویداد لمسی
            const newTouchHandler = function(e) {
                handleCustomProgressBarClick(e, audioElement, playerContainer, audioTrack);
            };
            audioTrack.addEventListener('touchstart', newTouchHandler, { passive: false });
            audioTrack._clickHandlers.push(newTouchHandler);
        }
        return;
    }
    
    // علامت‌گذاری به عنوان راه‌اندازی شده
    playerContainer.setAttribute('data-progress-setup', 'true');
    
    // اضافه کردن رویداد کلیک به نوار پیشرفت
    const audioTrack = playerContainer.querySelector('.telegram-audio-track');
    if (audioTrack) {
        // اضافه کردن رویداد کلیک
        const clickHandler = function(e) {
            handleCustomProgressBarClick(e, audioElement, playerContainer, audioTrack);
        };
        audioTrack.addEventListener('click', clickHandler);
        
        // اضافه کردن رویداد لمسی
        const touchHandler = function(e) {
            handleCustomProgressBarClick(e, audioElement, playerContainer, audioTrack);
        };
        audioTrack.addEventListener('touchstart', touchHandler, { passive: false });
        
        // ذخیره رویدادها برای حذف بعدی
        audioTrack._clickHandlers = [clickHandler, touchHandler];
    }
}

/**
 * راه‌اندازی به‌روزرسانی نوار پیشرفت ضمیمه
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {HTMLElement} playerContainer - کانتینر پخش‌کننده
 */
function setupAttachmentProgressUpdater(audioElement, playerContainer) {
    if (!audioElement || !playerContainer) return;
    
    // بررسی اینکه آیا قبلاً راه‌اندازی شده است
    if (playerContainer.hasAttribute('data-progress-setup')) {
        // اگر قبلاً راه‌اندازی شده، فقط رویدادها را بررسی کنیم
        const progressContainer = playerContainer.querySelector('.attachment-progress-container');
        if (progressContainer) {
            // حذف رویدادهای قبلی
            const oldClickHandlers = progressContainer._clickHandlers || [];
            oldClickHandlers.forEach(handler => {
                progressContainer.removeEventListener('click', handler);
            });
            
            // اضافه کردن رویداد جدید
            const newClickHandler = function(e) {
                handleCustomAttachmentProgressBarClick(e, audioElement, playerContainer, progressContainer);
            };
            progressContainer.addEventListener('click', newClickHandler);
            progressContainer._clickHandlers = [newClickHandler];
            
            // اضافه کردن رویداد لمسی
            const newTouchHandler = function(e) {
                handleCustomAttachmentProgressBarClick(e, audioElement, playerContainer, progressContainer);
            };
            progressContainer.addEventListener('touchstart', newTouchHandler, { passive: false });
            progressContainer._clickHandlers.push(newTouchHandler);
        }
        return;
    }
    
    // علامت‌گذاری به عنوان راه‌اندازی شده
    playerContainer.setAttribute('data-progress-setup', 'true');
    
    // اضافه کردن رویداد کلیک به نوار پیشرفت
    const progressContainer = playerContainer.querySelector('.attachment-progress-container');
    if (progressContainer) {
        // اضافه کردن رویداد کلیک
        const clickHandler = function(e) {
            handleCustomAttachmentProgressBarClick(e, audioElement, playerContainer, progressContainer);
        };
        progressContainer.addEventListener('click', clickHandler);
        
        // اضافه کردن رویداد لمسی
        const touchHandler = function(e) {
            handleCustomAttachmentProgressBarClick(e, audioElement, playerContainer, progressContainer);
        };
        progressContainer.addEventListener('touchstart', touchHandler, { passive: false });
        
        // ذخیره رویدادها برای حذف بعدی
        progressContainer._clickHandlers = [clickHandler, touchHandler];
    }
}

/**
 * به‌روزرسانی نوار پیشرفت تلگرام
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {HTMLElement} playerContainer - کانتینر پخش‌کننده
 */
function updateTelegramProgress(audioElement, playerContainer) {
    const progressBar = playerContainer.querySelector('.telegram-audio-progress-bar');
    const timeDisplay = playerContainer.querySelector('.telegram-audio-time-display');
    if (!progressBar || !timeDisplay) return;
    
    // به‌روزرسانی زمان فعلی
    const currentMinutes = Math.floor(audioElement.currentTime / 60).toString().padStart(2, '0');
    const currentSeconds = Math.floor(audioElement.currentTime % 60).toString().padStart(2, '0');
    
    // تلاش برای استفاده از مدت زمان واقعی
    if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration !== Infinity) {
        // به‌روزرسانی نوار پیشرفت
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.style.width = percent + '%';
        
        // به‌روزرسانی نمایش مدت کل
        const totalMinutes = Math.floor(audioElement.duration / 60).toString().padStart(2, '0');
        const totalSeconds = Math.floor(audioElement.duration % 60).toString().padStart(2, '0');
        
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds} / ${totalMinutes}:${totalSeconds}`;
        return;
    }
    
    // استفاده از مدت زمان ذخیره شده
    const storedDuration = parseInt(audioElement.getAttribute('data-duration-seconds') || '0');
    if (storedDuration > 0) {
        // به‌روزرسانی نوار پیشرفت
        const percent = (audioElement.currentTime / storedDuration) * 100;
        progressBar.style.width = percent + '%';
        
        // استخراج بخش زمان کل
        const totalTimePart = timeDisplay.textContent.split(' / ')[1] || '00:00';
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds} / ${totalTimePart}`;
    }
}

/**
 * به‌روزرسانی نوار پیشرفت ضمیمه
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {HTMLElement} playerContainer - کانتینر پخش‌کننده
 */
function updateAttachmentProgress(audioElement, playerContainer) {
    const progressBar = playerContainer.querySelector('.attachment-progress');
    const progressHandle = playerContainer.querySelector('.attachment-progress-handle');
    const timeDisplay = playerContainer.querySelector('.attachment-time');
    if (!progressBar || !progressHandle || !timeDisplay) return;
    
    // به‌روزرسانی زمان فعلی
    const currentMinutes = Math.floor(audioElement.currentTime / 60).toString().padStart(2, '0');
    const currentSeconds = Math.floor(audioElement.currentTime % 60).toString().padStart(2, '0');
    
    // تلاش برای استفاده از مدت زمان واقعی
    if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration !== Infinity) {
        // به‌روزرسانی نوار پیشرفت
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.style.width = percent + '%';
        progressHandle.style.left = percent + '%';
        
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds}`;
        return;
    }
    
    // استفاده از مدت زمان ذخیره شده
    const storedDuration = parseInt(audioElement.getAttribute('data-duration-seconds') || '0');
    if (storedDuration > 0) {
        // به‌روزرسانی نوار پیشرفت
        const percent = (audioElement.currentTime / storedDuration) * 100;
        progressBar.style.width = percent + '%';
        progressHandle.style.left = percent + '%';
        
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds}`;
    }
}

/**
 * مدیریت تعامل کاربر (کلیک یا لمس)
 * @param {Event} event - رویداد کاربر
 */
function handleUserInteraction(event) {
    // بررسی کلیک روی دکمه‌های پخش
    const playButton = event.target.closest('.telegram-audio-play, .attachment-play-btn');
    if (playButton) {
        const audioContainer = playButton.closest('.telegram-audio-custom, .attachment-audio-player');
        if (audioContainer) {
            const audioElement = audioContainer.querySelector('audio');
            if (audioElement) {
                fixAudioElement(audioElement);
            }
        }
        return;
    }
    
    // بررسی کلیک روی نوار پیشرفت تلگرام
    const telegramTrack = event.target.closest('.telegram-audio-track');
    if (telegramTrack) {
        const audioContainer = telegramTrack.closest('.telegram-audio-custom');
        if (audioContainer) {
            const audioElement = audioContainer.querySelector('audio');
            if (audioElement) {
                handleCustomProgressBarClick(event, audioElement, audioContainer, telegramTrack);
                event.preventDefault();
                event.stopPropagation();
            }
        }
        return;
    }
    
    // بررسی کلیک روی نوار پیشرفت ضمیمه
    const attachmentTrack = event.target.closest('.attachment-progress-container');
    if (attachmentTrack) {
        const audioContainer = attachmentTrack.closest('.attachment-audio-player');
        if (audioContainer) {
            const audioElement = audioContainer.querySelector('audio');
            if (audioElement) {
                handleCustomAttachmentProgressBarClick(event, audioElement, audioContainer, attachmentTrack);
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }
}

/**
 * اعمال موقعیت به عنصر صوتی با مدیریت خطاها و تلاش‌های مجدد
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {number} position - موقعیت نرمال‌شده (بین 0 و 1)
 * @param {number} [retryCount=0] - تعداد تلاش‌های مجدد
 */
function applyPosition(audioElement, position, retryCount = 0) {
    try {
        //("اعمال موقعیت جدید:", position, "تلاش شماره:", retryCount + 1);
        
        // ذخیره موقعیت برای استفاده بعدی
        audioElement._lastClickPosition = position;
        
        // محاسبه زمان جدید بر اساس مدت زمان
        let newTime = 0;
        let durationSource = '';
        
        // اگر مدت زمان واقعی در دسترس است
        if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration !== Infinity) {
            newTime = position * audioElement.duration;
            durationSource = 'واقعی';
        } else {
            // استفاده از مدت زمان ذخیره شده
            const storedDuration = parseInt(audioElement.getAttribute('data-duration-seconds') || '0');
            if (storedDuration > 0) {
                newTime = position * storedDuration;
                durationSource = 'ذخیره شده';
            } else {
                console.warn("هیچ مدت زمانی برای استفاده یافت نشد");
                return;
            }
        }
        
        //(`تنظیم زمان جدید (${durationSource}):`, newTime);
        
        try {
            // تلاش برای تنظیم مستقیم زمان
            audioElement.currentTime = newTime;
        } catch (innerErr) {
            console.error(`خطا در تنظیم زمان (${durationSource}):`, innerErr);
            
            // اگر به حداکثر تلاش‌های مجدد نرسیده‌ایم، دوباره تلاش می‌کنیم
            if (retryCount < 2) {
                // تلاش مجدد با تأخیر بیشتر
                setTimeout(function() {
                    applyPosition(audioElement, position, retryCount + 1);
                }, 50 * (retryCount + 1)); // افزایش تأخیر با هر تلاش
            }
        }
    } catch (err) {
        console.error("خطا در اعمال موقعیت به عنصر صوتی:", err);
    }
}

/**
 * مدیریت کلیک روی نوار پیشرفت تلگرام
 * @param {Event} e - رویداد کلیک یا لمس
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {HTMLElement} playerContainer - کانتینر پخش‌کننده
 * @param {HTMLElement} audioTrack - عنصر نوار پیشرفت
 */
function handleCustomProgressBarClick(e, audioElement, playerContainer, audioTrack) {
    try {
        // فقط برای رویدادهای لمسی از preventDefault استفاده می‌کنیم
        // این کار از اسکرول ناخواسته صفحه جلوگیری می‌کند
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        e.stopPropagation();
        
        //("کلیک روی نوار پیشرفت تلگرام");
        
        // اگر audioTrack ارسال نشده، از playerContainer آن را پیدا کنیم
        if (!audioTrack) {
            audioTrack = playerContainer.querySelector('.telegram-audio-track');
            if (!audioTrack) {
                console.error("نوار پیشرفت تلگرام یافت نشد");
                return;
            }
        }
        
        const progressBar = playerContainer.querySelector('.telegram-audio-progress-bar');
        const timeDisplay = playerContainer.querySelector('.telegram-audio-time-display');
        if (!progressBar || !timeDisplay) {
            console.error("عناصر نوار پیشرفت یا نمایش زمان یافت نشد");
            return;
        }
        
        // محاسبه موقعیت کلیک - روش جایگزین برای سازگاری بیشتر با مرورگرها
        let rect;
        try {
            rect = audioTrack.getBoundingClientRect();
        } catch (error) {
            console.error("خطا در دریافت موقعیت نوار پیشرفت:", error);
            return;
        }
        
        // محاسبه موقعیت نسبی کلیک (پشتیبانی از کلیک و لمس)
        let clientX = 0;
        if (e.type === 'touchstart' && e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        
        const trackWidth = rect.width;
        const position = (clientX - rect.left) / trackWidth;
        
        // //("موقعیت کلیک:", {
        //     clientX: clientX,
        //     rectLeft: rect.left,
        //     trackWidth: trackWidth,
        //     position: position
        // });
        
        // محدود کردن موقعیت بین 0 و 1
        const normalizedPosition = Math.max(0, Math.min(1, position));
        
        // ذخیره موقعیت در عنصر صوتی برای استفاده در رویدادهای دیگر
        audioElement._lastClickPosition = normalizedPosition;
        
        // به‌روزرسانی نوار پیشرفت
        progressBar.style.width = (normalizedPosition * 100) + '%';
        
        // تلاش برای استفاده از مدت زمان واقعی
        if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration !== Infinity) {
            //("استفاده از مدت زمان واقعی:", audioElement.duration);
            
            // به‌روزرسانی نمایش زمان
            const currentTime = Math.floor(normalizedPosition * audioElement.duration);
            const currentMinutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
            const currentSeconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
            
            const totalMinutes = Math.floor(audioElement.duration / 60).toString().padStart(2, '0');
            const totalSeconds = Math.floor(audioElement.duration % 60).toString().padStart(2, '0');
            
            timeDisplay.textContent = `${currentMinutes}:${currentSeconds} / ${totalMinutes}:${totalSeconds}`;
        } else {
            // استفاده از مدت زمان ذخیره شده
            const storedDuration = parseInt(audioElement.getAttribute('data-duration-seconds') || '0');
            if (storedDuration > 0) {
                //("استفاده از مدت زمان ذخیره شده:", storedDuration);
                
                // به‌روزرسانی نمایش زمان
                const currentTime = Math.floor(normalizedPosition * storedDuration);
                const currentMinutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
                const currentSeconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
                
                // استخراج بخش زمان کل
                const totalTimePart = timeDisplay.textContent.split(' / ')[1] || '00:00';
                timeDisplay.textContent = `${currentMinutes}:${currentSeconds} / ${totalTimePart}`;
            } else {
                // اگر مدت زمان ذخیره نشده است، از URL استخراج می‌کنیم
                const playButton = playerContainer.querySelector('.telegram-audio-play');
                if (playButton) {
                    const audioUrl = playButton.getAttribute('data-url');
                    if (audioUrl) {
                        //("تلاش برای استخراج مدت زمان از URL:", audioUrl);
                        const durationInfo = extractDurationFromFilename(audioUrl);
                        if (durationInfo.success) {
                            const totalSeconds = durationInfo.totalSeconds;
                            
                            // به‌روزرسانی نمایش زمان
                            const currentTime = Math.floor(normalizedPosition * totalSeconds);
                            const currentMinutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
                            const currentSeconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
                            
                            timeDisplay.textContent = `${currentMinutes}:${currentSeconds} / ${durationInfo.minutes}:${durationInfo.seconds}`;
                            
                            // ذخیره مدت زمان برای استفاده بعدی
                            audioElement.setAttribute('data-duration-seconds', totalSeconds);
                        }
                    }
                }
            }
        }
        
        // استفاده از تایمر کوتاه‌تر برای اعمال تغییرات زمان
        // این تأخیر کوتاه به مرورگر اجازه می‌دهد تا ابتدا رابط کاربری را به‌روز کند
        setTimeout(function() {
            applyPosition(audioElement, normalizedPosition);
        }, 10);
        
    } catch (error) {
        console.error("خطا در مدیریت کلیک روی نوار پیشرفت تلگرام:", error);
    }
}

/**
 * مدیریت کلیک روی نوار پیشرفت ضمیمه
 * @param {Event} e - رویداد کلیک یا لمس
 * @param {HTMLAudioElement} audioElement - عنصر صوتی
 * @param {HTMLElement} playerContainer - کانتینر پخش‌کننده
 * @param {HTMLElement} progressContainer - عنصر کانتینر نوار پیشرفت
 */
function handleCustomAttachmentProgressBarClick(e, audioElement, playerContainer, progressContainer) {
    try {
        // فقط برای رویدادهای لمسی از preventDefault استفاده می‌کنیم
        // این کار از اسکرول ناخواسته صفحه جلوگیری می‌کند
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        e.stopPropagation();
        
        //("کلیک روی نوار پیشرفت ضمیمه");
        
        // اگر progressContainer ارسال نشده، از playerContainer آن را پیدا کنیم
        if (!progressContainer) {
            progressContainer = playerContainer.querySelector('.attachment-progress-container');
            if (!progressContainer) {
                console.error("کانتینر نوار پیشرفت ضمیمه یافت نشد");
                return;
            }
        }
        
        const progressBar = playerContainer.querySelector('.attachment-progress');
        const progressHandle = playerContainer.querySelector('.attachment-progress-handle');
        const timeDisplay = playerContainer.querySelector('.attachment-time');
        if (!progressBar || !progressHandle || !timeDisplay) {
            console.error("عناصر نوار پیشرفت، دستگیره یا نمایش زمان یافت نشد");
            return;
        }
        
        // محاسبه موقعیت کلیک - روش جایگزین برای سازگاری بیشتر با مرورگرها
        let rect;
        try {
            rect = progressContainer.getBoundingClientRect();
        } catch (error) {
            console.error("خطا در دریافت موقعیت کانتینر نوار پیشرفت:", error);
            return;
        }
        
        // محاسبه موقعیت نسبی کلیک (پشتیبانی از کلیک و لمس)
        let clientX = 0;
        if (e.type === 'touchstart' && e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        
        const containerWidth = rect.width;
        const position = (clientX - rect.left) / containerWidth;
        
        // //("موقعیت کلیک:", {
        //     clientX: clientX,
        //     rectLeft: rect.left,
        //     containerWidth: containerWidth,
        //     position: position
        // });
        
        // محدود کردن موقعیت بین 0 و 1
        const normalizedPosition = Math.max(0, Math.min(1, position));
        
        // ذخیره موقعیت در عنصر صوتی برای استفاده در رویدادهای دیگر
        audioElement._lastClickPosition = normalizedPosition;
        
        // به‌روزرسانی نوار پیشرفت
        progressBar.style.width = (normalizedPosition * 100) + '%';
        progressHandle.style.left = (normalizedPosition * 100) + '%';
        
        // تلاش برای استفاده از مدت زمان واقعی
        if (audioElement.duration && !isNaN(audioElement.duration) && audioElement.duration !== Infinity) {
            //("استفاده از مدت زمان واقعی:", audioElement.duration);
            
            // به‌روزرسانی نمایش زمان
            const currentTime = Math.floor(normalizedPosition * audioElement.duration);
            const currentMinutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
            const currentSeconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
            
            timeDisplay.textContent = `${currentMinutes}:${currentSeconds}`;
        } else {
            // استفاده از مدت زمان ذخیره شده
            const storedDuration = parseInt(audioElement.getAttribute('data-duration-seconds') || '0');
            if (storedDuration > 0) {
                //("استفاده از مدت زمان ذخیره شده:", storedDuration);
                
                // به‌روزرسانی نمایش زمان
                const currentTime = Math.floor(normalizedPosition * storedDuration);
                const currentMinutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
                const currentSeconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
                
                timeDisplay.textContent = `${currentMinutes}:${currentSeconds}`;
            } else {
                // اگر مدت زمان ذخیره نشده است، از URL استخراج می‌کنیم
                const playButton = playerContainer.querySelector('.attachment-play-btn');
                if (playButton) {
                    const audioUrl = playButton.getAttribute('data-url');
                    if (audioUrl) {
                        //("تلاش برای استخراج مدت زمان از URL:", audioUrl);
                        const durationInfo = extractDurationFromFilename(audioUrl);
                        if (durationInfo.success) {
                            const totalSeconds = durationInfo.totalSeconds;
                            
                            // به‌روزرسانی نمایش زمان
                            const currentTime = Math.floor(normalizedPosition * totalSeconds);
                            const currentMinutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
                            const currentSeconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
                            
                            timeDisplay.textContent = `${currentMinutes}:${currentSeconds}`;
                            
                            // ذخیره مدت زمان برای استفاده بعدی
                            audioElement.setAttribute('data-duration-seconds', totalSeconds);
                        }
                    }
                }
            }
        }
        
        // استفاده از تایمر کوتاه‌تر برای اعمال تغییرات زمان
        // این تأخیر کوتاه به مرورگر اجازه می‌دهد تا ابتدا رابط کاربری را به‌روز کند
        setTimeout(function() {
            applyPosition(audioElement, normalizedPosition);
        }, 10);
        
    } catch (error) {
        console.error("خطا در مدیریت کلیک روی نوار پیشرفت ضمیمه:", error);
    }
}

/**
 * استخراج مدت زمان از نام فایل
 * @param {string} url - URL فایل صوتی
 * @returns {Object} - اطلاعات مدت زمان
 */
function extractDurationFromFilename(url) {
    const result = {
        success: false,
        minutes: '00',
        seconds: '00',
        totalSeconds: 0
    };
    
    try {
        const fileName = url.split('/').pop();
        if (!fileName || !fileName.includes('voice_message_') || !fileName.includes('_')) {
            return result;
        }
        
        const parts = fileName.split('_');
        if (parts.length < 4) {
            return result;
        }
        
        const durationPart = parts[parts.length - 1].split('.')[0]; // مثلا "00m04s"
        const minuteMatch = durationPart.match(/(\d+)m/);
        const secondMatch = durationPart.match(/(\d+)s/);
        
        if (!minuteMatch || !secondMatch) {
            return result;
        }
        
        const minutes = minuteMatch[1].padStart(2, '0');
        const seconds = secondMatch[1].padStart(2, '0');
        const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
        
        return {
            success: true,
            minutes: minutes,
            seconds: seconds,
            totalSeconds: totalSeconds
        };
    } catch (error) {
        console.error("Error extracting duration from filename:", error);
        return result;
    }
}
