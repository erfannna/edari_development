/**
 * ضبط کننده صدا برای چت تلگرام
 * این فایل برای اضافه کردن قابلیت ضبط صدا به چت تلگرام استفاده می‌شود
 * بازنویسی شده بر اساس ساختار voice-recorder-container در MessageCreate.html
 */

document.addEventListener('DOMContentLoaded', function() {
    //('فایل telegram-voice-recorder.js با موفقیت بارگذاری شد');
    
    // متغیرهای جهانی
    let mediaRecorder;
    let audioChunks = [];
    let audioBlob = null;
    let recordingStartTime;
    let timerInterval;
    let isPaused = false;
    let elapsedTimeBeforePause = 0;
    let recordingStream = null;
    
    // یافتن دکمه میکروفون و اضافه کردن رویداد
    function setupVoiceButton() {
        // جستجو برای دکمه میکروفون با روش‌های مختلف
        const microphoneSelectors = [
            '.telegram-option-btn[title="ارسال پیام صوتی"]',
            '.telegram-option-btn i.fa-microphone',
            'button.telegram-option-btn:has(i.fa-microphone)'
        ];
        
        // افزودن کلاس خاص به همه دکمه‌های میکروفون برای شناسایی راحت‌تر
        let foundMicButtons = false;
        
        microphoneSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // پیدا کردن دکمه (ممکن است خود المان یا والد آن باشد)
                    const button = el.classList.contains('telegram-option-btn') ? el : el.closest('.telegram-option-btn');
                    
                    if (button && !button.classList.contains('voice-recorder-btn')) {
                        button.classList.add('voice-recorder-btn');
                        
                        // اضافه کردن رویداد کلیک
                        if (!button.hasAttribute('data-voice-handler')) {
                            button.setAttribute('data-voice-handler', 'true');
                            button.addEventListener('click', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                showVoiceRecorder();
                            });
                            foundMicButtons = true;
                            //('دکمه میکروفون پیدا و رویداد کلیک اضافه شد');
                        }
                    }
                });
            } catch (error) {
                //('خطا در سلکتور:', selector, error);
            }
        });
        
        // جستجوی دستی برای آیکون‌های میکروفون
        if (!foundMicButtons) {
            const allMicIcons = document.querySelectorAll('.fa-microphone');
            allMicIcons.forEach(icon => {
                const button = icon.closest('button');
                if (button && !button.classList.contains('voice-recorder-btn')) {
                    button.classList.add('voice-recorder-btn');
                    
                    if (!button.hasAttribute('data-voice-handler')) {
                        button.setAttribute('data-voice-handler', 'true');
                        button.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            showVoiceRecorder();
                        });
                        foundMicButtons = true;
                        //('دکمه میکروفون با جستجوی آیکون پیدا شد');
                    }
                }
            });
        }
        
        // رویداد کلیک دقیق فقط برای دکمه‌های میکروفون
        document.addEventListener('click', function(e) {
            // جستجو برای میکروفون از المان کلیک شده تا 3 والد بالاتر
            let target = e.target;
            let isMicButton = false;
            
            // بررسی خود المان
            if (target.classList && target.classList.contains('voice-recorder-btn')) {
                isMicButton = true;
            } else if (target.classList && target.classList.contains('fa-microphone')) {
                // بررسی اگر آیکون میکروفون است
                const button = target.closest('.telegram-option-btn, .voice-recorder-btn');
                if (button) {
                    isMicButton = true;
                    target = button; // تنظیم هدف به دکمه
                }
            } else {
                // بررسی والدین محدود
                for (let i = 0; i < 2 && target.parentElement; i++) {
                    target = target.parentElement;
                    if (target.classList && (
                        target.classList.contains('voice-recorder-btn') || 
                        (target.classList.contains('telegram-option-btn') && 
                         target.querySelector('.fa-microphone'))
                    )) {
                        isMicButton = true;
                        break;
                    }
                }
            }
            
            // فقط اگر دقیقاً روی دکمه میکروفون کلیک شده است
            if (isMicButton) {
                // اضافه کردن کلاس برای شناسایی آینده
                if (!target.classList.contains('voice-recorder-btn')) {
                    target.classList.add('voice-recorder-btn');
                }
                
                if (!target.hasAttribute('data-voice-handler')) {
                    target.setAttribute('data-voice-handler', 'true');
                    e.preventDefault();
                    e.stopPropagation();
                    //('دکمه میکروفون جدید کلیک شد');
                    showVoiceRecorder();
                }
            }
        });
        
        // استفاده از MutationObserver برای تشخیص دکمه‌های جدید
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    setTimeout(() => {
                        // جستجوی دکمه‌های میکروفون جدید
                        microphoneSelectors.forEach(selector => {
                            try {
                                const elements = document.querySelectorAll(selector);
                                elements.forEach(el => {
                                    const button = el.classList.contains('telegram-option-btn') ? el : el.closest('.telegram-option-btn');
                                    
                                    if (button && !button.classList.contains('voice-recorder-btn')) {
                                        button.classList.add('voice-recorder-btn');
                                        
                                        if (!button.hasAttribute('data-voice-handler')) {
                                            button.setAttribute('data-voice-handler', 'true');
                                            button.addEventListener('click', function(e) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                showVoiceRecorder();
                                            });
                                            //('دکمه میکروفون جدید در DOM پیدا شد');
                                        }
                                    }
                                });
                            } catch (error) {
                                //('خطا در بررسی دکمه‌های جدید:', error);
                            }
                        });
                    }, 100);
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // ایجاد پنل ضبط صدا مطابق با ساختار voice-recorder-container
    function createVoiceRecorderPanel() {
        // بررسی وجود پنل قبلی
        let voiceRecorder = document.getElementById('telegramVoiceRecorder');
        if (voiceRecorder) {
            return voiceRecorder;
        }
        
        //('ایجاد پنل ضبط صدا جدید');
        voiceRecorder = document.createElement('div');
        voiceRecorder.id = 'telegramVoiceRecorder';
        voiceRecorder.className = 'voice-recorder-container';
        
        // ساختار HTML مطابق با تصویر ارسال شده
        voiceRecorder.innerHTML = `
            <div class="recorder-controls">
                <button type="button" class="recorder-btn cancel" id="telegram-cancel-record" title="قطع">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="recorder-timer-container">
                    <span class="recording-indicator" style="display: none;"></span>
                    <span id="telegram-recorder-timer">00:00</span>
                    <button type="button" class="recorder-btn pause" id="telegram-pause-record" title="مکث" style="display: none;">
                        <i class="fa-solid fa-pause"></i>
                    </button>
                </div>
                <button type="button" class="recorder-btn record" id="telegram-start-record" title="شروع ضبط">
                    <i class="fa-solid fa-microphone"></i>
                </button>
            </div>
            
            <!-- پخش کننده سفارشی صدا -->
            <div class="audio-player" id="audio-player" style="display: none; margin-top: 15px;">
                <div class="audio-player-controls">
                    <div class="speed-control">
                        <button type="button" class="speed-btn" id="speed-btn" title="تغییر سرعت پخش">
                            <span>1x</span>
                        </button>
                        <div class="speed-options" id="speed-options">
                            <button class="speed-option" data-speed="0.5">0.5x</button>
                            <button class="speed-option" data-speed="0.75">0.75x</button>
                            <button class="speed-option" data-speed="1.0">1x</button>
                            <button class="speed-option" data-speed="1.25">1.25x</button>
                            <button class="speed-option" data-speed="1.5">1.5x</button>
                            <button class="speed-option" data-speed="2.0">2x</button>
                        </div>
                    </div>
                    <span class="audio-time" id="audio-time">00:00/00:08</span>
                    <div class="audio-progress-container" id="audio-progress-container">
                        <div class="audio-progress" id="audio-progress"></div>
                        <div class="audio-progress-handle" id="audio-progress-handle"></div>
                    </div>
                    <button type="button" class="audio-player-btn" id="play-btn">
                        <i class="fa-solid fa-play"></i>
                    </button>
                </div>
            </div>
            <!-- عنصر صوتی مخفی برای پخش -->
            <audio id="audio-preview" style="display: none;"></audio>
        `;
        
        // استایل‌های کلی پنل
        voiceRecorder.style.display = 'none';
        voiceRecorder.style.position = 'relative';
        voiceRecorder.style.backgroundColor = '#1E222D';
        voiceRecorder.style.padding = '10px 15px';
        voiceRecorder.style.borderRadius = '10px';
        voiceRecorder.style.marginBottom = '5px';
        voiceRecorder.style.zIndex = '1000';
        
        // استایل کنترل‌ها
        const recorderControls = voiceRecorder.querySelector('.recorder-controls');
        recorderControls.style.display = 'flex';
        recorderControls.style.justifyContent = 'space-between';
        recorderControls.style.alignItems = 'center';
        recorderControls.style.width = '100%';
        
        // استایل تایمر
        const timerContainer = voiceRecorder.querySelector('.recorder-timer-container');
        timerContainer.style.display = 'flex';
        timerContainer.style.alignItems = 'center';
        timerContainer.style.justifyContent = 'center';
        
        const timerElement = voiceRecorder.querySelector('#telegram-recorder-timer');
        timerElement.style.color = 'white';
        timerElement.style.fontSize = '16px';
        timerElement.style.fontWeight = 'bold';
        timerElement.style.margin = '0 15px'; // اضافه کردن فاصله از دو طرف زمان‌سنج
        
        // استایل نشانگر ضبط
        const recordingIndicator = voiceRecorder.querySelector('.recording-indicator');
        recordingIndicator.style.display = 'none';
        recordingIndicator.style.width = '10px';
        recordingIndicator.style.height = '10px';
        recordingIndicator.style.backgroundColor = '#F44336';
        recordingIndicator.style.borderRadius = '50%';
        recordingIndicator.style.marginRight = '15px'; // افزایش فاصله از زمان‌سنج
        recordingIndicator.style.animation = 'blink 1.5s infinite';
        
        // استایل دکمه مکث
        const pauseButton = voiceRecorder.querySelector('#telegram-pause-record');
        pauseButton.style.width = '24px';
        pauseButton.style.height = '24px';
        pauseButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        pauseButton.style.borderRadius = '50%';
        pauseButton.style.border = 'none';
        pauseButton.style.color = 'white';
        pauseButton.style.fontSize = '12px';
        pauseButton.style.cursor = 'pointer';
        pauseButton.style.marginLeft = '15px'; // افزایش فاصله از زمان‌سنج
        pauseButton.style.display = 'none';
        pauseButton.style.alignItems = 'center';
        pauseButton.style.justifyContent = 'center';
        
        // استایل دکمه ضبط (سمت راست)
        const recordButton = voiceRecorder.querySelector('#telegram-start-record');
        recordButton.style.width = '40px';
        recordButton.style.height = '40px';
        recordButton.style.backgroundColor = '#F44336';
        recordButton.style.borderRadius = '50%';
        recordButton.style.border = 'none';
        recordButton.style.color = 'white';
        recordButton.style.fontSize = '16px';
        recordButton.style.cursor = 'pointer';
        recordButton.style.display = 'flex';
        recordButton.style.alignItems = 'center';
        recordButton.style.justifyContent = 'center';
        recordButton.style.animation = 'none'; // عدم چشمک زدن در حالت عادی
        
        // استایل دکمه قطع (سمت چپ)
        const cancelButton = voiceRecorder.querySelector('#telegram-cancel-record');
        cancelButton.style.width = '40px';
        cancelButton.style.height = '40px';
        cancelButton.style.backgroundColor = '#44454F';
        cancelButton.style.borderRadius = '50%';
        cancelButton.style.border = 'none';
        cancelButton.style.color = 'white';
        cancelButton.style.fontSize = '16px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.display = 'flex';
        cancelButton.style.alignItems = 'center';
        cancelButton.style.justifyContent = 'center';
        
        // استایل پخش‌کننده صدا
        const audioPlayer = voiceRecorder.querySelector('#audio-player');
        if (audioPlayer) {
            audioPlayer.style.marginTop = '15px';
            audioPlayer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            audioPlayer.style.borderRadius = '10px';
            audioPlayer.style.padding = '10px';
            audioPlayer.style.direction = 'ltr'; // تنظیم direction به ltr برای پخش‌کننده
            
            // استایل کنترل‌های پخش‌کننده
            const audioPlayerControls = audioPlayer.querySelector('.audio-player-controls');
            audioPlayerControls.style.display = 'flex';
            audioPlayerControls.style.alignItems = 'center';
            audioPlayerControls.style.justifyContent = 'space-between';
            audioPlayerControls.style.gap = '10px';
            audioPlayerControls.style.flexDirection = 'row-reverse'; // برعکس کردن چیدمان برای RTL
            
            // استایل دکمه پخش
            const playBtn = audioPlayer.querySelector('#play-btn');
            playBtn.style.width = '35px';
            playBtn.style.height = '35px';
            playBtn.style.backgroundColor = 'white';
            playBtn.style.color = '#1E222D';
            playBtn.style.borderRadius = '50%';
            playBtn.style.border = 'none';
            playBtn.style.display = 'flex';
            playBtn.style.alignItems = 'center';
            playBtn.style.justifyContent = 'center';
            playBtn.style.cursor = 'pointer';
            playBtn.style.order = '4'; // ترتیب عناصر در فلکس برای RTL
            
            // استایل نوار پیشرفت
            const progressContainer = audioPlayer.querySelector('#audio-progress-container');
            progressContainer.style.flexGrow = '1';
            progressContainer.style.height = '6px';
            progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            progressContainer.style.borderRadius = '3px';
            progressContainer.style.position = 'relative';
            progressContainer.style.cursor = 'pointer';
            progressContainer.style.order = '2'; // ترتیب عناصر در فلکس برای RTL
            
            const progress = audioPlayer.querySelector('#audio-progress');
            progress.style.height = '100%';
            progress.style.width = '0%';
            progress.style.backgroundColor = 'white';
            progress.style.borderRadius = '3px';
            progress.style.transition = 'width 0.1s linear';
            
            const handle = audioPlayer.querySelector('#audio-progress-handle');
            handle.style.position = 'absolute';
            handle.style.width = '12px';
            handle.style.height = '12px';
            handle.style.backgroundColor = 'white';
            handle.style.borderRadius = '50%';
            handle.style.top = '50%';
            handle.style.transform = 'translate(-50%, -50%)';
            handle.style.left = '0%';
            handle.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
            
            // استایل زمان
            const audioTime = audioPlayer.querySelector('#audio-time');
            audioTime.style.fontSize = '12px';
            audioTime.style.color = 'white';
            audioTime.style.whiteSpace = 'nowrap';
            audioTime.style.minWidth = '70px'; // افزایش عرض برای نمایش زمان کامل
            audioTime.style.textAlign = 'center';
            audioTime.style.order = '3'; // ترتیب عناصر در فلکس برای RTL
            
            // استایل کنترل سرعت
            const speedControl = audioPlayer.querySelector('.speed-control');
            speedControl.style.position = 'relative';
            speedControl.style.order = '1'; // ترتیب عناصر در فلکس برای RTL
            
            const speedBtn = audioPlayer.querySelector('#speed-btn');
            speedBtn.style.border = 'none';
            speedBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            speedBtn.style.color = 'white';
            speedBtn.style.padding = '4px 8px';
            speedBtn.style.borderRadius = '12px';
            speedBtn.style.fontSize = '12px';
            speedBtn.style.cursor = 'pointer';
            
            const speedOptions = audioPlayer.querySelector('#speed-options');
            speedOptions.style.position = 'absolute';
            speedOptions.style.bottom = '100%';
            speedOptions.style.right = '0';
            speedOptions.style.backgroundColor = '#2C303A';
            speedOptions.style.borderRadius = '8px';
            speedOptions.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
            speedOptions.style.padding = '5px';
            speedOptions.style.display = 'none';
            speedOptions.style.flexDirection = 'column';
            speedOptions.style.zIndex = '10';
            speedOptions.style.width = '80px';
            speedOptions.style.marginBottom = '5px';
            
            // استایل گزینه‌های سرعت
            speedOptions.querySelectorAll('.speed-option').forEach(option => {
                option.style.padding = '5px 10px';
                option.style.border = 'none';
                option.style.backgroundColor = 'transparent';
                option.style.textAlign = 'center';
                option.style.cursor = 'pointer';
                option.style.fontSize = '12px';
                option.style.color = 'white';
                option.style.borderRadius = '4px';
                option.style.transition = 'all 0.2s';
            });
        }
        
        // اضافه کردن رویدادها
        recordButton.addEventListener('click', toggleRecording);
        cancelButton.addEventListener('click', cancelRecording);
        pauseButton.addEventListener('click', pauseRecording);
        
        return voiceRecorder;
    }
    
    // نمایش رکوردر صوتی و مخفی کردن ورودی متن
    window.showVoiceRecorder = function() {
        //('نمایش پنل ضبط صدا');
        
        // مخفی کردن پنل‌های دیگر
        const emojiPanel = document.getElementById('emojiPanel');
        const schedulePanel = document.getElementById('schedulePanel');
        if (emojiPanel) emojiPanel.style.display = 'none';
        if (schedulePanel) schedulePanel.style.display = 'none';
        
        // یافتن کانتینر چت برای افزودن پنل ضبط صدا
        const chatContainer = document.querySelector('.telegram-chat-container');
        const inputContainer = document.querySelector('.telegram-input-container');
        
        if (!chatContainer && !inputContainer) {
            console.error('کانتینر چت یا ورودی یافت نشد');
            return;
        }
        
        // ایجاد پنل ضبط صدا
        const voiceRecorder = createVoiceRecorderPanel();
        
        // افزودن پنل به کانتینر مناسب
        const parentContainer = inputContainer ? inputContainer.parentNode : chatContainer;
        
        // حذف نمونه قبلی اگر وجود داشته باشد
        const existingRecorder = document.getElementById('telegramVoiceRecorder');
        if (existingRecorder && existingRecorder.parentNode) {
            existingRecorder.parentNode.removeChild(existingRecorder);
        }
        
        // اضافه کردن پنل قبل از کانتینر ورودی
        if (inputContainer) {
            parentContainer.insertBefore(voiceRecorder, inputContainer);
        } else {
            parentContainer.appendChild(voiceRecorder);
        }
        
        // نمایش پنل ضبط صدا
        voiceRecorder.style.display = 'block';
        
        // مخفی کردن کامل کانتینر ورودی - روش بهبود یافته
        if (inputContainer) {
            // اضافه کردن کلاس مخفی کننده
            inputContainer.classList.add('hidden-input-container');
            
            // روش‌های مستقیم مخفی‌سازی
            inputContainer.style.display = 'none';
            inputContainer.style.visibility = 'hidden';
            inputContainer.style.opacity = '0';
            inputContainer.style.height = '0';
            inputContainer.style.overflow = 'hidden';
            inputContainer.style.position = 'absolute';
            inputContainer.style.pointerEvents = 'none';
            inputContainer.style.clip = 'rect(0 0 0 0)';
            inputContainer.style.margin = '-1px';
            inputContainer.style.padding = '0';
            inputContainer.style.border = '0';
            
            // غیرفعال کردن همه المان‌های ورودی داخل کانتینر
            const inputElements = inputContainer.querySelectorAll('input, textarea, button, select');
            inputElements.forEach(element => {
                element.disabled = true;
                element.setAttribute('tabindex', '-1');
                element.setAttribute('aria-hidden', 'true');
            });
            
            // ذخیره کردن اشاره به input در متغیر عمومی
            window.hiddenInputContainer = inputContainer;
        }
        
        // ریست کردن وضعیت ضبط
        resetRecordingState();
    };
    
    // بازگرداندن حالت input در تابع hideVoiceRecorder
    window.hideVoiceRecorder = function() {
        //('مخفی کردن پنل ضبط صدا');
        
        const voiceRecorder = document.getElementById('telegramVoiceRecorder');
        if (voiceRecorder) {
            voiceRecorder.style.display = 'none';
            
            // حذف پنل از DOM برای جلوگیری از تداخل با سایر المان‌ها
            if (voiceRecorder.parentNode) {
                voiceRecorder.parentNode.removeChild(voiceRecorder);
            }
        }
        
        // بازگرداندن حالت کانتینر ورودی
        const inputContainer = window.hiddenInputContainer || document.querySelector('.telegram-input-container');
        if (inputContainer) {
            // حذف کلاس مخفی کننده
            inputContainer.classList.remove('hidden-input-container');
            
            // بازگرداندن استایل‌ها
            inputContainer.style.display = 'flex';
            inputContainer.style.visibility = 'visible';
            inputContainer.style.opacity = '1';
            inputContainer.style.height = 'auto';
            inputContainer.style.overflow = 'visible';
            inputContainer.style.position = 'relative';
            inputContainer.style.pointerEvents = 'auto';
            inputContainer.style.clip = 'auto';
            inputContainer.style.margin = '';
            inputContainer.style.padding = '';
            inputContainer.style.border = '';
            
            // فعال‌سازی مجدد همه المان‌های ورودی
            const inputElements = inputContainer.querySelectorAll('input, textarea, button, select');
            inputElements.forEach(element => {
                element.disabled = false;
                element.removeAttribute('tabindex');
                element.removeAttribute('aria-hidden');
            });
            
            // پاک کردن متغیر عمومی
            window.hiddenInputContainer = null;
        }
        
        // توقف ضبط اگر در حال انجام است
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            stopRecording();
        }
    };
    
    // تغییر وضعیت بین شروع و توقف ضبط
    function toggleRecording() {
        const recordButton = document.getElementById('telegram-start-record');
        const pauseButton = document.getElementById('telegram-pause-record');
        
        if (!recordButton) return;
        
        if (recordButton.classList.contains('recording')) {
            // در حال ضبط هستیم، پس توقف ضبط
            stopRecording();
            recordButton.classList.remove('recording');
            recordButton.style.backgroundColor = '#4CAF50'; // سبز برای ارسال
            recordButton.querySelector('i').className = 'fa-solid fa-paper-plane';
            recordButton.title = 'ارسال';
            
            // مخفی کردن دکمه مکث
            if (pauseButton) {
                pauseButton.style.display = 'none';
            }
        } else if (recordButton.querySelector('i').className.includes('paper-plane')) {
            // دکمه ارسال است، پس ارسال صدا
            sendRecordedAudio();
        } else {
            // شروع ضبط جدید
            startRecording();
            recordButton.classList.add('recording');
            recordButton.style.backgroundColor = '#F44336'; // قرمز برای ضبط
            recordButton.querySelector('i').className = 'fa-solid fa-stop'; // تغییر آیکون به توقف
            recordButton.title = 'توقف ضبط';
            
            // نمایش دکمه مکث بعد از شروع ضبط
            if (pauseButton) {
                pauseButton.style.display = 'flex';
            }
        }
    }
    
    // شروع ضبط صدا
    function startRecording() {
        //('شروع ضبط صدا');
        
        // پاکسازی متغیرها
        audioChunks = [];
        elapsedTimeBeforePause = 0;
        isPaused = false;
        
        // نمایش نشانگر ضبط (نقطه قرمز) در کنار تایمر
        const recordingIndicator = document.querySelector('.recording-indicator');
        if (recordingIndicator) {
            recordingIndicator.style.display = 'inline-block';
            recordingIndicator.style.animation = 'blink 1.5s infinite';
        }
        
        // درخواست دسترسی به میکروفون
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                recordingStream = stream;
                
                // ایجاد media recorder
                mediaRecorder = new MediaRecorder(stream);
                
                // اضافه کردن داده‌های صوتی
                mediaRecorder.addEventListener('dataavailable', function(e) {
                    if (e.data.size > 0) {
                        audioChunks.push(e.data);
                    }
                });
                
                // رویداد توقف ضبط
                mediaRecorder.addEventListener('stop', function() {
                    // بستن جریان صوتی
                    if (recordingStream) {
                        recordingStream.getTracks().forEach(track => track.stop());
                        recordingStream = null;
                    }
                    
                    // ایجاد فایل صوتی
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    
                    //('ضبط صدا با موفقیت به پایان رسید');
                    
                    // نمایش پیش‌نمایش صدا
                    setupAudioPreview();
                });
                
                // شروع ضبط
                mediaRecorder.start();
                recordingStartTime = new Date();
                timerInterval = setInterval(updateTimer, 1000);
                
                // نمایش دکمه مکث
                const pauseButton = document.getElementById('telegram-pause-record');
                if (pauseButton) {
                    pauseButton.style.display = 'flex';
                }
                
                // اضافه کردن انیمیشن چشمک زدن به دکمه ضبط
                const recordButton = document.getElementById('telegram-start-record');
                if (recordButton) {
                    recordButton.style.animation = 'blink 1.5s infinite';
                }
            })
            .catch(error => {
                console.error('خطا در دسترسی به میکروفون:', error);
                alert('خطا در دسترسی به میکروفون. لطفاً مطمئن شوید که اجازه دسترسی به میکروفون داده‌اید.');
                hideVoiceRecorder();
            });
    }
    
    // توقف ضبط صدا
    function stopRecording() {
        //('توقف ضبط صدا');
        
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            // محاسبه مدت زمان کل ضبط قبل از توقف
            if (!isPaused) {
                const now = new Date();
                elapsedTimeBeforePause += (now - recordingStartTime);
            }
            
            mediaRecorder.stop();
            clearInterval(timerInterval);
            
            // مخفی کردن دکمه مکث
            const pauseButton = document.getElementById('telegram-pause-record');
            if (pauseButton) {
                pauseButton.style.display = 'none';
            }
            
            // مخفی کردن نشانگر ضبط
            const recordingIndicator = document.querySelector('.recording-indicator');
            if (recordingIndicator) {
                recordingIndicator.style.display = 'none';
            }
            
            // توقف انیمیشن چشمک زدن دکمه ضبط
            const recordButton = document.getElementById('telegram-start-record');
            if (recordButton) {
                recordButton.style.animation = 'none';
            }
        }
    }
    
    // لغو ضبط صدا
    function cancelRecording() {
        //('لغو ضبط صدا');
        
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            clearInterval(timerInterval);
        }
        
        hideVoiceRecorder();
    }
    
    // مکث/ادامه ضبط صدا
    function pauseRecording() {
        const pauseButton = document.getElementById('telegram-pause-record');
        
        if (!mediaRecorder) return;
        
        if (mediaRecorder.state === 'recording') {
            // مکث ضبط
            mediaRecorder.pause();
            isPaused = true;
            elapsedTimeBeforePause += (new Date() - recordingStartTime);
            
            // تغییر ظاهر دکمه به حالت ادامه
            if (pauseButton) {
                pauseButton.title = 'ادامه';
                pauseButton.querySelector('i').className = 'fa-solid fa-play';
            }
            
            // توقف چشمک زدن نشانگر ضبط
            const recordingIndicator = document.querySelector('.recording-indicator');
            if (recordingIndicator) {
                recordingIndicator.style.animation = 'none';
                recordingIndicator.style.opacity = '0.5';
            }
            
            // توقف چشمک زدن دکمه ضبط
            const recordButton = document.getElementById('telegram-start-record');
            if (recordButton) {
                recordButton.style.animation = 'none';
            }
        } else if (mediaRecorder.state === 'paused') {
            // ادامه ضبط
            mediaRecorder.resume();
            isPaused = false;
            recordingStartTime = new Date();
            
            // تغییر ظاهر دکمه به حالت مکث
            if (pauseButton) {
                pauseButton.title = 'مکث';
                pauseButton.querySelector('i').className = 'fa-solid fa-pause';
            }
            
            // شروع مجدد چشمک زدن نشانگر ضبط
            const recordingIndicator = document.querySelector('.recording-indicator');
            if (recordingIndicator) {
                recordingIndicator.style.animation = 'blink 1.5s infinite';
                recordingIndicator.style.opacity = '1';
            }
            
            // شروع مجدد چشمک زدن دکمه ضبط
            const recordButton = document.getElementById('telegram-start-record');
            if (recordButton) {
                recordButton.style.animation = 'blink 1.5s infinite';
            }
        }
    }
    
    // به‌روزرسانی تایمر
    function updateTimer() {
        const timerElement = document.getElementById('telegram-recorder-timer');
        if (!timerElement) return;
        
        const now = new Date();
        let elapsedTime;
        
        if (isPaused) {
            elapsedTime = elapsedTimeBeforePause;
        } else {
            elapsedTime = elapsedTimeBeforePause + (now - recordingStartTime);
        }
        
        const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedTime / 1000 / 60) % 60).toString().padStart(2, '0');
        
        // حفظ نشانگر ضبط
        if (timerElement.querySelector('.recording-indicator')) {
            const indicator = timerElement.querySelector('.recording-indicator');
            timerElement.innerHTML = '';
            timerElement.appendChild(indicator);
            timerElement.insertAdjacentHTML('beforeend', `${minutes}:${seconds}`);
        } else {
            timerElement.textContent = `${minutes}:${seconds}`;
        }
    }
    
    // ریست کردن وضعیت ضبط
    function resetRecordingState() {
        const recordButton = document.getElementById('telegram-start-record');
        const timerElement = document.getElementById('telegram-recorder-timer');
        const recordingIndicator = document.querySelector('.recording-indicator');
        
        if (recordButton) {
            recordButton.classList.remove('recording');
            recordButton.style.backgroundColor = '#F44336';
            recordButton.querySelector('i').className = 'fa-solid fa-microphone'; // بازگشت به آیکون میکروفون
            recordButton.title = 'شروع ضبط';
            recordButton.style.animation = 'none';
        }
        
        if (timerElement) {
            timerElement.innerHTML = '00:00';
        }
        
        // مخفی کردن نشانگر ضبط در حالت اولیه
        if (recordingIndicator) {
            recordingIndicator.style.display = 'none';
        }
        
        // پاکسازی متغیرها
        audioChunks = [];
        audioBlob = null;
        elapsedTimeBeforePause = 0;
        isPaused = false;
        
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    // ارسال صدای ضبط شده
    function sendRecordedAudio() {
        if (!audioBlob) {
            console.error("هیچ فایل صوتی برای ارسال وجود ندارد");
            return;
        }

        // محاسبه مدت زمان فایل صوتی
        let totalDurationMs = elapsedTimeBeforePause;
        const totalDurationSec = Math.floor(totalDurationMs / 1000);
        const durationMin = Math.floor(totalDurationSec / 60).toString().padStart(2, '0');
        const durationSec = Math.floor(totalDurationSec % 60).toString().padStart(2, '0');
        const durationStr = `${durationMin}m${durationSec}s`;

        // ایجاد نام فایل با فرمت voice_message_YYYYMMDD_HHMM_MMmSSs.wav
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const fileName = `voice_message_${year}${month}${day}_${hours}${minutes}_${durationStr}.wav`;
        
        //(`ارسال فایل صوتی با نام ${fileName} و مدت زمان ${durationStr}`);
        
        // ایجاد فایل از Blob
        const audioFile = new File([audioBlob], fileName, {
            type: 'audio/wav',
            lastModified: Date.now()
        });
        
        // ذخیره فایل صوتی در متغیر جهانی
        window.recordedAudio = audioFile;
        
        // ذخیره مدت زمان فایل صوتی برای استفاده در سایر بخش‌ها
        window.recordedAudioDuration = totalDurationSec;
        
        // لاگ کردن اطلاعات برای دیباگ
        // //('اطلاعات فایل صوتی:', {
        //     fileName: fileName,
        //     duration: durationStr,
        //     totalDurationSec: totalDurationSec,
        //     size: (audioBlob.size / 1024).toFixed(2) + ' KB'
        // });
        
        // اطمینان از اینکه مدت زمان در متغیر جهانی ذخیره شده است
        if (window.recordedAudioDuration) {
            //(`مدت زمان صوتی با موفقیت ذخیره شد: ${window.recordedAudioDuration} ثانیه`);
        } else {
            console.error('خطا در ذخیره مدت زمان صوتی');
        }
        
        // نمایش تقویم انتخاب تاریخ
        showDatePicker();
    }
    
    // نمایش تقویم انتخاب تاریخ
    function showDatePicker() {
        // بررسی وجود کانتینر چت تلگرام
        const telegramChatContainer = document.querySelector('.telegram-chat-container');
        
        if (telegramChatContainer) {
            //("در صفحه تلگرام چت هستیم، نمایش پنل زمانبندی...");
            
            // مخفی کردن پنل ضبط صدا
            hideVoiceRecorder();
            
            // نمایش پنل زمانبندی
            if (typeof window.showSchedulePanel === 'function') {
                window.showSchedulePanel(false, 'voice');
                //("تابع showSchedulePanel فراخوانی شد با نوع محتوای voice");
                
                // اطمینان از نمایش پنل زمانبندی
                const schedulePanel = document.getElementById('schedulePanel');
                if (schedulePanel) {
                    schedulePanel.style.display = 'flex';
                    schedulePanel.style.position = 'absolute';
                    schedulePanel.style.bottom = '60px';
                    schedulePanel.style.left = '0';
                    schedulePanel.style.right = '0';
                    schedulePanel.style.zIndex = '999999';
                    
                    // اطمینان از اینکه تقویم باز می‌شود
                    setTimeout(() => {
                        const scheduledTimeInput = document.getElementById('scheduledTimeInput');
                        if (scheduledTimeInput && typeof jalaliDatepicker !== 'undefined') {
                            jalaliDatepicker.show(scheduledTimeInput);
                            //("تقویم شمسی نمایش داده شد");
                        }
                    }, 300);
                } else {
                    console.error("المان schedulePanel یافت نشد");
                }
            } else {
                console.error("تابع showSchedulePanel تعریف نشده است");
                alert("خطا در نمایش پنل زمانبندی. لطفاً صفحه را بارگذاری مجدد کنید.");
            }
        } else {
            //("در صفحه MessageCreate.html هستیم، افزودن فایل به فرم...");
            
            // اگر در صفحه MessageCreate.html هستیم
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                // استفاده از DataTransfer برای تنظیم فایل در input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(window.recordedAudio);
                fileInput.files = dataTransfer.files;
                
                // فعال‌سازی رویداد change برای input
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
                
                //("فایل صوتی به input اضافه شد");
                
                // مخفی کردن پنل ضبط صدا
                hideVoiceRecorder();
                
                // نمایش پنل زمانبندی (اگر وجود داشته باشد)
                const datePickerContainer = document.querySelector('.date-picker-container');
                if (datePickerContainer) {
                    datePickerContainer.style.display = 'block';
                    //("پنل date-picker-container نمایش داده شد");
                } else {
                    //("المان date-picker-container یافت نشد");
                }
            } else {
                console.error("هیچ input فایلی در صفحه یافت نشد");
                alert("خطا: فیلد آپلود فایل یافت نشد.");
            }
        }
    }
    
    // تنظیم پیش‌نمایش صدا
    function setupAudioPreview() {
        if (!audioBlob) return;
        
        // تنظیم فایل صوتی برای پخش
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioPreview = document.getElementById('audio-preview');
        const audioPlayer = document.getElementById('audio-player');
        
        if (audioPreview && audioPlayer) {
            // تنظیم منبع صوتی
            audioPreview.src = audioUrl;
            
            // اطمینان از اینکه مدت زمان در متغیر جهانی ذخیره شده است
            if (!window.recordedAudioDuration && elapsedTimeBeforePause) {
                window.recordedAudioDuration = Math.floor(elapsedTimeBeforePause / 1000);
                //(`مدت زمان صوتی تنظیم شد: ${window.recordedAudioDuration} ثانیه`);
            }
            
            // نمایش پخش‌کننده
            audioPlayer.style.display = 'block';
            
            // تنظیم رویدادهای پخش‌کننده سفارشی
            setupCustomAudioPlayer();
        }
    }
    
    // تنظیم پخش‌کننده سفارشی
    function setupCustomAudioPlayer() {
        const audioPreview = document.getElementById('audio-preview');
        const playBtn = document.getElementById('play-btn');
        const progressContainer = document.getElementById('audio-progress-container');
        const progress = document.getElementById('audio-progress');
        const progressHandle = document.getElementById('audio-progress-handle');
        const audioTime = document.getElementById('audio-time');
        const speedBtn = document.getElementById('speed-btn');
        const speedOptions = document.getElementById('speed-options');
        
        if (!audioPreview || !playBtn || !progressContainer || !progress || !progressHandle || !audioTime) return;
        
        // استخراج مدت زمان از نام فایل برای رفع مشکل Infinity
        const extractDurationFromElapsedTime = function() {
            // استفاده از مدت زمان ضبط شده که قبلاً محاسبه شده است
            if (window.recordedAudioDuration) {
                const totalSeconds = window.recordedAudioDuration;
                const totalMinutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
                const totalSecondsFormatted = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
                return {
                    success: true,
                    minutes: totalMinutes,
                    seconds: totalSecondsFormatted,
                    totalSeconds: totalSeconds
                };
            }
            return { success: false };
        };
        
        // ذخیره مدت زمان برای استفاده در پخش‌کننده
        const durationInfo = extractDurationFromElapsedTime();
        if (durationInfo.success) {
            // ذخیره مدت زمان در ویژگی سفارشی
            audioPreview.setAttribute('data-duration-seconds', durationInfo.totalSeconds);
            
            // تنظیم نمایش زمان اولیه
            audioTime.textContent = `00:00/${durationInfo.minutes}:${durationInfo.seconds}`;
        }
        
        // رویداد کلیک دکمه پخش/توقف
        playBtn.addEventListener('click', function() {
            if (audioPreview.paused) {
                audioPreview.play();
                this.innerHTML = '<i class="fa-solid fa-pause"></i>';
            } else {
                audioPreview.pause();
                this.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
        });
        
        // رویداد پایان پخش
        audioPreview.addEventListener('ended', function() {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        });
        
        // رویداد به‌روزرسانی زمان
        audioPreview.addEventListener('timeupdate', function() {
            // استفاده از مدت زمان سفارشی به جای duration استاندارد
            const customDuration = audioPreview.getAttribute('data-duration-seconds');
            const duration = customDuration ? parseInt(customDuration) : (isFinite(audioPreview.duration) ? audioPreview.duration : 0);
            
            if (duration > 0) {
                // به‌روزرسانی نوار پیشرفت
                const percent = (audioPreview.currentTime / duration) * 100;
                progress.style.width = percent + '%';
                progressHandle.style.left = percent + '%';
                
                // به‌روزرسانی زمان
                const currentMinutes = Math.floor(audioPreview.currentTime / 60).toString().padStart(2, '0');
                const currentSeconds = Math.floor(audioPreview.currentTime % 60).toString().padStart(2, '0');
                const totalMinutes = Math.floor(duration / 60).toString().padStart(2, '0');
                const totalSeconds = Math.floor(duration % 60).toString().padStart(2, '0');
                
                // فرمت زمان با اسلش مطابق تصویر
                audioTime.textContent = `${currentMinutes}:${currentSeconds}/${totalMinutes}:${totalSeconds}`;
            }
        });
        
        // رویداد لود متادیتا - با احتیاط استفاده می‌کنیم زیرا ممکن است مقدار Infinity برگرداند
        audioPreview.addEventListener('loadedmetadata', function() {
            // اگر مدت زمان سفارشی داریم، از آن استفاده می‌کنیم
            const customDuration = audioPreview.getAttribute('data-duration-seconds');
            if (customDuration) {
                const duration = parseInt(customDuration);
                const totalMinutes = Math.floor(duration / 60).toString().padStart(2, '0');
                const totalSeconds = Math.floor(duration % 60).toString().padStart(2, '0');
                audioTime.textContent = `00:00/${totalMinutes}:${totalSeconds}`;
            } else if (isFinite(audioPreview.duration)) {
                // فقط اگر مقدار معتبر باشد از duration استفاده می‌کنیم
                const totalMinutes = Math.floor(audioPreview.duration / 60).toString().padStart(2, '0');
                const totalSeconds = Math.floor(audioPreview.duration % 60).toString().padStart(2, '0');
                audioTime.textContent = `00:00/${totalMinutes}:${totalSeconds}`;
            }
        });
        
        // امکان جابجایی در فایل صوتی
        progressContainer.addEventListener('click', function(e) {
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            
            // استفاده از مدت زمان سفارشی به جای duration استاندارد
            const customDuration = audioPreview.getAttribute('data-duration-seconds');
            const duration = customDuration ? parseInt(customDuration) : (isFinite(audioPreview.duration) ? audioPreview.duration : 0);
            
            if (duration > 0) {
                const newTime = pos * duration;
                applyPosition(audioPreview, newTime);
                
                // به‌روزرسانی فوری رابط کاربری
                progress.style.width = `${pos * 100}%`;
                progressHandle.style.left = `${pos * 100}%`;
            }
        });
        
        // تابع اعمال موقعیت با قابلیت تلاش مجدد
        function applyPosition(audioElement, position, retryCount = 0) {
            try {
                // ذخیره موقعیت کلیک شده برای استفاده بعدی
                audioElement._lastClickPosition = position;
                
                // اعمال موقعیت جدید
                audioElement.currentTime = position;
                
                // بررسی اگر موقعیت به درستی اعمال نشده است
                setTimeout(() => {
                    if (Math.abs(audioElement.currentTime - position) > 1 && retryCount < 3) {
                        //(`تلاش مجدد برای اعمال موقعیت: ${retryCount + 1}`);
                        applyPosition(audioElement, position, retryCount + 1);
                    }
                }, 100);
            } catch (error) {
                console.error("خطا در اعمال موقعیت:", error);
                
                // تلاش مجدد با تأخیر اگر خطا رخ داده است
                if (retryCount < 3) {
                    setTimeout(() => {
                        applyPosition(audioElement, position, retryCount + 1);
                    }, 300);
                }
            }
        }
        
        // تنظیم سرعت پخش
        if (speedBtn && speedOptions) {
            // نمایش/مخفی کردن گزینه‌های سرعت
            speedBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                speedOptions.style.display = speedOptions.style.display === 'flex' ? 'none' : 'flex';
            });
            
            // انتخاب سرعت
            speedOptions.querySelectorAll('.speed-option').forEach(option => {
                option.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const speed = parseFloat(this.getAttribute('data-speed'));
                    audioPreview.playbackRate = speed;
                    speedBtn.querySelector('span').textContent = this.textContent;
                    
                    // فعال کردن گزینه انتخاب شده
                    speedOptions.querySelectorAll('.speed-option').forEach(opt => {
                        opt.style.backgroundColor = 'transparent';
                        opt.style.fontWeight = 'normal';
                    });
                    this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    this.style.fontWeight = 'bold';
                    
                    speedOptions.style.display = 'none';
                });
            });
            
            // بستن گزینه‌های سرعت با کلیک در هر جای دیگر
            document.addEventListener('click', function() {
                speedOptions.style.display = 'none';
            });
        }
    }
    
    // اضافه کردن استایل CSS برای نشانگر ضبط و مخفی کردن input
    function addRecordingIndicatorStyle() {
        if (!document.getElementById('voice-recording-style')) {
            const style = document.createElement('style');
            style.id = 'voice-recording-style';
            style.textContent = `
                @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
                
                .recording-indicator {
                    display: inline-block;
                    width: 10px;
                    height: 10px;
                    background-color: #F44336;
                    border-radius: 50%;
                    margin-right: 5px;
                    animation: blink 1.5s infinite;
                }
                
                #telegramVoiceRecorder {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .recorder-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .recorder-btn:hover {
                    transform: scale(1.05);
                }
                
                .recorder-btn.record:hover {
                    background-color: #e53935 !important;
                }
                
                .recorder-btn.stop:hover {
                    background-color: rgba(255, 255, 255, 0.3) !important;
                }
                
                /* استایل برای دکمه میکروفون اصلی */
                .voice-recorder-btn {
                    position: relative;
                }
                
                /* تاکید روی دکمه میکروفون در هنگام هاور */
                .voice-recorder-btn:hover {
                    transform: scale(1.05);
                    transition: transform 0.2s ease;
                }
                
                /* استایل قوی برای مخفی کردن کامل input */
                .hidden-input-container {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    width: 0 !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    pointer-events: none !important;
                    clip: rect(0, 0, 0, 0) !important;
                    margin: -1px !important;
                    padding: 0 !important;
                    border: 0 !important;
                    transform: scale(0) !important;
                    max-height: 0 !important;
                    max-width: 0 !important;
                    z-index: -9999 !important;
                }
                
                /* مطمئن شویم که هیچ عنصر فرزندی در کانتینر مخفی قابل دسترسی نیست */
                .hidden-input-container * {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // راه‌اندازی اولیه
    setupVoiceButton();
    addRecordingIndicatorStyle();
}); 