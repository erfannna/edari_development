/**
 * فایل اصلاح کننده مشکل overlay در چت تلگرام
 * این فایل برای برطرف کردن مشکل تیره ماندن صفحه پس از نمایش پیام خطای تاریخ ارسال ایجاد شده است
 * نسخه اصلاح شده: عملکرد این فایل محدود به کامپوننت چت تلگرام شده است
 */

document.addEventListener("DOMContentLoaded", function () {
  // اطمینان از اینکه کامپوننت چت تلگرام وجود دارد
  const telegramChatContainer = document.getElementById(
    "telegramChatContainer"
  );
  if (!telegramChatContainer) {
    return; // اگر کامپوننت چت تلگرام وجود ندارد، اجرای اسکریپت را متوقف کن
  }

  // تعریف متغیر دیباگ (غیرفعال)
  const debugMode = false;

  // تابع لاگ دیباگ
  function debugLog(...args) {
    if (debugMode) {
      console.log("[Telegram Chat Debug]", ...args);
    }
  }

  // تابع clearModalOverlay محدود به کامپوننت تلگرام
  function clearModalOverlay() {
    // بررسی اینکه آیا کامپوننت تلگرام فعال است
    const isTelegramActive = telegramChatContainer.classList.contains("open");

    // فقط overlay مرتبط با کامپوننت تلگرام را پیدا کن
    const overlay = document.getElementById("jdpModalOverlay");

    // اطمینان حاصل کن که overlay وجود دارد و فقط در صورتی آن را تغییر بده که تلگرام فعال باشد
    if (overlay && isTelegramActive) {
      debugLog("پاکسازی overlay در کامپوننت تلگرام");
      overlay.classList.remove("active");
    }

    // بررسی وضعیت پیش‌نمایش فایل - فقط داخل کامپوننت تلگرام
    if (!isTelegramActive) return;

    const filePreview = telegramChatContainer.querySelector("#filePreview");
    if (filePreview && window.selectedFile) {
      // اگر فایلی انتخاب شده است، پیش‌نمایش را حفظ کن
      filePreview.style.display = "flex";

      // مخفی کردن دکمه‌های ارسال - فقط در چت تلگرام
      const sendButton =
        telegramChatContainer.querySelector("#telegramSendBtn");
      if (sendButton) {
        sendButton.style.display = "none";
      }

      const allSendButtons =
        telegramChatContainer.querySelectorAll(".telegram-send-btn");
      allSendButtons.forEach((btn) => {
        btn.style.display = "none";
      });
    }
  }

  // تابع resetChatData محدود به کامپوننت تلگرام
  window.resetChatData = function () {
    // بررسی اینکه آیا کامپوننت تلگرام فعال است
    const isTelegramActive = telegramChatContainer.classList.contains("open");
    if (!isTelegramActive) {
      debugLog("چت تلگرام فعال نیست، ریست انجام نمی‌شود");
      return; // اگر چت تلگرام باز نیست، هیچ کاری انجام نده
    }

    debugLog("در حال ریست کردن داده‌های چت تلگرام");

    try {
      // ریست متن پیام - فقط در چت تلگرام
      const chatInputs = telegramChatContainer.querySelectorAll(
        '.telegram-chat-input, .telegram-message-input, .telegram-input, textarea[data-role="telegram-input"], .chat-input'
      );
      chatInputs.forEach((input) => {
        input.value = "";
        // برای اطمینان از به‌روزرسانی در همه مرورگرها، رویدادهای مختلف را فعال می‌کنیم
        const inputEvent = new Event("input", { bubbles: true });
        const changeEvent = new Event("change", { bubbles: true });
        input.dispatchEvent(inputEvent);
        input.dispatchEvent(changeEvent);

        // برای React و دیگر فریمورک‌های مدرن
        if (input._valueTracker) {
          input._valueTracker.setValue("");
        }
      });

      // محتوای contenteditable را نیز ریست می‌کنیم - فقط در چت تلگرام
      const editableContents = telegramChatContainer.querySelectorAll(
        '[contenteditable="true"]'
      );
      editableContents.forEach((element) => {
        element.innerHTML = "";
        // رویداد input را برای contenteditable ها نیز فعال می‌کنیم
        const event = new Event("input", { bubbles: true });
        element.dispatchEvent(event);
      });

      // ریست فایل‌های انتخاب شده - فقط در چت تلگرام
      const fileInputs =
        telegramChatContainer.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        input.value = "";
        // رویداد change را برای file input ها فعال می‌کنیم
        const event = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
      });

      // ریست پیش‌نمایش فایل - فقط در چت تلگرام
      const filePreview = telegramChatContainer.querySelector("#filePreview");
      if (filePreview) {
        filePreview.style.display = "none";
        filePreview.innerHTML = "";
      }

      // ریست ضبط صوت - فقط در چت تلگرام
      const voiceRecorder =
        telegramChatContainer.querySelector("#voiceRecorder");
      if (voiceRecorder) {
        voiceRecorder.style.display = "none";
        // اگر ضبط صوت در حال انجام است، متوقف کنیم
        if (typeof window.stopRecording === "function") {
          window.stopRecording(true); // لغو ضبط صدا
        }
      }

      // ریست انتخابگر تاریخ - فقط در چت تلگرام
      const schedulePanel =
        telegramChatContainer.querySelector("#schedulePanel");
      if (schedulePanel) {
        schedulePanel.style.display = "none";
      }

      const scheduledTimeInput = telegramChatContainer.querySelector(
        "#scheduledTimeInput"
      );
      if (scheduledTimeInput) {
        scheduledTimeInput.value = "";
        // رویداد change را برای input تاریخ فعال می‌کنیم
        const event = new Event("change", { bubbles: true });
        scheduledTimeInput.dispatchEvent(event);
      }

      // ریست متغیر زمان زمانبندی
      window.scheduledTime = null;

      // ریست نمایش تاریخ - فقط در چت تلگرام
      const scheduleTimeDisplay = telegramChatContainer.querySelector(
        "#scheduleTimeDisplay"
      );
      if (scheduleTimeDisplay) {
        scheduleTimeDisplay.textContent = "انتخاب نشده";
        scheduleTimeDisplay.classList.add("not-selected");
        scheduleTimeDisplay.classList.remove("selected");
      }

      // بستن تقویم اگر باز است - فقط در چت تلگرام
      if (typeof jalaliDatepicker !== "undefined" && isTelegramActive) {
        // بررسی اینکه آیا تقویم داخل کامپوننت تلگرام باز است
        const jdpContainer =
          telegramChatContainer.querySelector(".jdp-container");
        if (jdpContainer && getComputedStyle(jdpContainer).display !== "none") {
          jalaliDatepicker.hide();
        }
      }

      // حذف کلاس active از overlay - محدود به کامپوننت تلگرام
      clearModalOverlay();
    } catch (error) {
      console.error("خطا در ریست کردن داده‌های چت تلگرام:", error);
    }
  };

  // بهبود استایل پنل زمان‌بندی - فقط در چت تلگرام
  function improveSchedulePanelStyle() {
    // بررسی اینکه آیا کامپوننت تلگرام فعال است
    const isTelegramActive = telegramChatContainer.classList.contains("open");
    if (!isTelegramActive) return;

    const schedulePanel = telegramChatContainer.querySelector("#schedulePanel");
    if (schedulePanel) {
      // تنظیم موقعیت و استایل پنل
      schedulePanel.style.position = "absolute";
      schedulePanel.style.bottom = "100px";
      schedulePanel.style.padding = "6px 8px";
      schedulePanel.style.zIndex = "999999";
      schedulePanel.style.boxShadow = "0 -2px 5px rgba(0, 0, 0, 0.2)";
      schedulePanel.style.borderRadius = "8px 8px 0 0";

      // پیدا کردن و اصلاح استایل label
      const label = schedulePanel.querySelector("label.form-label");
      if (label) {
        label.style.fontSize = "12px";
        label.style.marginBottom = "2px";
      }

      // پیدا کردن و اصلاح استایل input
      const input = schedulePanel.querySelector("input.form-control");
      if (input) {
        input.style.padding = "5px 8px";
        input.style.fontSize = "13px";
        input.style.height = "auto";
      }

      // پیدا کردن و اصلاح استایل form-group
      const formGroup = schedulePanel.querySelector(".form-group");
      if (formGroup) {
        formGroup.style.marginBottom = "4px";
      }

      // پیدا کردن و اصلاح استایل دکمه حذف
      const removeBtn = schedulePanel.querySelector(
        ".telegram-remove-schedule"
      );
      if (removeBtn) {
        removeBtn.style.width = "24px";
        removeBtn.style.height = "24px";
        removeBtn.style.marginTop = "0";
        removeBtn.style.fontSize = "10px";
        removeBtn.style.alignSelf = "center";
      }
    }
  }

  // تعریف تابع جامع showSchedulePanel - محدود به چت تلگرام
  window.showSchedulePanel = function (
    setDefaultDate = false,
    contentType = "text"
  ) {
    // بررسی اینکه آیا کامپوننت تلگرام فعال است
    const isTelegramActive = telegramChatContainer.classList.contains("open");
    if (!isTelegramActive) {
      debugLog("چت تلگرام فعال نیست، نمایش پنل زمانبندی متوقف شد");
      return;
    }

    debugLog("نمایش پنل زمانبندی در چت تلگرام");

    // مخفی کردن پنل‌های دیگر - به جز پیش‌نمایش فایل در حالت attachment - فقط در چت تلگرام
    const voiceRecorder = telegramChatContainer.querySelector("#voiceRecorder");
    if (voiceRecorder) voiceRecorder.style.display = "none";

    // فقط اگر نوع محتوا attachment نباشد، پیش‌نمایش فایل را مخفی کن - فقط در چت تلگرام
    const filePreview = telegramChatContainer.querySelector("#filePreview");
    if (filePreview) {
      if (contentType === "attachment") {
        // در حالت attachment، پیش‌نمایش فایل را نمایش بده
        filePreview.style.display = "flex";

        // اطمینان از وجود دکمه ارسال فایل
        if (typeof window.createSendFileButton === "function") {
          window.createSendFileButton();
        }

        // مخفی کردن دکمه‌های ارسال - فقط در چت تلگرام
        const sendButton =
          telegramChatContainer.querySelector("#telegramSendBtn");
        if (sendButton) {
          sendButton.style.display = "none";
        }

        const allSendButtons =
          telegramChatContainer.querySelectorAll(".telegram-send-btn");
        allSendButtons.forEach((btn) => {
          btn.style.display = "none";
        });
      } else {
        // در غیر این صورت، پیش‌نمایش فایل را مخفی کن
        filePreview.style.display = "none";
      }
    }

    // نمایش پنل زمانبندی - فقط در چت تلگرام
    const schedulePanel = telegramChatContainer.querySelector("#schedulePanel");
    if (schedulePanel) {
      schedulePanel.style.display = "flex";
      schedulePanel.style.position = "absolute";
      schedulePanel.style.bottom = "60px";
      schedulePanel.style.left = "0";
      schedulePanel.style.right = "0";
      schedulePanel.style.zIndex = "999999";
    }

    // مطمئن شویم که تقویم قبلی بسته شده است - فقط در چت تلگرام
    if (typeof jalaliDatepicker !== "undefined" && isTelegramActive) {
      const jdpContainer =
        telegramChatContainer.querySelector(".jdp-container");
      if (jdpContainer && getComputedStyle(jdpContainer).display !== "none") {
        jalaliDatepicker.hide();
      }
    }

    // تنظیم فیلد ورودی تاریخ - فقط در چت تلگرام
    const scheduledTimeInput = telegramChatContainer.querySelector(
      "#scheduledTimeInput"
    );

    // اگر قبلاً تاریخی انتخاب نشده، تاریخ پیش‌فرض را تنظیم کنیم
    if (scheduledTimeInput) {
      // اطمینان از وجود ویژگی data-jdp
      if (!scheduledTimeInput.hasAttribute("data-jdp")) {
        scheduledTimeInput.setAttribute("data-jdp", "");
        scheduledTimeInput.setAttribute("placeholder", "انتخاب تاریخ و زمان");
      }

      scheduledTimeInput.style.display = "block";

      // پاک کردن مقدار قبلی
      scheduledTimeInput.value = "";

      // نمایش "انتخاب نشده" در پنل زمانبندی
      const scheduleTimeDisplay = telegramChatContainer.querySelector(
        "#scheduleTimeDisplay"
      );
      if (scheduleTimeDisplay) {
        scheduleTimeDisplay.textContent = "انتخاب نشده";
        scheduleTimeDisplay.classList.add("not-selected");
        scheduleTimeDisplay.classList.remove("selected");
      }

      // پاک کردن مقدار زمان زمانبندی شده
      window.scheduledTime = null;
    }

    // فعال‌سازی تقویم شمسی - فقط برای چت تلگرام
    if (typeof jalaliDatepicker !== "undefined" && isTelegramActive) {
      // نمایش تقویم با تأخیر کوتاه
      setTimeout(() => {
        if (scheduledTimeInput) {
          jalaliDatepicker.show(scheduledTimeInput);

          // فعال کردن overlay برای تقویم - با افزودن ویژگی data-source
          const overlay = document.getElementById("jdpModalOverlay");
          if (overlay) {
            overlay.classList.add("active");
            overlay.style.display = "block";
            overlay.style.zIndex = "99999";
            // افزودن ویژگی data-source برای شناسایی منبع overlay
            overlay.dataset.source = "telegram-chat";
          } else {
            // ایجاد overlay جدید اگر وجود ندارد - با ویژگی data-source
            const newOverlay = document.createElement("div");
            newOverlay.id = "jdpModalOverlay";
            newOverlay.className = "jdp-modal-overlay active";
            newOverlay.style.position = "fixed";
            newOverlay.style.top = "0";
            newOverlay.style.left = "0";
            newOverlay.style.width = "100%";
            newOverlay.style.height = "100%";
            newOverlay.style.backgroundColor = "rgba(0,0,0,0.5)";
            newOverlay.style.zIndex = "99999";
            // افزودن ویژگی data-source برای شناسایی منبع overlay
            newOverlay.dataset.source = "telegram-chat";

            document.body.appendChild(newOverlay);

            // اضافه کردن رویداد کلیک برای بستن تقویم
            newOverlay.addEventListener("click", function () {
              // فقط اگر overlay مربوط به چت تلگرام است، آن را پاک کن
              if (this.dataset.source === "telegram-chat") {
                this.classList.remove("active");
                this.style.display = "none";
                if (typeof jalaliDatepicker !== "undefined") {
                  jalaliDatepicker.hide();
                }
              }
            });
          }
        }
      }, 300);
    } else {
      // تقویم بارگذاری نشده، تلاش برای بارگذاری - فقط در چت تلگرام
      if (
        typeof window.loadJalaliDatepickerLibrary === "function" &&
        isTelegramActive
      ) {
        window.loadJalaliDatepickerLibrary();
      }
    }

    // اعمال بهبود استایل - فقط در چت تلگرام
    improveSchedulePanelStyle();
  };

  // اجرای بهبود استایل در هنگام بارگذاری صفحه - فقط در چت تلگرام
  if (telegramChatContainer.classList.contains("open")) {
    improveSchedulePanelStyle();
  }

  // افزودن رویدادها برای دکمه‌های بستن و برگشت - فقط در چت تلگرام
  const telegramCloseBtn =
    telegramChatContainer.querySelector("#telegramClose");
  if (telegramCloseBtn) {
    telegramCloseBtn.addEventListener("click", function () {
      debugLog("کلیک روی دکمه بستن چت تلگرام");
      if (typeof window.resetChatData === "function") {
        window.resetChatData();
      }
    });
  }

  const backButton = telegramChatContainer.querySelector("#telegramBackBtn");
  if (backButton) {
    backButton.addEventListener("click", function () {
      debugLog("کلیک روی دکمه برگشت چت تلگرام");
      if (typeof window.resetChatData === "function") {
        window.resetChatData();
      }
    });
  }

  // تعریف تابع جدید برای نمایش هشدار در چت تلگرام
  window.telegramAlert = function (message) {
    // استفاده از alert معمولی
    alert(message);
    // فقط در صورتی که چت تلگرام فعال است، overlay را پاک کن
    if (telegramChatContainer.classList.contains("open")) {
      setTimeout(clearModalOverlay, 100);
    }
  };

  // فقط اگر کامپوننت تلگرام باز است، MutationObserver را فعال کن
  if (telegramChatContainer.classList.contains("open")) {
    // نظارت بر تغییرات در محتوای چت تلگرام - محدود به خود کامپوننت
    const chatContainer = telegramChatContainer.querySelector(
      ".telegram-chat-body, .telegram-messages-container, #telegramChatBody"
    );
    if (chatContainer) {
      const observer = new MutationObserver(function (mutations) {
        // فقط اگر چت تلگرام فعال است، تغییرات را بررسی کن
        if (!telegramChatContainer.classList.contains("open")) {
          return;
        }

        for (const mutation of mutations) {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // بررسی اگر تغییر مربوط به نمایش پیش‌نمایش فایل است، ریست را انجام ندهیم
            let isFilePreviewChange = false;

            for (const node of mutation.addedNodes) {
              if (
                node.classList &&
                (node.classList.contains("telegram-file-preview") ||
                  (node.querySelector &&
                    node.querySelector(".telegram-file-preview")) ||
                  mutation.target.closest(".telegram-input-container"))
              ) {
                isFilePreviewChange = true;
                break;
              }
            }

            if (!isFilePreviewChange) {
              debugLog("تغییر در محتوای چت تلگرام شناسایی شد");
              if (typeof window.resetChatData === "function") {
                window.resetChatData();
              }
            }
            break;
          }
        }
      });

      observer.observe(chatContainer, { childList: true, subtree: true });
    }
  }

  // هندلر رویدادهای تقویم - محدود به چت تلگرام
  document.addEventListener("jdp:change", function (event) {
    // فقط اگر چت تلگرام فعال است و رویداد مربوط به آن است
    if (
      telegramChatContainer.classList.contains("open") &&
      event.target &&
      telegramChatContainer.contains(event.target)
    ) {
      // پاکسازی overlay
      clearModalOverlay();

      // اگر فایلی انتخاب شده باشد، رویداد schedule-selected را ارسال کن
      if (window.selectedFile) {
        debugLog("رویداد jdp:change در چت تلگرام با فایل انتخاب شده");

        // تنظیم وضعیت زمان‌بندی به عنوان فعال
        if (typeof window.isScheduleActive !== "undefined") {
          window.isScheduleActive = true;
        }

        // مخفی کردن دکمه‌های ارسال - فقط در چت تلگرام
        const sendButton =
          telegramChatContainer.querySelector("#telegramSendBtn");
        if (sendButton) {
          sendButton.style.display = "none";
        }

        const allSendButtons =
          telegramChatContainer.querySelectorAll(".telegram-send-btn");
        allSendButtons.forEach((btn) => {
          btn.style.display = "none";
        });

        // ایجاد و ارسال رویداد schedule-selected
        const scheduleEvent = new CustomEvent("schedule-selected", {
          detail: {
            scheduledTime: window.scheduledTime,
            contentType: "attachment",
          },
        });
        document.dispatchEvent(scheduleEvent);
      }
    }
  });

  document.addEventListener("jdp:hide", function (event) {
    // فقط اگر چت تلگرام فعال است و رویداد مربوط به آن است
    if (
      telegramChatContainer.classList.contains("open") &&
      event.target &&
      telegramChatContainer.contains(event.target)
    ) {
      clearModalOverlay();
    }
  });

  // اضافه کردن رویداد به تغییر وضعیت نمایشی کامپوننت تلگرام
  const telegramChatIcon = document.getElementById("telegramChatIcon");
  if (telegramChatIcon) {
    telegramChatIcon.addEventListener("click", function () {
      // کمی تاخیر برای اطمینان از اینکه کلاس open اضافه شده است
      setTimeout(function () {
        if (telegramChatContainer.classList.contains("open")) {
          debugLog("چت تلگرام باز شد");
          // اطمینان از پاک بودن overlay در هنگام باز شدن چت تلگرام
          clearModalOverlay();
        }
      }, 100);
    });
  }

  // فقط اگر چت تلگرام باز است، overlay را پاک کن
  if (telegramChatContainer.classList.contains("open")) {
    // اطمینان از پاک بودن overlay در هنگام بارگذاری صفحه
    clearModalOverlay();
  }
});
