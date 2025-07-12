/**
 * فایل مدیریت قابلیت پاسخ (reply) به پیام‌ها در چت تلگرام
 * این فایل برای اضافه کردن قابلیت پاسخ به پیام‌ها در ویجت چت تلگرام ایجاد شده است
 */

document.addEventListener("DOMContentLoaded", function () {
  //('فایل telegram-reply-handler.js بارگذاری شد');

  // متغیرهای سراسری
  let selectedMessageForReply = null; // پیام انتخاب شده برای پاسخ
  let isScrolling = false; // متغیر برای جلوگیری از اسکرول همزمان

  /**
   * لغو پاسخ به پیام - با اضافه کردن بررسی‌های بیشتر
   */
  function cancelReply() {
    try {
      console.log("در حال پاک کردن پیش‌نمایش ریپلای...");

      // حذف کلاس active از همه دکمه‌های ریپلای
      const activeButtons = document.querySelectorAll(
        ".telegram-reply-btn.active"
      );
      activeButtons.forEach((btn) => btn.classList.remove("active"));

      // حذف کلاس selected-for-reply از همه پیام‌ها
      const selectedMessages = document.querySelectorAll(
        ".telegram-message.selected-for-reply"
      );
      selectedMessages.forEach((msg) =>
        msg.classList.remove("selected-for-reply")
      );

      // حذف همه پیش‌نمایش‌های ریپلای (برای اطمینان از عدم وجود چندین نمونه)
      const replyPreviews = document.querySelectorAll(
        ".telegram-reply-preview"
      );
      replyPreviews.forEach((preview) => {
        preview.remove();
        console.log("یک پیش‌نمایش ریپلای حذف شد");
      });

      // پاک کردن متغیرهای سراسری
      selectedMessageForReply = null;
      window.replyToMessageId = null;

      console.log("پیش‌نمایش ریپلای با موفقیت پاک شد");
    } catch (error) {
      console.error("خطا در پاک کردن پیش‌نمایش ریپلای:", error);
    }
  }

  // پاک کردن پیش‌نمایش ریپلای در شروع
  cancelReply();

  // اضافه کردن استایل‌های مورد نیاز برای قابلیت پاسخ
  addReplyStyles();

  // تنظیم رویدادها
  setupReplyEvents();

  // اضافه کردن یک MutationObserver برای شناسایی پیام‌های جدید
  setupMutationObserver();

  // حذف پیش‌نمایش ریپلای در زمان load صفحه
  window.addEventListener("load", cancelReply);

  // اضافه کردن رویداد برای تغییر چت
  document.addEventListener("click", function (event) {
    // بررسی کلیک روی آیتم‌های مکالمه یا دکمه‌های مرتبط
    if (
      event.target.closest(".telegram-conversation-item") ||
      event.target.closest(".telegram-chat-back-btn") ||
      event.target.closest(".telegram-chat-close-btn") ||
      event.target.closest(".telegram-chat-icon")
    ) {
      cancelReply();
    }
  });

  // اضافه کردن رویداد برای تغییر صفحه
  window.addEventListener("beforeunload", cancelReply);

  // اضافه کردن رویداد برای تغییر وضعیت صفحه
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      cancelReply();
    }
  });

  /**
   * اضافه کردن استایل‌های مورد نیاز برای قابلیت پاسخ به صفحه
   */
  function addReplyStyles() {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
            /* استایل برای پیام‌های انتخاب شده برای پاسخ */
            .telegram-message.selected-for-reply {
                /* حذف کادر سبز رنگ */
            }
            
            /* استایل برای کانتینر پیام */
            .telegram-message-container {
                position: relative;
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                width: 100%;
            }
            
            /* استایل برای پیام‌های دریافتی */
            .telegram-message-container.incoming {
                flex-direction: row;
                justify-content: flex-end;
            }
            
            /* استایل برای پیام‌های ارسالی */
            .telegram-message-container.outgoing {
                flex-direction: row-reverse;
                justify-content: flex-end;
            }
            
            /* استایل برای دکمه پاسخ */
            .telegram-reply-btn {
                width: 24px;
                height: 24px;
                min-width: 24px;
                border-radius: 50%;
                background-color: rgba(128, 128, 128, 0.1);
                  border: 1px solidrgba(128, 128, 128, 0);
                color:rgba(128, 128, 128, 0.51);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                opacity: 0.5;
                transition: all 0.3s ease;
                flex-shrink: 0;
                font-size: 12px;
                position: absolute;
                z-index: 1;
            }
            
            /* استایل برای دکمه پاسخ در پیام‌های متنی */
            .telegram-message-content {
                position: relative;
            }
            
            /* آیکون ریپلای در پیام‌های دریافتی */
            .telegram-message.telegram-message-incoming .telegram-reply-btn i {
                transform: scaleX(-1);
            }
            
            /* دکمه پاسخ برای پیام‌های متنی دریافتی */
            .telegram-message.telegram-message-incoming .telegram-message-content .telegram-reply-btn {
                right: -31px;
                left: auto;
                top: 50%;
                transform: translateY(-50%);
            }
            
            /* دکمه پاسخ برای پیام‌های متنی ارسالی */
            .telegram-message.telegram-message-outgoing .telegram-message-content .telegram-reply-btn {
                left: -31px;
                right: auto;
                top: 50%;
                transform: translateY(-50%);
            }
            
            /* دکمه پاسخ برای پیام‌های ضمیمه دریافتی */
            .telegram-message.telegram-message-incoming .telegram-file-box .telegram-reply-btn,
            .telegram-message.telegram-message-incoming .telegram-attachment-item .telegram-reply-btn,
            .telegram-message.telegram-message-incoming .telegram-attachment-item-standalone .telegram-reply-btn {
                right: -31px;
                left: auto;
                top: 50%;
                transform: translateY(-50%);
                z-index: 100000;
            }
            
            /* دکمه پاسخ برای پیام‌های ضمیمه ارسالی */
            .telegram-message.telegram-message-outgoing .telegram-file-box .telegram-reply-btn,
            .telegram-message.telegram-message-outgoing .telegram-attachment-item .telegram-reply-btn,
            .telegram-message.telegram-message-outgoing .telegram-attachment-item-standalone .telegram-reply-btn {
                left: -31px;
                right: auto;
                top: 50%;
                transform: translateY(-50%);
                z-index: 100!important;
            }
            
            /* تغییر استایل دکمه پاسخ هنگام هاور */
            .telegram-reply-btn:hover,
            .telegram-reply-btn.active {
                background-color: #0F9D58;
                color: white;
                transform: translateY(-50%) scale(1.1);
                opacity: 1;
                border-color: #0F9D58;
            }
            
            /* تغییر استایل دکمه پاسخ هنگام هاور در پیام‌های دریافتی */
            .telegram-message.telegram-message-incoming .telegram-reply-btn:hover i {
                transform: scaleX(-1);
            }
            
            /* استایل برای نمایش پیام انتخاب شده برای پاسخ */
            .telegram-reply-preview {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                background-color: #2A2F3E;
                border-radius: 12px;
                position: absolute;
                top: -45px;
                left: 10px;
                right: 10px;
                z-index: 100000000;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .telegram-reply-preview-content {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 13px;
                color: #9AA0B5;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .telegram-reply-preview-content i {
                color: #0F9D58;
                font-size: 14px;
            }
            
            .telegram-reply-preview-close {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: transparent;
                color: #9AA0B5;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 5px;
                transition: all 0.2s ease;
                padding: 0;
            }
            
            .telegram-reply-preview-close:hover {
                background-color: rgba(154, 160, 181, 0.1);
                color: #ffffff;
            }
            
            /* استایل برای نمایش پیام‌های پاسخ داده شده */
            .telegram-replied-message {
                padding: 5px 10px;
                background-color: rgba(15, 157, 88, 0.1);
                border-right: 3px solid #0F9D58;
                margin-bottom: 5px;
                border-radius: 5px;
                font-size: 12px;
                color: #9AA0B5;
                cursor: pointer;
            }
            
            /* استایل برای کانتینر ورودی */
            .telegram-input-wrapper {
                position: relative;
                display: flex;
                align-items: flex-end;
            }
            
            /* استایل برای آیکون‌های فوتر */
            .telegram-input-wrapper .telegram-footer-icons {
                position: relative;
                z-index: 2;
            }
        `;
    document.head.appendChild(styleElement);
  }

  /**
   * تنظیم رویدادهای مربوط به قابلیت پاسخ
   */
  function setupReplyEvents() {
    // رویداد کلیک برای انتخاب پیام برای پاسخ
    document.addEventListener("click", function (event) {
      // بررسی کلیک روی دکمه پاسخ
      if (event.target.closest(".telegram-reply-btn")) {
        console.log("کلیک روی دکمه پاسخ انجام شد");
        const replyBtn = event.target.closest(".telegram-reply-btn");
        // یافتن پیام مرتبط با دکمه پاسخ
        const messageElement = findParentMessage(replyBtn);

        if (messageElement) {
          console.log("پیام مرتبط یافت شد:", messageElement);
          selectMessageForReply(messageElement);
          event.stopPropagation(); // جلوگیری از انتشار رویداد به المنت‌های والد
        } else {
          console.warn("پیام مرتبط با دکمه پاسخ یافت نشد");
        }
      }

      // بررسی کلیک روی دکمه بستن پیش‌نمایش پاسخ
      if (event.target.closest(".telegram-reply-preview-close")) {
        cancelReply();
        event.stopPropagation();
      }

      // بررسی کلیک روی پیام پاسخ داده شده برای پیدا کردن پیام اصلی
      if (event.target.closest(".telegram-replied-message")) {
        const repliedMessageId = event.target.closest(
          ".telegram-replied-message"
        ).dataset.originalMessageId;
        if (repliedMessageId) {
          scrollToMessage(repliedMessageId);
          event.stopPropagation();
        }
      }
    });

    // هوک کردن تابع sendMessage برای اضافه کردن شناسه پیام پاسخ داده شده
    if (typeof window.sendMessage === "function") {
      const originalSendMessage = window.sendMessage;
      window.sendMessage = function () {
        // اگر پیامی برای پاسخ انتخاب شده باشد، شناسه آن را ذخیره می‌کنیم
        if (selectedMessageForReply) {
          console.log("ارسال پیام با پاسخ به:", selectedMessageForReply.id);
          // ذخیره شناسه پیام اصلی برای استفاده در API
          window.replyToMessageId = selectedMessageForReply.id;
        }

        // فراخوانی تابع اصلی ارسال پیام
        originalSendMessage.apply(this, arguments);

        // پاک کردن پیش‌نمایش پاسخ و شناسه پیام پاسخ داده شده
        cancelReply();
      };
    } else {
      console.warn("تابع sendMessage یافت نشد، هوک کردن به تأخیر افتاد");

      // تلاش مجدد بعد از 1 ثانیه
      setTimeout(function () {
        if (typeof window.sendMessage === "function") {
          const originalSendMessage = window.sendMessage;
          window.sendMessage = function () {
            // اگر پیامی برای پاسخ انتخاب شده باشد، شناسه آن را ذخیره می‌کنیم
            if (selectedMessageForReply) {
              // ذخیره شناسه پیام اصلی برای استفاده در API
              window.replyToMessageId = selectedMessageForReply.id;
            }

            // فراخوانی تابع اصلی ارسال پیام
            originalSendMessage.apply(this, arguments);

            // پاک کردن پیش‌نمایش پاسخ و شناسه پیام پاسخ داده شده
            cancelReply();
          };
          console.log("تابع sendMessage با موفقیت هوک شد");
        }
      }, 1000);
    }

    // اضافه کردن دکمه پاسخ به پیام‌های موجود و اسکرول به پایین
    setTimeout(function () {
      wrapExistingMessages();
      // بعد از اضافه کردن کانتینرها، اسکرول به پایین انجام می‌شود
      // safeScrollToBottom(500);
    }, 500);

    // هوک کردن تابع renderMessages برای اضافه کردن دکمه پاسخ به پیام‌های جدید
    hookRenderMessages();

    // اضافه کردن رویداد برای باز شدن چت
    const chatIcon = document.getElementById("telegramChatIcon");
    if (chatIcon) {
      chatIcon.addEventListener("click", function () {
        // اضافه کردن دکمه‌های پاسخ با تأخیر بعد از باز شدن چت
        setTimeout(function () {
          wrapExistingMessages();
          // اسکرول به پایین چت بعد از باز شدن
          // safeScrollToBottom(500);
        }, 1000);
      });
    }

    // اضافه کردن رویداد برای کلیک روی مکالمات
    document.querySelectorAll(".telegram-conversation-item").forEach((item) => {
      item.addEventListener("click", function () {
        // پاک کردن پیش‌نمایش ریپلای قبل از تغییر چت
        cancelReply();

        // اضافه کردن دکمه‌های پاسخ با تأخیر بعد از باز شدن مکالمه
        setTimeout(function () {
          wrapExistingMessages();
        }, 1000);
      });
    });
  }

  /**
   * تنظیم MutationObserver برای شناسایی پیام‌های جدید
   */
  function setupMutationObserver() {
    // انتخاب المنت چت باکس
    const chatBody = document.getElementById("telegramChatBody");
    if (!chatBody) {
      console.warn("المنت telegramChatBody یافت نشد");
      return;
    }

    // تنظیم MutationObserver
    const observer = new MutationObserver(function (mutations) {
      let hasNewMessages = false;

      mutations.forEach(function (mutation) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          hasNewMessages = true;
          // اضافه کردن دکمه‌های پاسخ به پیام‌های جدید
          wrapExistingMessages();
        }
      });

      // فقط اگر پیام جدیدی اضافه شده باشد، اسکرول به پایین انجام می‌شود
      if (hasNewMessages) {
        // safeScrollToBottom(300);
      }
    });

    // شروع مشاهده تغییرات
    observer.observe(chatBody, { childList: true, subtree: true });
  }

  /**
   * یافتن پیام والد برای یک المنت
   * @param {HTMLElement} element - المنت فرزند
   * @returns {HTMLElement|null} - المنت پیام والد یا null
   */
  function findParentMessage(element) {
    // بررسی اینکه آیا خود المنت یک پیام است
    if (element.classList && element.classList.contains("telegram-message")) {
      return element;
    }

    // جستجوی والد با کلاس telegram-message
    let parent = element.parentElement;
    while (parent) {
      if (parent.classList && parent.classList.contains("telegram-message")) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return null;
  }

  /**
   * انتخاب پیام برای پاسخ
   * @param {HTMLElement} messageElement - المنت پیام انتخاب شده
   */
  function selectMessageForReply(messageElement) {
    // حذف کلاس active از همه دکمه‌های ریپلای
    document.querySelectorAll(".telegram-reply-btn.active").forEach((btn) => {
      btn.classList.remove("active");
    });

    // اضافه کردن کلاس active به دکمه ریپلای پیام انتخاب شده
    const replyBtn = messageElement.querySelector(".telegram-reply-btn");
    if (replyBtn) {
      replyBtn.classList.add("active");
    }

    // حذف کلاس selected-for-reply از همه پیام‌ها
    document
      .querySelectorAll(".telegram-message.selected-for-reply")
      .forEach((msg) => {
        msg.classList.remove("selected-for-reply");
      });

    // اضافه کردن کلاس selected-for-reply به پیام انتخاب شده
    messageElement.classList.add("selected-for-reply");

    // استخراج اطلاعات پیام
    const messageId = messageElement.dataset.messageId;
    let messageText = "";
    let fileType = "text"; // نوع پیش‌فرض

    // تلاش برای یافتن متن پیام
    const messageBody = messageElement.querySelector(".telegram-message-body");
    if (messageBody) {
      messageText = messageBody.textContent.trim();
    } else {
      // اگر پیام متنی نیست، سعی می‌کنیم نوع پیام را تشخیص دهیم
      const fileBox = messageElement.querySelector(".telegram-file-box");
      const attachmentItem =
        messageElement.querySelector(".telegram-attachment-item") ||
        messageElement.querySelector(".telegram-attachment-item-standalone");

      if (fileBox) {
        const fileName = fileBox.querySelector(".telegram-file-name");
        messageText = fileName ? fileName.textContent.trim() : "";

        // تشخیص نوع فایل
        if (
          fileBox.querySelector("audio") ||
          fileBox.querySelector(".audio-player") ||
          fileBox.classList.contains("audio-file")
        ) {
          fileType = "audio";
          messageText = messageText || "فایل صوتی";
          messageText = "🎵 " + messageText;
        } else if (
          fileBox.querySelector("video") ||
          fileBox.querySelector(".video-player") ||
          fileBox.classList.contains("video-file")
        ) {
          fileType = "video";
          messageText = messageText || "فایل ویدیویی";
          messageText = "🎥 " + messageText;
        } else if (
          fileBox.querySelector("img") ||
          fileBox.classList.contains("image-file")
        ) {
          fileType = "image";
          messageText = messageText || "تصویر";
          messageText = "🖼️ " + messageText;
        } else {
          fileType = "file";
          messageText = messageText || "فایل پیوست";
          messageText = "📎 " + messageText;
        }
      } else if (attachmentItem) {
        const fileName =
          attachmentItem.querySelector(".telegram-attachment-name") ||
          attachmentItem.querySelector(".telegram-file-name") ||
          attachmentItem.querySelector(".file-name");
        messageText = fileName ? fileName.textContent.trim() : "";

        // تشخیص نوع فایل
        if (
          attachmentItem.querySelector("img") ||
          attachmentItem.classList.contains("image-attachment")
        ) {
          fileType = "image";
          messageText = messageText || "تصویر";
          messageText = "🖼️ " + messageText;
        } else if (
          attachmentItem.querySelector("audio") ||
          attachmentItem.classList.contains("audio-attachment")
        ) {
          fileType = "audio";
          messageText = messageText || "فایل صوتی";
          messageText = "🎵 " + messageText;
        } else if (
          attachmentItem.querySelector("video") ||
          attachmentItem.classList.contains("video-attachment")
        ) {
          fileType = "video";
          messageText = messageText || "فایل ویدیویی";
          messageText = "🎥 " + messageText;
        } else {
          fileType = "file";
          messageText = messageText || "فایل پیوست";
          messageText = "📎 " + messageText;
        }
      } else {
        messageText = "پیام بدون متن";
      }
    }

    // ذخیره اطلاعات پیام انتخاب شده
    selectedMessageForReply = {
      id: messageId,
      text: messageText,
      previewText:
        messageText.length > 30
          ? messageText.substring(0, 30) + "..."
          : messageText,
      fileType: fileType,
    };

    // تنظیم متغیر جهانی replyToMessageId برای استفاده در API
    window.replyToMessageId = messageId;

    // نمایش پیش‌نمایش پاسخ
    showReplyPreview(selectedMessageForReply);
  }

  /**
   * نمایش پیش‌نمایش پیام انتخاب شده برای پاسخ
   * @param {Object} messageInfo - اطلاعات پیام انتخاب شده
   */
  function showReplyPreview(messageInfo) {
    // حذف پیش‌نمایش قبلی اگر وجود دارد
    const existingPreview = document.querySelector(".telegram-reply-preview");
    if (existingPreview) {
      existingPreview.remove();
    }

    // ایجاد المنت پیش‌نمایش پاسخ
    const previewElement = document.createElement("div");
    previewElement.className = "telegram-reply-preview";
    previewElement.innerHTML = `
                        <div class="telegram-reply-preview-content">

                <i class="fa-solid fa-reply"></i> ${messageInfo.previewText}
            </div>
            <button class="telegram-reply-preview-close">
                <i class="fa-solid fa-times"></i>
            </button>
        `;

    // افزودن پیش‌نمایش به بالای فیلد ورودی
    const inputWrapper = document.querySelector(".telegram-input-wrapper");
    if (inputWrapper) {
      inputWrapper.insertBefore(previewElement, inputWrapper.firstChild);
    }

    // تمرکز روی فیلد ورودی
    const inputElement = document.getElementById("telegramInput");
    if (inputElement) {
      inputElement.focus();
    }
  }

  /**
   * لغو پاسخ به پیام
   */
  function cancelReply() {
    // حذف کلاس active از همه دکمه‌های ریپلای
    document.querySelectorAll(".telegram-reply-btn.active").forEach((btn) => {
      btn.classList.remove("active");
    });

    // حذف کلاس selected-for-reply از همه پیام‌ها
    document
      .querySelectorAll(".telegram-message.selected-for-reply")
      .forEach((msg) => {
        msg.classList.remove("selected-for-reply");
      });

    // حذف پیش‌نمایش پاسخ
    const replyPreview = document.querySelector(".telegram-reply-preview");
    if (replyPreview) {
      replyPreview.remove();
    }

    // پاک کردن اطلاعات پیام انتخاب شده
    selectedMessageForReply = null;
    window.replyToMessageId = null;
  }

  /**
   * اسکرول به پیام با شناسه مشخص
   * @param {string} messageId - شناسه پیام
   */
  function scrollToMessage(messageId) {
    const messageElement = document.querySelector(
      `.telegram-message[data-message-id="${messageId}"]`
    );
    if (messageElement) {
      // اسکرول به پیام با تأخیر برای اطمینان از رندر شدن
      setTimeout(() => {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }

  /**
   * پوشاندن پیام‌های موجود با کانتینر جدید و اضافه کردن دکمه پاسخ
   */
  function wrapExistingMessages() {
    // یافتن همه پیام‌ها
    const messages = document.querySelectorAll(
      ".telegram-message:not(.wrapped)"
    );

    messages.forEach((messageElement) => {
      messageElement.classList.add("wrapped");

      // ایجاد دکمه پاسخ
      const replyButton = document.createElement("button");
      replyButton.className = "telegram-reply-btn";
      replyButton.innerHTML = '<i class="fa-solid fa-reply"></i>';
      replyButton.title = "پاسخ به این پیام";

      // بررسی نوع پیام و افزودن دکمه پاسخ به محل مناسب
      const fileBox = messageElement.querySelector(".telegram-file-box");
      const attachmentItem =
        messageElement.querySelector(".telegram-attachment-item") ||
        messageElement.querySelector(".telegram-attachment-item-standalone");
      const messageContent = messageElement.querySelector(
        ".telegram-message-content"
      );

      if (fileBox) {
        // اگر پیام دارای فایل باکس است
        fileBox.appendChild(replyButton);
      } else if (attachmentItem) {
        // اگر پیام دارای آیتم ضمیمه است
        attachmentItem.appendChild(replyButton);
      } else if (messageContent) {
        // اگر پیام متنی است
        messageContent.appendChild(replyButton);
      }
    });
  }

  /**
   * هوک کردن تابع renderMessages برای اضافه کردن دکمه پاسخ به پیام‌های جدید
   */
  function hookRenderMessages() {
    // تلاش برای هوک کردن تابع renderMessages
    if (typeof window.renderMessages === "function") {
      //('تابع renderMessages یافت شد، در حال هوک کردن...');

      // ذخیره تابع اصلی
      const originalRenderMessages = window.renderMessages;

      // جایگزینی تابع با نسخه جدید
      window.renderMessages = function () {
        // پاک کردن پیش‌نمایش ریپلای قبل از رندر پیام‌های جدید
        cancelReply();

        // فراخوانی تابع اصلی
        originalRenderMessages.apply(this, arguments);

        //('تابع renderMessages اجرا شد، در حال اضافه کردن دکمه‌های پاسخ...');

        // اضافه کردن دکمه پاسخ به پیام‌های جدید با تأخیر
        setTimeout(function () {
          wrapExistingMessages();
          processRepliedMessages();
          // استفاده از مدیریت اسکرول جدید
          window.telegramScrollManager.scrollToBottom();
        }, 100);
      };

      //('تابع renderMessages با موفقیت هوک شد');
    } else {
      console.warn("تابع renderMessages یافت نشد، هوک کردن به تأخیر افتاد");

      // تلاش مجدد بعد از 1 ثانیه
      setTimeout(function () {
        if (typeof window.renderMessages === "function") {
          const originalRenderMessages = window.renderMessages;
          window.renderMessages = function () {
            // پاک کردن پیش‌نمایش ریپلای قبل از رندر پیام‌های جدید
            cancelReply();

            // فراخوانی تابع اصلی
            originalRenderMessages.apply(this, arguments);

            // اضافه کردن دکمه پاسخ به پیام‌های جدید با تأخیر
            setTimeout(function () {
              wrapExistingMessages();
              processRepliedMessages();
              // استفاده از مدیریت اسکرول جدید
              window.telegramScrollManager.scrollToBottom();
            }, 100);
          };
          //('تابع renderMessages با موفقیت هوک شد (تلاش دوم)');
        }
      }, 1000);
    }
  }

  /**
   * پردازش و نمایش پیام‌های پاسخ داده شده
   */
  function processRepliedMessages() {
    document
      .querySelectorAll(".telegram-message-body")
      .forEach((messageBody) => {
        const messageText = messageBody.textContent;

        // بررسی اینکه آیا پیام با "پاسخ به:" شروع می‌شود
        if (messageText.startsWith("پاسخ به:")) {
          // استخراج متن پاسخ داده
          const replyEndIndex = messageText.indexOf("\n\n");
          if (replyEndIndex !== -1) {
            const repliedText = messageText
              .substring("پاسخ به:".length, replyEndIndex)
              .trim();
            const actualMessage = messageText.substring(replyEndIndex + 2);

            // ایجاد المنت پیام پاسخ داده شده
            const repliedElement = document.createElement("div");
            repliedElement.className = "telegram-replied-message";
            repliedElement.textContent = repliedText;

            // جایگزینی محتوای پیام
            messageBody.textContent = actualMessage;

            // افزودن المنت پیام پاسخ داده شده قبل از متن اصلی
            messageBody.parentNode.insertBefore(repliedElement, messageBody);
          }
        }
      });
  }
});

// اضافه کردن تابع برای ارسال پیام با اطلاعات پاسخ به API
(function () {
  // ذخیره تابع اصلی $.ajax
  const originalAjax = $.ajax;

  // جایگزینی تابع با نسخه جدید
  $.ajax = function (options) {
    // بررسی اینکه آیا درخواست برای ارسال پیام است
    if (options.url === "/api/send-message" && options.type === "POST") {
      // اگر شناسه پیام برای پاسخ وجود دارد، آن را به FormData اضافه می‌کنیم
      if (window.replyToMessageId) {
        // دسترسی به FormData
        const formData = options.data;

        // اضافه کردن شناسه پیام پاسخ داده شده به FormData با نام reply_to_id
        formData.append("reply_to_id", window.replyToMessageId);

        //('شناسه پیام پاسخ داده شده به درخواست اضافه شد:', window.replyToMessageId);
      }
    }

    // فراخوانی تابع اصلی
    return originalAjax.apply(this, arguments);
  };
})();
