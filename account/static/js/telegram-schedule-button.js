/**
 * فایل مدیریت دکمه زمان‌بندی در چت تلگرام
 * این فایل برای اضافه کردن و مدیریت دکمه انتخاب زمان ارسال پیام در قسمت input ایجاد شده است
 */

document.addEventListener("DOMContentLoaded", function () {
  // اطمینان از اینکه کامپوننت چت تلگرام وجود دارد
  const telegramChatContainer = document.getElementById(
    "telegramChatContainer"
  );
  if (!telegramChatContainer) {
    return; // اگر کامپوننت چت تلگرام وجود ندارد، اجرای اسکریپت را متوقف کن
  }

  // دیباگ مود (غیرفعال)
  const debugMode = false;

  // تابع لاگ دیباگ
  function debugLog(...args) {
    if (debugMode) {
      console.log("[Telegram Schedule Debug]", ...args);
    }
  }

  // افزودن دکمه زمان‌بندی به گزینه‌های input
  function addScheduleButton() {
    // پیدا کردن کانتینر گزینه‌های input
    const inputOptions = telegramChatContainer.querySelector(
      ".telegram-input-options"
    );
    if (!inputOptions) {
      console.error("کانتینر گزینه‌های input یافت نشد");
      return;
    }

    // بررسی اینکه آیا دکمه قبلاً اضافه شده است
    if (telegramChatContainer.querySelector("#scheduleMessageBtn")) {
      debugLog("دکمه زمان‌بندی قبلاً اضافه شده است");
      return;
    }

    // ایجاد دکمه زمان‌بندی
    const scheduleBtn = document.createElement("button");
    scheduleBtn.type = "button";
    scheduleBtn.className = "telegram-option-btn";
    scheduleBtn.id = "scheduleMessageBtn";
    scheduleBtn.title = "زمان‌بندی ارسال پیام";
    scheduleBtn.innerHTML = '<i class="fa-regular fa-clock"></i>';

    // افزودن دکمه به گزینه‌های input
    inputOptions.appendChild(scheduleBtn);

    // افزودن رویداد کلیک به دکمه زمان‌بندی
    scheduleBtn.addEventListener("click", function () {
      debugLog("دکمه زمان‌بندی کلیک شد");

      // اطمینان از بارگذاری تقویم
      if (typeof jalaliDatepicker === "undefined") {
        debugLog("تلاش برای بارگذاری کتابخانه تقویم شمسی");
        if (typeof loadJalaliDatepickerLibrary === "function") {
          loadJalaliDatepickerLibrary();
        }
      }

      // باز کردن پنل زمان‌بندی
      if (typeof window.showSchedulePanel === "function") {
        window.showSchedulePanel(true);
      } else {
        debugLog("تابع showSchedulePanel یافت نشد");
        alert("قابلیت زمان‌بندی در دسترس نیست");
      }
    });

    debugLog("دکمه زمان‌بندی با موفقیت اضافه شد");
  }

  // تنظیم زمان‌بندی برای باز شدن کامپوننت‌های مختلف
  function setupScheduleEvents() {
    // رویداد باز شدن چت تلگرام
    telegramChatContainer.addEventListener("transitionend", function (event) {
      // فقط اگر این رویداد مربوط به باز شدن چت است
      if (
        event.propertyName === "transform" &&
        telegramChatContainer.classList.contains("open")
      ) {
        debugLog("چت تلگرام باز شد - افزودن دکمه زمان‌بندی");
        addScheduleButton();
      }
    });

    // برای مواردی که ممکن است رویداد transition اجرا نشود
    const telegramChatIcon = document.getElementById("telegramChatIcon");
    if (telegramChatIcon) {
      telegramChatIcon.addEventListener("click", function () {
        // کمی تاخیر برای اطمینان از اینکه DOM به‌روزرسانی شده است
        setTimeout(function () {
          if (telegramChatContainer.classList.contains("open")) {
            debugLog("چت تلگرام با کلیک باز شد - افزودن دکمه زمان‌بندی");
            addScheduleButton();
          }
        }, 300);
      });
    }

    // افزودن دکمه اگر چت از قبل باز است
    if (telegramChatContainer.classList.contains("open")) {
      debugLog("چت تلگرام از قبل باز است - افزودن دکمه زمان‌بندی");
      addScheduleButton();
    }

    // مطمئن شویم که در حالت مکالمه فعال، دکمه ها نمایش داده می‌شوند
    const backBtn = telegramChatContainer.querySelector("#telegramBackBtn");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        // کمی تاخیر برای اطمینان از اینکه DOM به‌روزرسانی شده است
        setTimeout(function () {
          if (
            !telegramChatContainer.classList.contains(
              "telegram-container-active"
            )
          ) {
            debugLog("بازگشت به لیست گفتگوها - پاکسازی دکمه زمان‌بندی");
          }
        }, 300);
      });
    }

    // اطمینان از اینکه پنل زمانبندی نمایش داده می‌شود
    document.addEventListener("jdp:change", function (event) {
      debugLog("رویداد jdp:change شناسایی شد");

      // فقط اگر چت تلگرام فعال است و رویداد مربوط به آن است
      if (
        telegramChatContainer.classList.contains("open") &&
        event.target &&
        telegramChatContainer.contains(event.target)
      ) {
        debugLog("تاریخ انتخاب شد در چت تلگرام");

        // اگر تابع clearModalOverlay موجود است، آن را فراخوانی کنیم
        if (typeof window.clearModalOverlay === "function") {
          window.clearModalOverlay();
        }

        // ذخیره زمان انتخاب شده
        try {
          // دریافت مقدار تاریخ انتخاب شده از فیلد ورودی
          const scheduledTimeInput =
            document.getElementById("scheduledTimeInput");
          if (scheduledTimeInput && scheduledTimeInput.value) {
            debugLog("تاریخ انتخاب شده:", scheduledTimeInput.value);

            // تبدیل تاریخ شمسی به میلادی
            if (typeof window.jalaliToGregorian === "function") {
              const gregorianDate = window.jalaliToGregorian(
                scheduledTimeInput.value
              );
              if (gregorianDate) {
                window.scheduledTime = gregorianDate.toISOString();
                debugLog("تاریخ میلادی ذخیره شده:", window.scheduledTime);
              }
            } else {
              // اگر تابع تبدیل موجود نیست، از روش ساده استفاده می‌کنیم
              const parts = scheduledTimeInput.value.split("/");
              if (parts.length === 3) {
                // تبدیل تاریخ شمسی به میلادی با استفاده از کتابخانه jalaliDatepicker
                if (
                  typeof jalaliDatepicker !== "undefined" &&
                  typeof jalaliDatepicker.jalaliToGregorian === "function"
                ) {
                  const jDate = {
                    year: parseInt(parts[0]),
                    month: parseInt(parts[1]),
                    day: parseInt(parts[2]),
                  };
                  const gDate = jalaliDatepicker.jalaliToGregorian(jDate);
                  const gregorianDate = new Date(
                    gDate.year,
                    gDate.month - 1,
                    gDate.day,
                    12,
                    0,
                    0
                  );
                  window.scheduledTime = gregorianDate.toISOString();
                  debugLog(
                    "تاریخ میلادی ذخیره شده با jalaliDatepicker:",
                    window.scheduledTime
                  );
                } else {
                  // اگر کتابخانه موجود نیست، از تاریخ فعلی استفاده می‌کنیم
                  const now = new Date();
                  // تنظیم ساعت به 12 ظهر تاریخ فعلی
                  now.setHours(12, 0, 0, 0);
                  window.scheduledTime = now.toISOString();
                  debugLog("تاریخ میلادی پیش‌فرض:", window.scheduledTime);
                }
              }
            }

            // تنظیم وضعیت زمان‌بندی به فعال
            window.isScheduleActive = true;
            debugLog("وضعیت زمان‌بندی فعال شد");
          }
        } catch (e) {
          console.error("خطا در تبدیل تاریخ شمسی به میلادی:", e);
          // در صورت خطا، از تاریخ فعلی استفاده می‌کنیم
          const now = new Date();
          window.scheduledTime = now.toISOString();
          window.isScheduleActive = false;
        }

        // تعیین نوع محتوا بر اساس وضعیت فعلی
        let contentType = "text";

        // بررسی وجود فایل انتخاب شده
        const filePreview = document.getElementById("filePreview");
        if (
          filePreview &&
          filePreview.style.display === "flex" &&
          window.selectedFile
        ) {
          contentType = "attachment";
          debugLog("نوع محتوا: فایل پیوست");

          // جلوگیری از انتشار رویداد به سایر بخش‌ها
          event.stopPropagation();

          // ارسال رویداد schedule-selected با اطلاعات دقیق نوع محتوا
          const scheduleEvent = new CustomEvent("schedule-selected", {
            detail: {
              scheduledTime: window.scheduledTime,
              contentType: contentType,
            },
          });
          document.dispatchEvent(scheduleEvent);

          // حذف ارسال خودکار فایل - فقط زمان‌بندی را تنظیم می‌کنیم
          // و منتظر می‌مانیم تا کاربر روی دکمه ارسال کلیک کند

          return;
        }

        // بررسی وجود فایل صوتی ضبط شده
        const voiceRecorder = document.getElementById("voiceRecorder");
        if (
          voiceRecorder &&
          voiceRecorder.style.display === "flex" &&
          window.recordedAudio
        ) {
          contentType = "voice";
          debugLog("نوع محتوا: فایل صوتی");
        }

        // جلوگیری از انتشار رویداد به سایر بخش‌ها
        event.stopPropagation();

        // ارسال رویداد schedule-selected با اطلاعات دقیق نوع محتوا
        const scheduleEvent = new CustomEvent("schedule-selected", {
          detail: {
            scheduledTime: window.scheduledTime,
            contentType: contentType,
          },
        });
        document.dispatchEvent(scheduleEvent);
      }
    });
  }

  // تنظیم زمان حال به عنوان پیش‌فرض برای زمان ارسال
  function setCurrentTimeAsDefault() {
    // ایجاد تاریخ فعلی
    const now = new Date();
    // تبدیل تاریخ به فرمت ISO برای ارسال به سرور
    window.scheduledTime = now.toISOString();
    debugLog("زمان حال به عنوان زمان پیش‌فرض تنظیم شد:", window.scheduledTime);
  }

  // جایگزینی تابع sendMessage برای جلوگیری از باز شدن پنل زمان‌بندی
  function overrideSendMessage() {
    // اطمینان از وجود تابع sendMessage
    if (typeof window.sendMessage === "function") {
      debugLog("جایگزینی تابع sendMessage");

      // ذخیره تابع اصلی
      window.originalSendMessage = window.sendMessage;

      // جایگزینی با تابع جدید
      window.sendMessage = function () {
        debugLog("تابع sendMessage جدید فراخوانی شد");

        // بررسی وضعیت پنل زمان‌بندی
        const schedulePanel = document.getElementById("schedulePanel");

        // اگر کاربر خودش پنل زمان‌بندی را باز نکرده، زمان حال را تنظیم کنیم
        if (!schedulePanel || schedulePanel.style.display === "none") {
          debugLog("تنظیم زمان حال و ارسال پیام");

          // تنظیم زمان حال
          setCurrentTimeAsDefault();

          // فراخوانی تابع اصلی با همان آرگومان‌ها
          return window.originalSendMessage.apply(this, arguments);
        }

        // اگر پنل باز است و زمان انتخاب شده، اجازه ارسال می‌دهیم
        debugLog("استفاده از زمان انتخاب شده برای ارسال پیام");
        return window.originalSendMessage.apply(this, arguments);
      };

      debugLog("تابع sendMessage با موفقیت جایگزین شد");
    } else {
      console.error("تابع sendMessage یافت نشد");
    }
  }

  // راه‌اندازی اولیه
  setupScheduleEvents();

  // تنظیم زمان حال به عنوان پیش‌فرض
  setCurrentTimeAsDefault();

  // جایگزینی تابع sendMessage
  overrideSendMessage();

  // اگر چت تلگرام از قبل باز است، دکمه زمان‌بندی را اضافه کن
  if (telegramChatContainer.classList.contains("open")) {
    addScheduleButton();
  }

  debugLog("فایل telegram-schedule-button.js با موفقیت بارگذاری شد");
});
