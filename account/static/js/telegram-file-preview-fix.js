/**
 * فایل اصلاح کننده نمایش پیش‌نمایش فایل در چت تلگرام
 * این فایل برای هماهنگی نمایش پنل زمان‌بندی با انواع مختلف محتوا ایجاد شده است
 */

document.addEventListener("DOMContentLoaded", function () {
  //('فایل telegram-file-preview-fix.js بارگذاری شد');

  // تعریف تابع updateUIAfterSend به صورت جهانی برای به‌روزرسانی سریع رابط کاربری بعد از ارسال پیام
  window.updateUIAfterSend = function (response) {
    //('تابع updateUIAfterSend فراخوانی شد');

    try {
      // بازگرداندن سریع فوتر به حالت ورودی
      const filePreview = document.getElementById("filePreview");
      if (filePreview) {
        filePreview.style.display = "none";
        //('پیش‌نمایش فایل مخفی شد');

        // حذف کامل عنصر filePreview برای بازسازی کامل
        if (filePreview.parentNode) {
          filePreview.parentNode.removeChild(filePreview);
          //('عنصر filePreview به طور کامل حذف شد');
        }
      }

      // حذف کلاس file-preview-active از عنصر والد
      const inputContainer = document.querySelector(
        ".telegram-input-container"
      );
      if (inputContainer) {
        inputContainer.classList.remove("file-preview-active");
        inputContainer.classList.remove("recording-active");
        //('کلاس‌های اضافی از عنصر والد حذف شد');
      }

      // مخفی کردن پنل زمان‌بندی
      const schedulePanel = document.getElementById("schedulePanel");
      if (schedulePanel) {
        schedulePanel.style.display = "none";
        //('پنل زمان‌بندی مخفی شد');
      }

      // مخفی کردن پنل ضبط صدا
      const voiceRecorder = document.getElementById("voiceRecorder");
      if (voiceRecorder) {
        voiceRecorder.style.display = "none";
        //('پنل ضبط صدا مخفی شد');
      }

      // نمایش مجدد فیلد ورودی متن
      const telegramInput = document.getElementById("telegramInput");
      if (telegramInput) {
        telegramInput.style.display = "block";
        telegramInput.value = "";
        //('فیلد ورودی متن نمایش داده شد و پاک شد');
      }

      // نمایش مجدد آیکون‌های میکروفون و سنجاق
      const microphoneIcon = document.getElementById("recordVoiceBtn");
      if (microphoneIcon) {
        microphoneIcon.style.display = "";
        //('آیکون میکروفون به حالت عادی برگشت');
      }

      const attachmentIcon = document.getElementById("attachFileBtn");
      if (attachmentIcon) {
        attachmentIcon.style.display = "";
        //('آیکون سنجاق به حالت عادی برگشت');
      }

      // بازگرداندن همه آیکون‌ها و دکمه‌ها به حالت پیش‌فرض
      const allIcons = document.querySelectorAll(
        ".telegram-input-icon, .telegram-option-btn"
      );
      allIcons.forEach((icon) => {
        icon.style.display = "";
        //('آیکون به حالت عادی برگشت:', icon.id || 'بدون شناسه');
      });

      // بازگرداندن فوتر به حالت اصلی
      const telegramFooter = document.querySelector(".telegram-footer");
      if (telegramFooter) {
        telegramFooter.classList.remove("file-preview-active");
        telegramFooter.classList.remove("voice-recorder-active");
        //('کلاس‌های اضافی از فوتر حذف شدند');
      }

      // نمایش مجدد گزینه‌های ورودی فقط اگر در چت فعال هستیم
      const inputOptions = document.querySelector(".telegram-input-options");
      if (inputOptions) {
        const chatContainer = document.getElementById("telegramChatContainer");
        const isInActiveChat =
          chatContainer &&
          chatContainer.classList.contains("telegram-container-active");

        if (isInActiveChat) {
          inputOptions.style.display = "flex";
          //('گزینه‌های ورودی نمایش داده شدند (در چت فعال)');
        } else {
          inputOptions.style.display = "none";
          //('گزینه‌های ورودی مخفی شدند (در لیست گفتگوها)');
        }
      }

      // نمایش مجدد دکمه ارسال اصلی
      const sendButton = document.getElementById("telegramSendBtn");
      if (sendButton) {
        sendButton.style.display = "";
        //('دکمه ارسال اصلی نمایش داده شد');
      }

      // نمایش مجدد دکمه‌های ارسال با کلاس telegram-send-btn
      const allSendButtons = document.querySelectorAll(".telegram-send-btn");
      allSendButtons.forEach((btn) => {
        btn.style.display = "";
        //('دکمه ارسال با کلاس telegram-send-btn نمایش داده شد');
      });

      // حذف استایل مخفی کردن اجباری دکمه ارسال
      const hideStyle = document.getElementById("hide-send-btn-style");
      if (hideStyle) {
        hideStyle.remove();
        //('استایل مخفی کردن اجباری دکمه ارسال حذف شد');
      }

      // پاک کردن متغیرهای جهانی
      window.selectedFile = null;
      window.scheduledTime = null;
      window.recordedAudio = null;
      window.fileToSend = null;

      // حذف دکمه ارسال مخصوص پیش‌نمایش فایل
      const sendFileBtn = document.getElementById("sendFileBtn");
      if (sendFileBtn) {
        sendFileBtn.remove();
        //('دکمه ارسال فایل حذف شد');
      }

      // بازسازی کامل فوتر و عناصر آن
      window.rebuildFooter();

      // بارگذاری مجدد گفتگوها
      if (typeof window.loadConversations === "function") {
        window.loadConversations();
      }

      //('رابط کاربری با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error("خطا در تابع updateUIAfterSend:", error);
    }
  };

  // تابع بازسازی کامل فوتر و عناصر آن
  window.rebuildFooter = function () {
    //('شروع بازسازی کامل فوتر...');

    try {
      // ذخیره اطلاعات فوتر اصلی
      const originalFooter = document.querySelector(".telegram-footer");
      if (!originalFooter) {
        console.error("فوتر اصلی یافت نشد!");
        return false;
      }

      // ذخیره اطلاعات مهم فوتر
      const footerParent = originalFooter.parentNode;
      const footerHTML = originalFooter.outerHTML;
      const footerClassName = originalFooter.className;

      // حذف فوتر قدیمی
      originalFooter.remove();
      //('فوتر قدیمی حذف شد');

      // ایجاد فوتر جدید
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = footerHTML;
      const newFooter = tempContainer.firstChild;

      // اضافه کردن فوتر جدید به DOM
      if (footerParent) {
        footerParent.appendChild(newFooter);
        //('فوتر جدید به DOM اضافه شد');
      } else {
        document.body.appendChild(newFooter);
        //('فوتر جدید به body اضافه شد');
      }

      // بازسازی فیلد ورودی فایل
      window.resetFileUploadSystem();

      // بازسازی رویدادهای فوتر
      setupFooterEvents();

      //('بازسازی کامل فوتر با موفقیت انجام شد');
      return true;
    } catch (error) {
      console.error("خطا در بازسازی فوتر:", error);
      return false;
    }
  };

  // تابع راه‌اندازی رویدادهای فوتر
  function setupFooterEvents() {
    //('راه‌اندازی رویدادهای فوتر...');

    try {
      // بازسازی رویداد دکمه ارسال
      const sendButton = document.getElementById("telegramSendBtn");
      if (sendButton) {
        // حذف رویدادهای قبلی
        const newSendButton = sendButton.cloneNode(true);
        if (sendButton.parentNode) {
          sendButton.parentNode.replaceChild(newSendButton, sendButton);
        }

        // اضافه کردن رویداد جدید
        newSendButton.addEventListener("click", function (event) {
          //('کلیک روی دکمه ارسال');
          if (typeof window.sendMessage === "function") {
            window.sendMessage();
          }
        });
        //('رویداد دکمه ارسال بازسازی شد');
      }

      // بازسازی رویداد دکمه ایموجی
      const emojiButton = document.getElementById("emojiPickerBtn");
      if (emojiButton) {
        // حذف رویدادهای قبلی
        const newEmojiButton = emojiButton.cloneNode(true);
        if (emojiButton.parentNode) {
          emojiButton.parentNode.replaceChild(newEmojiButton, emojiButton);
        }

        // اضافه کردن رویداد جدید
        newEmojiButton.addEventListener("click", function (event) {
          //('کلیک روی دکمه ایموجی');
          if (typeof window.toggleEmojiPicker === "function") {
            window.toggleEmojiPicker();
          }
        });
        //('رویداد دکمه ایموجی بازسازی شد');
      }

      // بازسازی رویداد دکمه ضبط صدا
      const recordVoiceBtn = document.getElementById("recordVoiceBtn");
      if (recordVoiceBtn) {
        // حذف رویدادهای قبلی
        const newRecordVoiceBtn = recordVoiceBtn.cloneNode(true);
        if (recordVoiceBtn.parentNode) {
          recordVoiceBtn.parentNode.replaceChild(
            newRecordVoiceBtn,
            recordVoiceBtn
          );
        }

        // اضافه کردن رویداد جدید
        newRecordVoiceBtn.addEventListener("click", function (event) {
          //('کلیک روی دکمه ضبط صدا');
          if (typeof window.startVoiceRecording === "function") {
            window.startVoiceRecording();
          }
        });
        //('رویداد دکمه ضبط صدا بازسازی شد');
      }

      // بازسازی رویداد فیلد ورودی متن
      const telegramInput = document.getElementById("telegramInput");
      if (telegramInput) {
        // حذف رویدادهای قبلی
        const newTelegramInput = telegramInput.cloneNode(true);
        if (telegramInput.parentNode) {
          telegramInput.parentNode.replaceChild(
            newTelegramInput,
            telegramInput
          );
        }

        // اضافه کردن رویدادهای جدید
        newTelegramInput.addEventListener("input", function (event) {
          if (typeof window.adjustInputHeight === "function") {
            window.adjustInputHeight(this);
          }

          // نمایش/مخفی کردن دکمه ارسال بر اساس محتوای ورودی
          const sendButton = document.getElementById("telegramSendBtn");
          if (sendButton) {
            if (this.value.trim() !== "") {
              sendButton.style.display = "flex";

              // مخفی کردن دکمه میکروفون
              const micButton = document.getElementById("recordVoiceBtn");
              if (micButton) micButton.style.display = "none";
            } else {
              // اگر در حالت پیش‌نمایش فایل نیستیم
              const filePreview = document.getElementById("filePreview");
              if (!filePreview || filePreview.style.display === "none") {
                sendButton.style.display = "none";

                // نمایش مجدد دکمه میکروفون
                const micButton = document.getElementById("recordVoiceBtn");
                if (micButton) micButton.style.display = "";
              }
            }
          }
        });

        // رویداد کلید Enter
        newTelegramInput.addEventListener("keydown", function (event) {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (typeof window.sendMessage === "function") {
              window.sendMessage();
            }
          }
        });

        //('رویدادهای فیلد ورودی متن بازسازی شد');
      }

      //('تمام رویدادهای فوتر با موفقیت راه‌اندازی شد');
      return true;
    } catch (error) {
      console.error("خطا در راه‌اندازی رویدادهای فوتر:", error);
      return false;
    }
  }

  // تابع بازنشانی کامل سیستم آپلود فایل
  window.resetFileUploadSystem = function () {
    //('بازنشانی کامل سیستم آپلود فایل...');

    try {
      // حذف کامل فیلد ورودی فایل و ایجاد مجدد آن
      const oldFileInput = document.getElementById("fileInput");
      if (oldFileInput) {
        // ذخیره ویژگی‌های اصلی
        const fileInputAccept =
          oldFileInput.accept || "image/*,audio/*,video/*,.pdf,.docx,.xlsx";
        const fileInputParent = oldFileInput.parentNode;

        if (fileInputParent) {
          // ایجاد یک المنت جدید قبل از حذف المنت قدیمی
          const newFileInput = document.createElement("input");
          newFileInput.type = "file";
          newFileInput.id = "fileInput";
          newFileInput.style.display = "none";
          newFileInput.accept = fileInputAccept;

          // حذف رویدادهای قبلی با جایگزینی المنت
          oldFileInput.parentNode.replaceChild(newFileInput, oldFileInput);
          //('فیلد ورودی فایل به طور کامل بازسازی شد');

          // اضافه کردن رویداد به المنت جدید
          newFileInput.addEventListener("change", function (e) {
            //('رویداد change فیلد ورودی فایل فراخوانی شد');
            if (e.target.files.length > 0) {
              window.selectedFile = e.target.files[0];
              //('فایل انتخاب شد:', window.selectedFile.name);

              if (typeof window.showFilePreview === "function") {
                window.showFilePreview(window.selectedFile);
              } else {
                console.error("تابع showFilePreview یافت نشد!");
              }

              // ممانعت از ریست اطلاعات چت
              e.stopPropagation();
            }
          });
        }
      } else {
        console.warn("فیلد ورودی فایل یافت نشد! در حال ایجاد...");

        // ایجاد یک فیلد ورودی فایل جدید اگر وجود نداشته باشد
        const newFileInput = document.createElement("input");
        newFileInput.type = "file";
        newFileInput.id = "fileInput";
        newFileInput.style.display = "none";
        newFileInput.accept = "image/*,audio/*,video/*,.pdf,.docx,.xlsx";

        // اضافه کردن به بدنه سند
        document.body.appendChild(newFileInput);
        //('فیلد ورودی فایل جدید ایجاد شد');

        // اضافه کردن رویداد به المنت جدید
        newFileInput.addEventListener("change", function (e) {
          //('رویداد change فیلد ورودی فایل فراخوانی شد');
          if (e.target.files.length > 0) {
            window.selectedFile = e.target.files[0];
            //('فایل انتخاب شد:', window.selectedFile.name);

            if (typeof window.showFilePreview === "function") {
              window.showFilePreview(window.selectedFile);
            } else {
              console.error("تابع showFilePreview یافت نشد!");
            }

            // ممانعت از ریست اطلاعات چت
            e.stopPropagation();
          }
        });
      }

      // بازسازی دکمه اتصال فایل
      const oldAttachFileBtn = document.getElementById("attachFileBtn");
      if (oldAttachFileBtn) {
        // ذخیره ویژگی‌های اصلی
        const btnClass = oldAttachFileBtn.className;
        const btnTitle = oldAttachFileBtn.title || "افزودن فایل";
        const btnInnerHTML = oldAttachFileBtn.innerHTML;

        // ایجاد یک المنت جدید
        const newAttachFileBtn = document.createElement("button");
        newAttachFileBtn.type = "button";
        newAttachFileBtn.className = btnClass;
        newAttachFileBtn.id = "attachFileBtn";
        newAttachFileBtn.title = btnTitle;
        newAttachFileBtn.innerHTML = btnInnerHTML;

        // حذف رویدادهای قبلی با جایگزینی المنت
        if (oldAttachFileBtn.parentNode) {
          oldAttachFileBtn.parentNode.replaceChild(
            newAttachFileBtn,
            oldAttachFileBtn
          );
          //('دکمه اتصال فایل به طور کامل بازسازی شد');

          // اضافه کردن رویداد کلیک به دکمه جدید
          newAttachFileBtn.addEventListener("click", function (event) {
            //('کلیک روی دکمه اتصال فایل');
            event.preventDefault();
            event.stopPropagation();

            // باز کردن دیالوگ انتخاب فایل
            const fileInput = document.getElementById("fileInput");
            if (fileInput) {
              //('تلاش برای باز کردن دیالوگ انتخاب فایل...');
              try {
                fileInput.value = ""; // پاک کردن مقدار قبلی
                fileInput.click();
              } catch (e) {
                console.error("خطا در باز کردن دیالوگ انتخاب فایل:", e);
              }
            } else {
              console.error("فیلد ورودی فایل یافت نشد!");
            }
          });
        }
      }

      // بازنشانی متغیرهای کنترلی دیالوگ فایل
      window.fileDialogLastOpened = 0;
      window.isFileDialogHandlerActive = false;

      //('سیستم آپلود فایل با موفقیت بازنشانی شد');
      return true;
    } catch (error) {
      console.error("خطا در بازنشانی سیستم آپلود فایل:", error);
      return false;
    }
  };

  // اضافه کردن رویداد برای کنترل نمایش آیکون‌ها در صفحه گفتگوها و چت فعال
  function updateInputOptionsVisibility() {
    const chatContainer = document.getElementById("telegramChatContainer");
    const inputOptions = document.querySelector(".telegram-input-options");

    if (chatContainer && inputOptions) {
      const isInActiveChat = chatContainer.classList.contains(
        "telegram-container-active"
      );

      if (isInActiveChat) {
        inputOptions.style.display = "flex";
        //('گزینه‌های ورودی نمایش داده شدند (در چت فعال)');
      } else {
        inputOptions.style.display = "none";
        //('گزینه‌های ورودی مخفی شدند (در لیست گفتگوها)');
      }
    }

    // بررسی و پاکسازی پیش‌نمایش فایل هنگام تغییر چت
    resetFilePreviewOnChatChange();
  }

  // تابع پاکسازی پیش‌نمایش فایل هنگام تغییر چت
  function resetFilePreviewOnChatChange() {
    const chatContainer = document.getElementById("telegramChatContainer");
    if (!chatContainer) return;

    // بررسی اگر در حالت لیست گفتگوها هستیم یا چت فعال تغییر کرده است
    const isInActiveChat = chatContainer.classList.contains(
      "telegram-container-active"
    );
    const filePreview = document.getElementById("filePreview");

    if (filePreview && filePreview.style.display === "flex") {
      // اگر در لیست گفتگوها هستیم یا چت تغییر کرده، پیش‌نمایش فایل را پاک کن
      console.log("پاکسازی پیش‌نمایش فایل هنگام تغییر چت");

      // پاک کردن فایل انتخاب شده
      window.selectedFile = null;
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";

      // مخفی کردن پیش‌نمایش فایل
      filePreview.style.display = "none";

      // حذف کلاس file-preview-active از عنصر والد
      const inputContainer = document.querySelector(
        ".telegram-input-container"
      );
      if (inputContainer) {
        inputContainer.classList.remove("file-preview-active");
      }

      // حذف دکمه ارسال مخصوص پیش‌نمایش فایل
      window.removeSendFileButton();

      // نمایش مجدد فیلد ورودی متن
      const telegramInput = document.getElementById("telegramInput");
      if (telegramInput) {
        telegramInput.style.display = "block";
      }

      // نمایش مجدد دکمه‌های ورودی
      showInputOptions();

      // بازنشانی وضعیت زمان‌بندی
      window.isScheduleActive = false;
      window.scheduledTime = null;
    }
  }

  // اجرای تابع در بارگذاری اولیه
  updateInputOptionsVisibility();

  // اضافه کردن رویداد به MutationObserver برای تشخیص تغییرات DOM
  const chatContainerObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        // فراخوانی تابع بدون تأخیر
        updateInputOptionsVisibility();
      }
    });
  });

  // شروع نظارت بر تغییرات کلاس در کانتینر اصلی
  const chatContainer = document.getElementById("telegramChatContainer");
  if (chatContainer) {
    chatContainerObserver.observe(chatContainer, { attributes: true });
  }

  // اضافه کردن رویداد کلیک به دکمه بازگشت - بدون تأخیر
  const backButton = document.getElementById("telegramBackBtn");
  if (backButton) {
    backButton.addEventListener("click", function () {
      // اجرای آنی تابع بدون تأخیر
      updateInputOptionsVisibility();
      // پاکسازی پیش‌نمایش فایل هنگام بازگشت به لیست گفتگوها
      resetFilePreviewOnChatChange();
    });
  }

  // اضافه کردن رویداد کلیک به آیتم‌های گفتگو - بدون تأخیر
  document.addEventListener("click", function (e) {
    if (e.target.closest(".telegram-conversation-item")) {
      // اجرای آنی تابع بدون تأخیر
      updateInputOptionsVisibility();
      // پاکسازی پیش‌نمایش فایل هنگام تغییر چت
      resetFilePreviewOnChatChange();
    }
  });

  // اضافه کردن رویداد به تغییر صفحه
  window.addEventListener("popstate", function () {
    updateInputOptionsVisibility();
    // پاکسازی پیش‌نمایش فایل هنگام تغییر صفحه
    resetFilePreviewOnChatChange();
  });

  // اضافه کردن CSS برای بهبود انیمیشن‌های تغییر وضعیت
  const styleElement = document.createElement("style");
  styleElement.textContent = `
        .telegram-input-options {
            transition: none !important;
        }
        .telegram-option-btn {
            transition: color 0.2s ease, transform 0.2s ease !important;
        }
    `;
  document.head.appendChild(styleElement);

  // متغیر کنترلی برای جلوگیری از باز شدن مجدد دیالوگ فایل
  let fileDialogLastOpened = 0;
  let isFileDialogHandlerActive = false;

  // متغیر برای کنترل وضعیت زمان‌بندی - به صورت جهانی تعریف می‌شود
  window.isScheduleActive = false;

  // تابع مخفی کردن اجباری دکمه ارسال در حالت پیش‌نمایش فایل
  window.forceHideSendButton = function () {
    if (window.selectedFile) {
      const filePreview = document.getElementById("filePreview");
      if (filePreview && filePreview.style.display === "flex") {
        // مخفی کردن دکمه ارسال اصلی
        const sendButton = document.getElementById("telegramSendBtn");
        if (sendButton) {
          sendButton.style.display = "none";
          //('دکمه ارسال اصلی مخفی شد (اجباری)');
        }

        // مخفی کردن همه دکمه‌های ارسال با کلاس telegram-send-btn
        const allSendButtons = document.querySelectorAll(".telegram-send-btn");
        allSendButtons.forEach((btn) => {
          btn.style.display = "none";
          //('دکمه ارسال با کلاس telegram-send-btn مخفی شد (اجباری)');
        });

        // اضافه کردن CSS برای مخفی کردن دکمه به صورت اجباری
        if (!document.getElementById("hide-send-btn-style")) {
          const style = document.createElement("style");
          style.id = "hide-send-btn-style";
          style.textContent = `
                        .telegram-send-btn, #telegramSendBtn {
                            display: none !important;
                            visibility: hidden !important;
                            opacity: 0 !important;
                            pointer-events: none !important;
                        }
                    `;
          document.head.appendChild(style);
          //('استایل مخفی کردن اجباری دکمه ارسال اضافه شد');
        }

        return true; // دکمه مخفی شد
      }
    }

    // اگر پیش‌نمایش فایل فعال نیست، استایل مخفی کردن اجباری را حذف کن
    const hideStyle = document.getElementById("hide-send-btn-style");
    if (hideStyle) {
      hideStyle.remove();
      //('استایل مخفی کردن اجباری دکمه ارسال حذف شد');
    }

    return false; // نیازی به مخفی کردن نبود
  };

  // تعریف تابع showFilePreview به صورت جهانی
  window.showFilePreview = function (file) {
    //('تابع showFilePreview فراخوانی شد با فایل:', file);

    if (!file) {
      console.error("هیچ فایلی انتخاب نشده است!");
      return;
    }

    // یافتن یا ایجاد عناصر مورد نیاز
    let filePreview = document.getElementById("filePreview");

    //('عنصر filePreview:', filePreview);

    // اگر عنصر filePreview وجود نداشت، آن را ایجاد می‌کنیم
    if (!filePreview) {
      //('عنصر filePreview یافت نشد. در حال ایجاد...');
      filePreview = document.createElement("div");
      filePreview.id = "filePreview";
      filePreview.className = "telegram-file-preview";

      // پیدا کردن محل مناسب برای اضافه کردن عنصر
      const inputContainer = document.querySelector(
        ".telegram-input-container"
      );
      if (inputContainer) {
        inputContainer.appendChild(filePreview);
        //('عنصر filePreview با موفقیت ایجاد شد');
      } else {
        console.error("محل مناسب برای اضافه کردن filePreview پیدا نشد");
        return;
      }
    }

    // بررسی وجود عنصر file-preview-info و ایجاد آن اگر وجود نداشت
    let filePreviewInfo = filePreview.querySelector(".file-preview-info");
    //('عنصر filePreviewInfo:', filePreviewInfo);

    if (!filePreviewInfo) {
      //('عنصر file-preview-info یافت نشد. در حال ایجاد...');
      filePreviewInfo = document.createElement("div");
      filePreviewInfo.className = "file-preview-info";
      filePreview.appendChild(filePreviewInfo);
      //('عنصر file-preview-info با موفقیت ایجاد شد');
    }

    // بررسی وجود دکمه حذف و ایجاد آن اگر وجود نداشت
    let removeFileBtn = filePreview.querySelector("#removeFileBtn");
    if (!removeFileBtn) {
      //('دکمه removeFileBtn یافت نشد. در حال ایجاد...');
      removeFileBtn = document.createElement("button");
      removeFileBtn.id = "removeFileBtn";
      removeFileBtn.className = "telegram-remove-file";
      removeFileBtn.innerHTML = '<i class="fa-solid fa-times"></i>';

      // بهبود استایل دکمه حذف
      removeFileBtn.style.width = "24px";
      removeFileBtn.style.height = "24px";
      removeFileBtn.style.borderRadius = "50%";
      removeFileBtn.style.backgroundColor = "#3A4053";
      removeFileBtn.style.color = "#fff";
      removeFileBtn.style.border = "none";
      removeFileBtn.style.display = "flex";
      removeFileBtn.style.alignItems = "center";
      removeFileBtn.style.justifyContent = "center";
      removeFileBtn.style.cursor = "pointer";
      removeFileBtn.style.fontSize = "12px";
      removeFileBtn.style.zIndex = "10";

      filePreview.appendChild(removeFileBtn);

      // اضافه کردن رویداد کلیک به دکمه حذف
      removeFileBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // جلوگیری از انتشار رویداد کلیک
        window.selectedFile = null;
        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";

        filePreview.style.display = "none";

        // حذف کلاس file-preview-active از عنصر والد
        const inputContainer = document.querySelector(
          ".telegram-input-container"
        );
        if (inputContainer) {
          inputContainer.classList.remove("file-preview-active");
          //('کلاس file-preview-active از عنصر والد حذف شد');
        }

        // حذف دکمه ارسال مخصوص پیش‌نمایش فایل
        removeSendFileButton();

        // نمایش مجدد دکمه‌های ایموجی و گزینه‌های ورودی
        showInputOptions();

        // اگر پنل زمان‌بندی نمایش داده می‌شود، آن را با نوع محتوای 'text' به‌روز کنیم
        const schedulePanel = document.getElementById("schedulePanel");
        if (schedulePanel && schedulePanel.style.display !== "none") {
          // فراخوانی تابع showSchedulePanel با نوع محتوای 'text'
          if (typeof window.showSchedulePanel === "function") {
            window.showSchedulePanel(false, "text");
          }

          // ریست کردن وضعیت زمان‌بندی
          window.isScheduleActive = false;
        }
      });

      //('دکمه removeFileBtn با موفقیت ایجاد شد');
    }

    // مخفی کردن پنل ضبط صدا
    const voiceRecorder = document.getElementById("voiceRecorder");
    if (voiceRecorder) voiceRecorder.style.display = "none";

    // اضافه کردن کلاس file-preview-active به عنصر والد
    const inputContainer = document.querySelector(".telegram-input-container");
    if (inputContainer) {
      inputContainer.classList.add("file-preview-active");
      //('کلاس file-preview-active به عنصر والد اضافه شد');
    }

    // مخفی کردن دکمه ارسال اصلی به جای حذف آن
    const sendButton = document.getElementById("telegramSendBtn");
    if (sendButton) {
      // فقط مخفی کردن دکمه به جای حذف آن
      sendButton.style.display = "none";
      //('دکمه ارسال اصلی (بالایی) مخفی شد');
    }

    // همچنین مخفی کردن دکمه ارسال با کلاس telegram-send-btn
    const allSendButtons = document.querySelectorAll(".telegram-send-btn");
    allSendButtons.forEach((btn) => {
      btn.style.display = "none";
      //('دکمه ارسال با کلاس telegram-send-btn مخفی شد');
    });

    // ایجاد دکمه ارسال جدید برای پیش‌نمایش فایل
    window.createSendFileButton();

    // مخفی کردن دکمه ایموجی و گزینه‌های ورودی
    hideInputOptions();

    // نمایش پیش‌نمایش فایل
    filePreview.style.display = "flex";
    //('نمایش پنل پیش‌نمایش فایل با style.display =', filePreview.style.display);

    // اجرای تابع مخفی کردن اجباری دکمه ارسال
    window.forceHideSendButton();

    // نمایش اطلاعات فایل
    const fileSize = (file.size / 1024).toFixed(2) + " کیلوبایت";
    let fileType = "";

    if (file.type.startsWith("image/")) {
      fileType = "تصویر";
    } else if (file.type.startsWith("audio/")) {
      fileType = "فایل صوتی";
    } else if (file.type.startsWith("video/")) {
      fileType = "ویدیو";
    } else if (file.type.includes("pdf")) {
      fileType = "فایل PDF";
    } else if (file.type.includes("word") || file.type.includes("document")) {
      fileType = "سند متنی";
    } else if (file.type.includes("excel") || file.type.includes("sheet")) {
      fileType = "فایل اکسل";
    } else {
      fileType = "فایل";
    }

    const fileInfoHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-info">${fileType} - ${fileSize}</span>
        `;

    //('اطلاعات فایل برای نمایش:', fileInfoHTML);
    filePreviewInfo.innerHTML = fileInfoHTML;

    // اگر پنل زمان‌بندی نمایش داده می‌شود، آن را با نوع محتوای مناسب به‌روز کنیم
    const schedulePanel = document.getElementById("schedulePanel");
    if (schedulePanel && schedulePanel.style.display !== "none") {
      // فراخوانی تابع showSchedulePanel با نوع محتوای 'attachment'
      if (typeof window.showSchedulePanel === "function") {
        window.showSchedulePanel(false, "attachment");
      }

      // تنظیم وضعیت زمان‌بندی
      window.isScheduleActive = true;
    }
  };

  // تابع ایجاد دکمه ارسال برای پیش‌نمایش فایل
  window.createSendFileButton = function () {
    // حذف دکمه قبلی اگر وجود داشت
    window.removeSendFileButton();

    // ایجاد دکمه ارسال جدید
    const sendFileBtn = document.createElement("button");
    sendFileBtn.id = "sendFileBtn";
    sendFileBtn.className = "telegram-file-preview-send-btn";
    sendFileBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
    sendFileBtn.title = "ارسال فایل";

    // استایل‌دهی مستقیم به دکمه
    sendFileBtn.style.width = "40px";
    sendFileBtn.style.height = "40px";
    sendFileBtn.style.minWidth = "40px";
    sendFileBtn.style.minHeight = "40px";
    sendFileBtn.style.borderRadius = "50%";
    sendFileBtn.style.backgroundColor = "#229ED9"; // رنگ آبی تلگرام
    sendFileBtn.style.color = "white";
    sendFileBtn.style.display = "flex";
    sendFileBtn.style.alignItems = "center";
    sendFileBtn.style.justifyContent = "center";
    sendFileBtn.style.border = "none";
    sendFileBtn.style.cursor = "pointer";
    sendFileBtn.style.transition = "all 0.2s ease";
    sendFileBtn.style.padding = "0";
    sendFileBtn.style.position = "absolute";
    sendFileBtn.style.right = "15px";
    sendFileBtn.style.bottom = "15px";
    sendFileBtn.style.zIndex = "30";
    sendFileBtn.style.fontSize = "18px";
    sendFileBtn.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";

    // ایجاد دکمه زمان‌بندی
    const scheduleBtn = document.createElement("button");
    scheduleBtn.id = "scheduleFileBtn";
    scheduleBtn.className = "telegram-file-preview-schedule-btn";
    scheduleBtn.innerHTML = '<i class="fa-regular fa-clock"></i>';
    scheduleBtn.title = "زمان‌بندی ارسال فایل";

    // استایل‌دهی مستقیم به دکمه زمان‌بندی
    scheduleBtn.style.width = "36px";
    scheduleBtn.style.height = "36px";
    scheduleBtn.style.borderRadius = "50%";
    scheduleBtn.style.backgroundColor = "#2196F3"; // رنگ آبی روشن‌تر
    scheduleBtn.style.color = "white";
    scheduleBtn.style.display = "flex";
    scheduleBtn.style.alignItems = "center";
    scheduleBtn.style.justifyContent = "center";
    scheduleBtn.style.border = "none";
    scheduleBtn.style.cursor = "pointer";
    scheduleBtn.style.transition = "all 0.2s ease";
    scheduleBtn.style.padding = "0";
    scheduleBtn.style.position = "absolute";
    scheduleBtn.style.left = "55px"; // فاصله از دکمه ارسال
    scheduleBtn.style.bottom = "23px";
    scheduleBtn.style.zIndex = "30";
    scheduleBtn.style.fontSize = "18px";
    scheduleBtn.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";

    // اضافه کردن به کانتینر
    const inputContainer = document.querySelector(".telegram-input-container");
    if (inputContainer) {
      inputContainer.appendChild(sendFileBtn);
      inputContainer.appendChild(scheduleBtn);

      // اضافه کردن رویداد کلیک به دکمه ارسال
      sendFileBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        //('کلیک روی دکمه ارسال فایل');

        // بررسی آیا زمان‌بندی فعال است با استفاده از تابع کمکی
        const isScheduled = window.isSchedulingActive();

        if (!isScheduled) {
          // اگر زمان‌بندی نشده، تنظیم زمان حال به عنوان پیش‌فرض
          const now = new Date();
          window.scheduledTime = now.toISOString();
          console.log("تنظیم زمان حال برای ارسال فایل:", window.scheduledTime);
        } else {
          console.log(
            "استفاده از زمان‌بندی انتخاب شده برای ارسال فایل:",
            window.scheduledTime
          );
        }

        // در هر صورت، فایل را با زمان‌بندی فعلی ارسال کن
        // (چه زمان حال باشد چه زمان‌بندی شده)
        sendFile();
        resetAfterSend(true);
      });

      // اضافه کردن رویداد کلیک به دکمه زمان‌بندی
      scheduleBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        //('کلیک روی دکمه زمان‌بندی فایل');

        // بازنشانی وضعیت زمان‌بندی
        window.isScheduleActive = false;

        // مخفی کردن پنل زمان‌بندی اگر نمایش داده شده است
        const schedulePanel = document.getElementById("schedulePanel");
        if (schedulePanel) {
          schedulePanel.style.display = "none";
        }

        // نمایش پنل زمان‌بندی
        if (typeof window.showSchedulePanel === "function") {
          try {
            window.showSchedulePanel(true, "attachment");
            window.isScheduleActive = true;

            // اطمینان از نمایش صحیح پنل زمان‌بندی
            setTimeout(() => {
              const schedulePanel = document.getElementById("schedulePanel");
              if (schedulePanel) {
                schedulePanel.style.display = "block";

                // فعال کردن فیلد انتخاب تاریخ
                const scheduledTimeInput =
                  document.getElementById("scheduledTimeInput");
                if (scheduledTimeInput) {
                  try {
                    // فعال کردن فیلد ورودی قبل از نمایش تقویم
                    scheduledTimeInput.disabled = false;
                    scheduledTimeInput.readOnly = false;

                    setTimeout(() => {
                      try {
                        scheduledTimeInput.focus();

                        // استفاده از jalaliDatepicker
                        if (typeof jalaliDatepicker !== "undefined") {
                          jalaliDatepicker.show(scheduledTimeInput);
                        } else {
                          // شبیه‌سازی کلیک روی فیلد
                          const clickEvent = new MouseEvent("click", {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                          });
                          scheduledTimeInput.dispatchEvent(clickEvent);
                        }
                      } catch (e) {
                        console.error("خطا در نمایش تقویم:", e);
                      }
                    }, 100);
                  } catch (e) {
                    console.error("خطا در فعال کردن فیلد انتخاب تاریخ:", e);
                  }
                }
              }
            }, 100);
          } catch (e) {
            console.error("خطا در نمایش پنل زمان‌بندی:", e);
          }
        }
      });

      // اضافه کردن افکت hover به دکمه ارسال
      sendFileBtn.addEventListener("mouseover", function () {
        // اگر زمان‌بندی شده، رنگ سبز تیره‌تر
        if (this.querySelector(".schedule-indicator")) {
          this.style.backgroundColor = "#388E3C"; // سبز تیره‌تر
        } else {
          this.style.backgroundColor = "#1A7AAB"; // آبی تیره‌تر
        }
        this.style.transform = "scale(1.05)";
      });

      sendFileBtn.addEventListener("mouseout", function () {
        // اگر زمان‌بندی شده، رنگ سبز
        if (this.querySelector(".schedule-indicator")) {
          this.style.backgroundColor = "#4CAF50"; // سبز
        } else {
          this.style.backgroundColor = "#229ED9"; // آبی
        }
        this.style.transform = "";
      });

      // اضافه کردن افکت hover به دکمه زمان‌بندی
      scheduleBtn.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#0D47A1"; // رنگ آبی تیره‌تر
        this.style.transform = "scale(1.05)";
      });

      scheduleBtn.addEventListener("mouseout", function () {
        this.style.backgroundColor = "#2196F3"; // برگشت به رنگ اصلی
        this.style.transform = "";
      });

      // اگر قبلاً زمان‌بندی شده بود، نشانگر را نمایش بده
      if (window.scheduledTime && window.isScheduleActive) {
        // ایجاد نشانگر زمان‌بندی
        const scheduleIndicator = document.createElement("span");
        scheduleIndicator.className = "schedule-indicator";
        scheduleIndicator.style.position = "absolute";
        scheduleIndicator.style.top = "-5px";
        scheduleIndicator.style.right = "-5px";
        scheduleIndicator.style.width = "15px";
        scheduleIndicator.style.height = "15px";
        scheduleIndicator.style.backgroundColor = "#FFC107";
        scheduleIndicator.style.borderRadius = "50%";
        scheduleIndicator.style.border = "2px solid #229ED9";
        scheduleIndicator.style.zIndex = "31";
        sendFileBtn.appendChild(scheduleIndicator);

        // تغییر رنگ دکمه
        sendFileBtn.style.backgroundColor = "#4CAF50"; // رنگ سبز

        // تنظیم تولتیپ با تاریخ انتخاب شده
        try {
          const scheduledDate = new Date(window.scheduledTime);
          const formattedDate = scheduledDate.toLocaleDateString("fa-IR");
          const formattedTime = scheduledDate.toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          sendFileBtn.title = `ارسال در تاریخ ${formattedDate} ساعت ${formattedTime}`;
        } catch (e) {
          sendFileBtn.title = "ارسال زمان‌بندی شده فایل";
        }
      }
    }
  };

  // تابع ارسال فایل
  window.sendFile = function () {
    //('در حال ارسال فایل...');

    // یافتن محل مناسب برای نمایش نوار پیشرفت
    const chatBody = document.querySelector(".telegram-chat-body");
    if (!chatBody) {
      console.error("کانتینر چت یافت نشد! جستجو برای عنصر دیگر...");

      // جستجو برای عناصر دیگر
      const activeChatElement = document.querySelector(".telegram-active-chat");
      if (activeChatElement) {
        // ایجاد یک پیام موقت برای نمایش پیشرفت آپلود
        const uploadMessage = createUploadProgressMessage();

        // پیدا کردن محل مناسب برای نمایش پیام
        const chatBodyInActive = activeChatElement.querySelector(
          ".telegram-chat-body"
        );
        if (chatBodyInActive) {
          chatBodyInActive.appendChild(uploadMessage);

          // ادامه با کد ارسال فایل
          sendFileWithProgress(uploadMessage);
          return;
        }

        // اگر chat-body پیدا نشد، از خود active-chat استفاده کن
        const uploadProgressOverlay = createUploadProgressOverlay();
        activeChatElement.appendChild(uploadProgressOverlay);

        // ادامه با کد ارسال فایل
        sendFileWithProgress(uploadProgressOverlay);
        return;
      }

      // اگر هیچ عنصری پیدا نشد، از body استفاده کن
      const uploadProgressOverlay = createUploadProgressOverlay();
      document.body.appendChild(uploadProgressOverlay);

      // ادامه با کد ارسال فایل
      sendFileWithProgress(uploadProgressOverlay);
      return;
    }

    // ایجاد یک پیام موقت برای نمایش پیشرفت آپلود
    const uploadMessage = createUploadProgressMessage();
    chatBody.appendChild(uploadMessage);

    // استفاده از مدیریت اسکرول جدید
    window.telegramScrollManager.scrollToBottom();

    // ادامه با کد ارسال فایل
    sendFileWithProgress(uploadMessage);
  };

  // تابع کمکی برای ارسال فایل با نمایش پیشرفت
  function sendFileWithProgress(progressElement) {
    // استفاده از دکمه ارسال اصلی که مخفی شده است
    const sendButton = document.getElementById("telegramSendBtn");
    if (sendButton && typeof window.sendMessage === "function") {
      // ذخیره تابع sendMessage اصلی
      const originalSendMessage = window.sendMessage;

      // جایگزینی تابع sendMessage با نسخه جدید که درصد پیشرفت را نمایش می‌دهد
      window.sendMessage = function () {
        // ایجاد یک نمونه از XMLHttpRequest
        const xhr = new XMLHttpRequest();

        // ایجاد FormData برای ارسال داده‌ها
        const formData = new FormData();

        // یافتن شناسه گیرنده
        let recipientId = null;
        if (window.activeConversation && window.activeConversation.userId) {
          recipientId = window.activeConversation.userId;
        } else {
          // اگر شناسه گیرنده یافت نشد، به تابع اصلی برمی‌گردیم
          originalSendMessage.apply(this, arguments);
          return;
        }

        // دریافت متن پیام
        const messageInput = document.getElementById("telegramInput");
        const message = messageInput ? messageInput.value.trim() : "";

        // افزودن اطلاعات پیام به FormData
        formData.append("recipients[]", recipientId);

        // استفاده از نام کاربر یا شناسه کاربر برای موضوع پیام
        let subjectText = "پیام جدید";
        if (window.activeConversation) {
          if (
            window.activeConversation.name &&
            window.activeConversation.name.trim() !== ""
          ) {
            subjectText = `گفتگو با ${window.activeConversation.name}`;
          } else if (window.activeConversation.userId) {
            subjectText = `گفتگو با کاربر ${window.activeConversation.userId}`;
          }
        }
        formData.append("subject", subjectText);

        formData.append("body", message || "");

        // بررسی وضعیت زمان‌بندی با استفاده از تابع کمکی
        const isScheduled = window.isSchedulingActive();

        // اگر زمان‌بندی فعال است و زمان انتخاب شده وجود دارد
        if (isScheduled) {
          console.log("ارسال فایل با زمان‌بندی:", window.scheduledTime);
          formData.append("scheduled_time", window.scheduledTime);
        } else {
          // اگر زمان‌بندی فعال نیست، از زمان حال استفاده می‌کنیم
          const now = new Date();
          window.scheduledTime = now.toISOString();
          formData.append("scheduled_time", window.scheduledTime);
          console.log("ارسال فایل در زمان حال:", window.scheduledTime);
        }

        // اضافه کردن فایل به فرم
        let fileSize = 0;
        let fileName = "";
        if (window.selectedFile) {
          formData.append("file", window.selectedFile);
          fileSize = window.selectedFile.size;
          fileName = window.selectedFile.name;
        } else if (window.recordedAudio) {
          formData.append("file", window.recordedAudio);
          fileSize = window.recordedAudio.size;
          fileName = "فایل صوتی ضبط شده";
        } else if (window.fileToSend) {
          formData.append("file", window.fileToSend);
          fileSize = window.fileToSend.size;
          fileName = window.fileToSend.name || "فایل";
        }

        console.log(
          `اندازه فایل برای آپلود: ${fileSize} بایت، نام فایل: ${fileName}`
        );
        console.log(`زمان ارسال: ${window.scheduledTime}`);

        // زمان شروع آپلود
        let uploadStartTime = Date.now();

        // تابع جهانی برای به‌روزرسانی رابط کاربری پیشرفت آپلود
        function updateUploadProgressUI(percent) {
          // تبدیل به عدد اگر رشته است
          if (typeof percent === "string") {
            percent = parseFloat(percent);
          }

          // اطمینان از اینکه درصد عدد معتبر است
          if (isNaN(percent)) {
            console.error("درصد پیشرفت نامعتبر است!");
            return;
          }

          // محدود کردن درصد بین 0 تا 100
          percent = Math.max(0, Math.min(100, percent));

          //(`به‌روزرسانی درصد پیشرفت به ${percent}%`);

          // به‌روزرسانی وضعیت ارسال
          const allStatusElements = document.querySelectorAll(".upload-status");
          allStatusElements.forEach((element) => {
            if (percent < 100) {
              element.textContent = "در حال ارسال...";
            } else {
              element.textContent = "ارسال شد";

              // تغییر رنگ متن به سبز روشن‌تر برای نمایش موفقیت
              element.style.color = "#8effb5";

              // حذف انیمیشن pulse
              element.style.animation = "none";
            }
          });

          // مدیریت لودینگ چرخشی
          const allSpinners = document.querySelectorAll(".upload-spinner");
          allSpinners.forEach((spinner) => {
            if (percent >= 100) {
              // تبدیل لودینگ به آیکون تیک برای نمایش موفقیت
              spinner.style.border = "none";
              spinner.style.animation = "none";
              spinner.innerHTML =
                '<i class="fa-solid fa-check" style="color: #8effb5; font-size: 16px;"></i>';
              spinner.style.display = "flex";
              spinner.style.alignItems = "center";
              spinner.style.justifyContent = "center";
            }
          });

          // به‌روزرسانی همه عناصر زمان پیام که شامل وضعیت ارسال هستند
          const allTimeElements = document.querySelectorAll(
            ".telegram-message-time"
          );
          allTimeElements.forEach((el) => {
            if (
              el.textContent.includes("در حال") ||
              el.textContent.includes("%")
            ) {
              if (percent < 100) {
                el.textContent = "در حال ارسال...";
              } else {
                const now = new Date();
                const timeStr =
                  now.getHours().toString().padStart(2, "0") +
                  ":" +
                  now.getMinutes().toString().padStart(2, "0");
                el.textContent = timeStr;
              }
            }
          });
        }

        // تنظیم رویداد برای دریافت پیشرفت آپلود
        xhr.upload.addEventListener("progress", function (event) {
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            updateUploadProgressUI(percent);
            //(`پیشرفت واقعی آپلود: ${percent.toFixed(2)}%`);
          }
        });

        // تنظیم رویداد برای زمان تکمیل کامل درخواست (load)
        xhr.addEventListener("load", function () {
          // به‌روزرسانی متن پیام به "آپلود تکمیل شد"
          updateUploadProgressUI(100);

          // به‌روزرسانی متن زمان پیام
          const messageTime = progressElement.querySelector(
            ".telegram-message-time"
          );
          if (messageTime) {
            messageTime.textContent = "آپلود تکمیل شد";
          }

          // بازگرداندن تابع اصلی
          window.sendMessage = originalSendMessage;

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);

              // به‌روزرسانی متن پیام به "ارسال موفقیت‌آمیز"
              if (progressElement && progressElement.parentNode) {
                const uploadTitle = progressElement.querySelector(
                  ".telegram-message-subject"
                );
                if (uploadTitle) {
                  uploadTitle.textContent = "ارسال فایل موفقیت‌آمیز";
                }

                // به‌روزرسانی متن زمان پیام
                const messageTime = progressElement.querySelector(
                  ".telegram-message-time"
                );
                if (messageTime) {
                  const now = new Date();
                  const timeStr =
                    now.getHours().toString().padStart(2, "0") +
                    ":" +
                    now.getMinutes().toString().padStart(2, "0");
                  messageTime.textContent = timeStr;
                }
              }

              // به‌روزرسانی رابط کاربری
              if (typeof window.updateUIAfterSend === "function") {
                window.updateUIAfterSend(response);
              }
            } catch (e) {
              console.error("خطا در تجزیه پاسخ JSON در رویداد load:", e);
            }
          }
        });

        // تنظیم رویداد برای خطاهای شبکه
        xhr.addEventListener("error", function () {
          console.error("خطای شبکه در ارسال پیام");

          // به‌روزرسانی متن پیام به "خطا در آپلود"
          if (progressElement && progressElement.parentNode) {
            const progressText = progressElement.querySelector(
              ".upload-progress-percent"
            );
            if (progressText) {
              progressText.textContent = "خطا در آپلود";
              progressText.style.color = "#ff5252";
            }

            const uploadTitle = progressElement.querySelector(
              ".telegram-message-subject"
            );
            if (uploadTitle) {
              uploadTitle.textContent = "خطا در ارسال فایل";
              uploadTitle.style.color = "#ff5252";
            }

            // به‌روزرسانی متن زمان پیام
            const messageTime = progressElement.querySelector(
              ".telegram-message-time"
            );
            if (messageTime) {
              messageTime.textContent = "خطای شبکه";
            }
          }

          // بازگرداندن تابع اصلی
          window.sendMessage = originalSendMessage;

          // نمایش پیام خطا
          alert(
            "خطای شبکه در ارسال پیام. لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید."
          );
        });

        // تنظیم رویداد برای لغو درخواست
        xhr.addEventListener("abort", function () {
          //('ارسال پیام لغو شد');

          // به‌روزرسانی متن پیام به "آپلود لغو شد"
          if (progressElement && progressElement.parentNode) {
            const progressText = progressElement.querySelector(
              ".upload-progress-percent"
            );
            if (progressText) {
              progressText.textContent = "آپلود لغو شد";
            }

            const uploadTitle = progressElement.querySelector(
              ".telegram-message-subject"
            );
            if (uploadTitle) {
              uploadTitle.textContent = "ارسال فایل لغو شد";
            }

            // به‌روزرسانی متن زمان پیام
            const messageTime = progressElement.querySelector(
              ".telegram-message-time"
            );
            if (messageTime) {
              messageTime.textContent = "لغو شده";
            }
          }

          // بازگرداندن تابع اصلی
          window.sendMessage = originalSendMessage;
        });

        // دریافت توکن CSRF
        function getCookie(name) {
          let cookieValue = null;
          if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                  cookie.substring(name.length + 1)
                );
                break;
              }
            }
          }
          return cookieValue;
        }

        // باز کردن درخواست و ارسال داده‌ها
        xhr.open("POST", "/api/send-message", true);
        xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        xhr.timeout = 300000; // تایم‌اوت 5 دقیقه

        // ارسال داده‌ها
        xhr.send(formData);

        // نمایش پیشرفت اولیه
        updateUploadProgressUI(0);
      };

      // استفاده از تابع sendMessage موجود
      window.sendMessage();
    } else if (sendButton) {
      // شبیه‌سازی کلیک روی دکمه اصلی
      sendButton.click();

      // به‌روزرسانی متن پیام به "در حال ارسال..."
      if (progressElement && progressElement.parentNode) {
        const progressText = progressElement.querySelector(
          ".upload-progress-percent"
        );
        if (progressText) {
          progressText.textContent = "در حال ارسال...";
        }

        // به‌روزرسانی متن زمان پیام
        const messageTime = progressElement.querySelector(
          ".telegram-message-time"
        );
        if (messageTime) {
          messageTime.textContent = "در حال ارسال...";
        }
      }
    } else {
      console.error("دکمه ارسال اصلی یافت نشد!");

      // به‌روزرسانی متن پیام به "خطا در ارسال"
      if (progressElement && progressElement.parentNode) {
        const progressText = progressElement.querySelector(
          ".upload-progress-percent"
        );
        if (progressText) {
          progressText.textContent = "خطا در ارسال";
          progressText.style.color = "#ff5252";
        }

        const uploadTitle = progressElement.querySelector(
          ".telegram-message-subject"
        );
        if (uploadTitle) {
          uploadTitle.textContent = "خطا در ارسال فایل";
          uploadTitle.style.color = "#ff5252";
        }

        // به‌روزرسانی متن زمان پیام
        const messageTime = progressElement.querySelector(
          ".telegram-message-time"
        );
        if (messageTime) {
          messageTime.textContent = "خطا در ارسال فایل";
        }

        // حذف پیام پس از مدتی
        setTimeout(() => {
          if (progressElement.parentNode) {
            progressElement.parentNode.removeChild(progressElement);
          }
        }, 5000);
      }
    }
  }

  // تابع ایجاد نوار پیشرفت آپلود
  function createUploadProgressOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "upload-progress-overlay";
    overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            text-align: center;
            border-radius: 12px;
            margin: 0;
            padding: 0;
            direction: rtl;
        `;

    const content = document.createElement("div");
    content.className = "upload-progress-content";
    content.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 300px;
            padding: 20px;
        `;

    const spinner = document.createElement("div");
    spinner.className = "upload-progress-spinner";
    spinner.style.cssText = `
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid #0F9D58;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
        `;

    // اضافه کردن انیمیشن چرخش
    let spinStyle = document.getElementById("upload-progress-spin-style");
    if (!spinStyle) {
      spinStyle = document.createElement("style");
      spinStyle.id = "upload-progress-spin-style";
      spinStyle.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
      document.head.appendChild(spinStyle);
    }

    const text = document.createElement("p");
    text.className = "upload-progress-text";
    text.textContent = "در حال آپلود فایل...";
    text.style.cssText = `
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: bold;
            color: white;
        `;

    const progressContainer = document.createElement("div");
    progressContainer.className = "upload-progress-container";
    progressContainer.style.cssText = `
            width: 100%;
            height: 8px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        `;

    const progressBar = document.createElement("div");
    progressBar.className = "upload-progress-bar";
    progressBar.id = "uploadProgressBar";
    progressBar.style.cssText = `
            height: 100%;
            width: 0%;
            background-color: #0F9D58;
            transition: width 0.3s ease;
        `;

    const progressText = document.createElement("p");
    progressText.className = "upload-progress-percent";
    progressText.id = "uploadProgressText";
    progressText.textContent = "0%";
    progressText.style.cssText = `
            font-size: 16px;
            color: white;
            margin: 5px 0;
            font-weight: bold;
        `;

    const messageTime = document.createElement("p");
    messageTime.className = "telegram-message-time";
    messageTime.textContent = "0%";
    messageTime.style.cssText = `
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 2px;
            margin-bottom: 0;
            padding: 0 5px;
            display: block;
            width: 100%;
            text-align: right;
        `;

    progressContainer.appendChild(progressBar);
    content.appendChild(spinner);
    content.appendChild(text);
    content.appendChild(progressContainer);
    content.appendChild(progressText);
    content.appendChild(messageTime);
    overlay.appendChild(content);

    return overlay;
  }

  // تابع به‌روزرسانی درصد پیشرفت آپلود
  function updateUploadProgress(percent) {
    //(`به‌روزرسانی نوار پیشرفت آپلود با مقدار: ${percent}%`);

    // تبدیل به عدد اگر رشته است
    if (typeof percent === "string") {
      percent = parseFloat(percent);
    }

    // اطمینان از معتبر بودن درصد
    if (isNaN(percent)) {
      console.error("درصد پیشرفت معتبر نیست!");
      return;
    }

    // محدود کردن درصد بین 0 تا 100
    percent = Math.max(0, Math.min(100, percent));

    const progressBar = document.getElementById("uploadProgressBar");
    const progressText = document.getElementById("uploadProgressText");

    //('عناصر نوار پیشرفت:', { progressBar, progressText });

    if (progressBar) {
      // تنظیم عرض نوار پیشرفت
      progressBar.style.width = `${Math.round(percent)}%`;
      //(`عرض نوار پیشرفت به ${progressBar.style.width} تغییر کرد`);
    } else {
      console.error("نوار پیشرفت با شناسه uploadProgressBar یافت نشد!");
    }

    if (progressText) {
      // تنظیم متن درصد
      progressText.textContent = `${Math.round(percent)}%`;
      //(`متن درصد پیشرفت به ${progressText.textContent} تغییر کرد`);
    } else {
      console.error("متن پیشرفت با شناسه uploadProgressText یافت نشد!");
    }

    // جستجوی نوار پیشرفت و متن با کلاس‌های عمومی نیز انجام شود
    const allProgressBars = document.querySelectorAll(".upload-progress-bar");
    const allProgressTexts = document.querySelectorAll(
      ".upload-progress-percent"
    );

    //(`تعداد نوارهای پیشرفت با کلاس: ${allProgressBars.length}`);
    //(`تعداد متن‌های پیشرفت با کلاس: ${allProgressTexts.length}`);

    // به‌روزرسانی همه نوارهای پیشرفت
    allProgressBars.forEach((bar, index) => {
      bar.style.width = `${Math.round(percent)}%`;
      //(`نوار پیشرفت ${index+1} به ${bar.style.width} تغییر کرد`);
    });

    // به‌روزرسانی همه متن‌های پیشرفت
    allProgressTexts.forEach((text, index) => {
      text.textContent = `${Math.round(percent)}%`;
      //(`متن پیشرفت ${index+1} به ${text.textContent} تغییر کرد`);
    });
  }

  // تابع بازنشانی پس از ارسال
  window.resetAfterSend = function (isRealSend = true) {
    //('تابع resetAfterSend فراخوانی شد با پارامتر isRealSend:', isRealSend);

    // اگر ارسال واقعی است، پیش‌نمایش را مخفی کن و به حالت اولیه برگرد
    if (isRealSend) {
      // بازگرداندن سریع فوتر به حالت ورودی - بدون تاخیر
      const filePreview = document.getElementById("filePreview");
      if (filePreview) {
        filePreview.style.display = "none";
        //('پیش‌نمایش فایل مخفی شد (بدون تاخیر)');
      }

      // حذف کلاس file-preview-active از عنصر والد
      const inputContainer = document.querySelector(
        ".telegram-input-container"
      );
      if (inputContainer) {
        inputContainer.classList.remove("file-preview-active");
        //('کلاس file-preview-active از عنصر والد حذف شد (بدون تاخیر)');
      }

      // حذف دکمه ارسال مخصوص پیش‌نمایش فایل
      window.removeSendFileButton();

      // نمایش مجدد دکمه‌های ایموجی و گزینه‌های ورودی
      showInputOptions();

      // پاک کردن فایل انتخاب شده
      window.selectedFile = null;
      window.scheduledTime = null;
      window.recordedAudio = null;
      window.fileToSend = null;
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";
    } else {
      // اگر ارسال واقعی نیست (مثلاً فقط انتخاب تاریخ)، پیش‌نمایش را حفظ کن
      //('حفظ پیش‌نمایش فایل چون ارسال واقعی نیست');

      // مطمئن شویم که پیش‌نمایش فایل نمایش داده می‌شود
      const filePreview = document.getElementById("filePreview");
      if (filePreview) {
        filePreview.style.display = "flex";
      }

      // مطمئن شویم که دکمه ارسال فایل وجود دارد
      window.createSendFileButton();
    }
  };

  // تابع حذف دکمه ارسال پیش‌نمایش فایل
  window.removeSendFileButton = function () {
    const sendFileBtn = document.getElementById("sendFileBtn");
    if (sendFileBtn) {
      sendFileBtn.remove();
    }

    // حذف دکمه زمان‌بندی نیز
    const scheduleFileBtn = document.getElementById("scheduleFileBtn");
    if (scheduleFileBtn) {
      scheduleFileBtn.remove();
    }
  };

  // تابع مخفی کردن دکمه ایموجی و گزینه‌های ورودی
  function hideInputOptions() {
    // مخفی کردن دکمه ایموجی
    const emojiButton = document.getElementById("emojiPickerBtn");
    if (emojiButton) {
      emojiButton.style.display = "none";
    }

    // مخفی کردن گزینه‌های ورودی
    const inputOptions = document.querySelector(".telegram-input-options");
    if (inputOptions) {
      inputOptions.style.display = "none";
    }
  }

  // تابع نمایش مجدد دکمه ایموجی و گزینه‌های ورودی
  function showInputOptions() {
    // حذف استایل مخفی کردن اجباری دکمه ارسال
    const hideStyle = document.getElementById("hide-send-btn-style");
    if (hideStyle) {
      hideStyle.remove();
      //('استایل مخفی کردن اجباری دکمه ارسال حذف شد');
    }

    // نمایش مجدد دکمه ایموجی
    const emojiButton = document.getElementById("emojiPickerBtn");
    if (emojiButton) {
      emojiButton.style.display = "flex";
    }

    // نمایش مجدد گزینه‌های ورودی
    const inputOptions = document.querySelector(".telegram-input-options");
    if (inputOptions) {
      inputOptions.style.display = "flex";
    }

    // نمایش مجدد دکمه ارسال اصلی
    const sendButton = document.getElementById("telegramSendBtn");
    if (sendButton) {
      sendButton.style.display = "";
    }

    // نمایش مجدد دکمه‌های ارسال با کلاس telegram-send-btn
    const allSendButtons = document.querySelectorAll(".telegram-send-btn");
    allSendButtons.forEach((btn) => {
      btn.style.display = "";
      //('دکمه ارسال با کلاس telegram-send-btn نمایش داده شد');
    });
  }

  // حذف رویدادهای قبلی و اضافه کردن رویداد جدید به فیلد ورودی فایل
  function setupFileInputEvents() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) return;

    // حذف تمام رویدادهای قبلی
    const oldElement = fileInput;
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);

    // اضافه کردن رویداد جدید
    newElement.addEventListener("change", function (e) {
      if (e.target.files.length > 0) {
        window.selectedFile = e.target.files[0];
        window.showFilePreview(window.selectedFile);

        // ممانعت از ریست اطلاعات چت
        e.stopPropagation();
      }
    });
  }

  // حذف رویدادهای قبلی و اضافه کردن رویداد جدید به دکمه حذف فایل
  function setupRemoveFileBtnEvents() {
    const removeFileBtn = document.getElementById("removeFileBtn");
    if (!removeFileBtn) return;

    // حذف تمام رویدادهای قبلی
    const oldElement = removeFileBtn;
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);

    // اضافه کردن رویداد جدید
    newElement.addEventListener("click", function (event) {
      event.stopPropagation(); // جلوگیری از انتشار رویداد کلیک
      window.selectedFile = null;
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";

      const filePreview = document.getElementById("filePreview");
      if (filePreview) filePreview.style.display = "none";

      // حذف کلاس file-preview-active از عنصر والد
      const inputContainer = document.querySelector(
        ".telegram-input-container"
      );
      if (inputContainer) {
        inputContainer.classList.remove("file-preview-active");
        //('کلاس file-preview-active از عنصر والد حذف شد');
      }

      // حذف دکمه ارسال مخصوص پیش‌نمایش فایل
      removeSendFileButton();

      // نمایش مجدد دکمه‌های ایموجی و گزینه‌های ورودی
      showInputOptions();

      // اگر پنل زمان‌بندی نمایش داده می‌شود، آن را با نوع محتوای 'text' به‌روز کنیم
      const schedulePanel = document.getElementById("schedulePanel");
      if (schedulePanel && schedulePanel.style.display !== "none") {
        // فراخوانی تابع showSchedulePanel با نوع محتوای 'text'
        if (typeof window.showSchedulePanel === "function") {
          window.showSchedulePanel(false, "text");
        }

        // ریست کردن وضعیت زمان‌بندی
        window.isScheduleActive = false;
      }
    });
  }

  // تنظیم رویداد کلیک برای دکمه اتصال فایل - روش جدید با استفاده از MutationObserver
  function setupAttachFileBtnEvents() {
    const attachFileBtn = document.getElementById("attachFileBtn");
    if (!attachFileBtn) {
      console.error("دکمه اتصال فایل یافت نشد!");
      return;
    }

    // حذف تمام رویدادهای قبلی با جایگزینی المنت
    const oldElement = attachFileBtn;
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);

    // ایجاد یک تابع کلیک جدید
    function handleAttachFileClick(event) {
      event.preventDefault();
      event.stopPropagation();

      //('کلیک روی دکمه اتصال فایل');

      // اگر هندلر فعال است، از اجرای مجدد جلوگیری می‌کنیم
      if (isFileDialogHandlerActive) {
        //('هندلر فایل دیالوگ در حال حاضر فعال است - درخواست نادیده گرفته شد');
        return;
      }

      // علامت‌گذاری هندلر به عنوان فعال
      isFileDialogHandlerActive = true;

      // تایمر برای غیرفعال کردن هندلر پس از مدت زمان مشخص
      setTimeout(() => {
        isFileDialogHandlerActive = false;
        //('هندلر فایل دیالوگ مجدداً غیرفعال شد');
      }, 2000); // 2 ثانیه زمان قفل

      // باز کردن دیالوگ انتخاب فایل
      const fileInput = document.getElementById("fileInput");
      if (fileInput) {
        try {
          fileInput.click();
        } catch (e) {
          console.error("خطا در باز کردن دیالوگ انتخاب فایل:", e);
          // در صورت خطا، هندلر را بلافاصله غیرفعال می‌کنیم
          isFileDialogHandlerActive = false;
        }
      }
    }

    // اضافه کردن رویداد جدید
    newElement.addEventListener("click", handleAttachFileClick);

    // ثبت رویداد در کنسول
    //('رویداد کلیک جدید به دکمه اتصال فایل اضافه شد');
  }

  // اضافه کردن گوش‌دهنده برای رویداد زمان‌بندی
  document.addEventListener("schedule-selected", function (event) {
    //('رویداد schedule-selected دریافت شد:', event.detail);

    // بررسی اگر پیش‌نمایش فایل فعال است
    const filePreview = document.getElementById("filePreview");
    if (
      filePreview &&
      filePreview.style.display === "flex" &&
      window.selectedFile
    ) {
      // اگر رویداد از نوع attachment است، فقط زمان‌بندی را انجام بده و فایل را ارسال نکن
      if (event.detail && event.detail.contentType === "attachment") {
        //('رویداد از نوع attachment است، فقط زمان‌بندی انجام می‌شود');

        // مطمئن شویم که پیش‌نمایش فایل نمایش داده می‌شود
        filePreview.style.display = "flex";

        // مطمئن شویم که دکمه ارسال فایل وجود دارد
        window.createSendFileButton();

        // نمایش نشانگر زمان‌بندی روی دکمه ارسال
        const sendFileBtn = document.getElementById("sendFileBtn");
        if (sendFileBtn && window.scheduledTime) {
          // ایجاد نشانگر زمان‌بندی اگر وجود ندارد
          let scheduleIndicator = sendFileBtn.querySelector(
            ".schedule-indicator"
          );
          if (!scheduleIndicator) {
            scheduleIndicator = document.createElement("span");
            scheduleIndicator.className = "schedule-indicator";
            scheduleIndicator.style.position = "absolute";
            scheduleIndicator.style.top = "-5px";
            scheduleIndicator.style.right = "-5px";
            scheduleIndicator.style.width = "15px";
            scheduleIndicator.style.height = "15px";
            scheduleIndicator.style.backgroundColor = "#FFC107";
            scheduleIndicator.style.borderRadius = "50%";
            scheduleIndicator.style.border = "2px solid #229ED9";
            scheduleIndicator.style.zIndex = "31";
            sendFileBtn.appendChild(scheduleIndicator);
          }

          // تغییر رنگ دکمه برای نشان دادن حالت زمان‌بندی
          sendFileBtn.style.backgroundColor = "#4CAF50"; // رنگ سبز
          sendFileBtn.title = "ارسال زمان‌بندی شده فایل";

          // اضافه کردن متن نمایش تاریخ انتخاب شده
          try {
            // تبدیل تاریخ ISO به تاریخ قابل نمایش
            const scheduledDate = new Date(window.scheduledTime);
            const formattedDate = scheduledDate.toLocaleDateString("fa-IR");
            const formattedTime = scheduledDate.toLocaleTimeString("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // نمایش تاریخ انتخاب شده در تولتیپ
            sendFileBtn.title = `ارسال در تاریخ ${formattedDate} ساعت ${formattedTime}`;

            // مخفی کردن پنل زمان‌بندی
            const schedulePanel = document.getElementById("schedulePanel");
            if (schedulePanel) {
              schedulePanel.style.display = "none";
            }
          } catch (e) {
            console.error("خطا در نمایش تاریخ انتخاب شده:", e);
          }
        }

        return;
      }

      // به جای ارسال خودکار، فقط اعلام کنیم که زمان‌بندی انجام شده است
      console.log(
        "زمان‌بندی برای ارسال فایل انجام شد. برای ارسال فایل، روی دکمه ارسال کلیک کنید."
      );
    }
  });

  // راه‌اندازی تمام رویدادها
  setupFileInputEvents();
  setupRemoveFileBtnEvents();
  setupAttachFileBtnEvents();

  // ایجاد یک MutationObserver برای نظارت بر تغییرات DOM و اطمینان از حفظ رویدادها
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList") {
        // بررسی اضافه شدن عناصر جدید
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // المنت DOM
            // بررسی اگر المنت اضافه شده یکی از عناصر مورد نظر ماست
            if (
              node.id === "attachFileBtn" ||
              node.querySelector("#attachFileBtn")
            ) {
              //('دکمه اتصال فایل به DOM اضافه شد - تنظیم مجدد رویدادها');
              setupAttachFileBtnEvents();
            }

            if (node.id === "fileInput" || node.querySelector("#fileInput")) {
              //('ورودی فایل به DOM اضافه شد - تنظیم مجدد رویدادها');
              setupFileInputEvents();
            }
          }
        });
      }
    });
  });

  // شروع نظارت بر تغییرات در کل بدنه سند
  observer.observe(document.body, { childList: true, subtree: true });

  //('اصلاحات نمایش پیش‌نمایش فایل با موفقیت اعمال شد');

  // تابع کمکی برای بررسی وضعیت زمان‌بندی
  window.isSchedulingActive = function () {
    // بررسی وجود نشانگر زمان‌بندی روی دکمه ارسال
    const sendFileBtn = document.getElementById("sendFileBtn");
    const hasIndicator =
      sendFileBtn && sendFileBtn.querySelector(".schedule-indicator") !== null;

    // بررسی متغیر وضعیت زمان‌بندی
    const isActive = window.isScheduleActive === true;

    // بررسی وجود زمان انتخاب شده
    const hasScheduledTime =
      window.scheduledTime !== null && window.scheduledTime !== undefined;

    // اگر هم نشانگر وجود دارد و هم وضعیت زمان‌بندی فعال است و زمان انتخاب شده وجود دارد
    return hasIndicator && isActive && hasScheduledTime;
  };
});

// تابع ایجاد پیام موقت برای نمایش پیشرفت آپلود
function createUploadProgressMessage() {
  // ایجاد یک شناسه منحصر به فرد برای پیام
  const messageId = "upload-progress-" + Date.now();

  const messageDiv = document.createElement("div");
  messageDiv.className = "telegram-message telegram-message-outgoing";
  messageDiv.id = messageId;
  messageDiv.style.cssText = `
        max-width: 75%;
        margin-bottom: 10px;
        align-self: flex-start;
        animation: fadeInMessage 0.3s ease-out;
        width: fit-content;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `;

  const messageContent = document.createElement("div");
  messageContent.className = "telegram-message-content";
  messageContent.style.cssText = `
        display: inline-block;
        padding: 12px 15px;
        border-radius: 12px;
        background-color: #0F9D58;
        border-bottom-left-radius: 4px;
        text-align: right;
        direction: rtl;
        width: 100%;
        min-width: 200px;
        position: relative;
        overflow: hidden;
    `;

  // اضافه کردن افکت گرادیان به پس‌زمینه
  const gradientOverlay = document.createElement("div");
  gradientOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 100%);
        pointer-events: none;
    `;
  messageContent.appendChild(gradientOverlay);

  // دریافت اطلاعات فایل
  let fileName = "";
  let fileSize = 0;
  let fileType = "";
  let fileExtension = "";

  if (window.selectedFile) {
    fileName = window.selectedFile.name;
    fileSize = window.selectedFile.size;
    fileType = window.selectedFile.type;
    fileExtension = fileName.split(".").pop().toLowerCase();
  } else if (window.recordedAudio) {
    fileName = "فایل صوتی ضبط شده";
    fileSize = window.recordedAudio.size;
    fileType = "audio/mp3";
    fileExtension = "mp3";
  } else if (window.fileToSend) {
    fileName = window.fileToSend.name || "فایل";
    fileSize = window.fileToSend.size;
    fileType = window.fileToSend.type;
    fileExtension = fileName.split(".").pop().toLowerCase();
  }

  // تعیین آیکون مناسب بر اساس نوع فایل
  let fileIcon = "";
  if (fileType.startsWith("image/")) {
    fileIcon = '<i class="fa-regular fa-image" style="font-size: 22px;"></i>';
  } else if (fileType.startsWith("audio/")) {
    fileIcon = '<i class="fa-solid fa-music" style="font-size: 22px;"></i>';
  } else if (fileType.startsWith("video/")) {
    fileIcon = '<i class="fa-solid fa-video" style="font-size: 22px;"></i>';
  } else if (fileType.includes("pdf")) {
    fileIcon = '<i class="fa-solid fa-file-pdf" style="font-size: 22px;"></i>';
  } else if (fileType.includes("word") || fileType.includes("document")) {
    fileIcon = '<i class="fa-solid fa-file-word" style="font-size: 22px;"></i>';
  } else if (fileType.includes("excel") || fileType.includes("sheet")) {
    fileIcon =
      '<i class="fa-solid fa-file-excel" style="font-size: 22px;"></i>';
  } else {
    fileIcon = '<i class="fa-solid fa-file" style="font-size: 22px;"></i>';
  }

  // ایجاد عنوان پیام با آیکون فایل (بدون متن "فایل ضمیمه")
  const uploadTitle = document.createElement("div");
  uploadTitle.className = "telegram-message-subject";
  uploadTitle.innerHTML = fileIcon;
  uploadTitle.style.cssText = `
        font-weight: bold;
        margin-bottom: 8px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

  // ایجاد کانتینر اطلاعات فایل - بدون کادر بیرونی
  const fileNameElement = document.createElement("div");
  fileNameElement.className = "upload-file-name";
  fileNameElement.innerHTML = `${fileName}`;
  fileNameElement.style.cssText = `
        font-size: 14px;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        font-weight: bold;
    `;

  // اطلاعات اضافی فایل (پسوند و حجم) - چپ‌چین برای حجم
  const fileDetailsElement = document.createElement("div");
  fileDetailsElement.className = "upload-file-details";
  fileDetailsElement.style.cssText = `
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        direction: ltr;
    `;

  // پسوند فایل - راست‌چین
  const fileExtensionSpan = document.createElement("span");
  fileExtensionSpan.textContent = fileExtension.toUpperCase();
  fileExtensionSpan.style.cssText = `
        direction: rtl;
        text-align: right;
    `;

  // حجم فایل - چپ‌چین
  const fileSizeSpan = document.createElement("span");
  fileSizeSpan.textContent = formatFileSize(fileSize);
  fileSizeSpan.style.cssText = `
        direction: ltr;
        text-align: left;
    `;

  // اضافه کردن پسوند و حجم به کانتینر اطلاعات
  fileDetailsElement.appendChild(fileExtensionSpan);
  fileDetailsElement.appendChild(fileSizeSpan);

  // ایجاد کانتینر برای لودینگ و وضعیت
  const statusContainer = document.createElement("div");
  statusContainer.className = "upload-status-container";
  statusContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-top: 8px;
    `;

  // ایجاد لودینگ چرخشی دایره‌ای
  const spinner = document.createElement("div");
  spinner.className = "upload-spinner";
  spinner.style.cssText = `
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 2px solid #fff;
        margin-left: 8px;
        animation: spin 1s linear infinite;
    `;

  // اضافه کردن انیمیشن چرخش
  let spinStyle = document.getElementById("upload-spinner-style");
  if (!spinStyle) {
    spinStyle = document.createElement("style");
    spinStyle.id = "upload-spinner-style";
    spinStyle.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        `;
    document.head.appendChild(spinStyle);
  }

  // وضعیت ارسال - به جای درصد پیشرفت
  const uploadStatusElement = document.createElement("div");
  uploadStatusElement.className = "upload-status";
  uploadStatusElement.textContent = "در حال ارسال...";
  uploadStatusElement.style.cssText = `
        font-size: 12px;
        color: white;
        font-weight: bold;
        animation: pulse 1.5s infinite ease-in-out;
    `;

  // اضافه کردن لودینگ و متن وضعیت به کانتینر
  statusContainer.appendChild(spinner);
  statusContainer.appendChild(uploadStatusElement);

  // زمان پیام
  const messageTime = document.createElement("p");
  messageTime.className = "telegram-message-time";
  messageTime.textContent = "در حال ارسال...";
  messageTime.style.cssText = `
        font-size: 10px;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 4px;
        margin-bottom: 0;
        padding: 0 5px;
        display: block;
        width: 100%;
        text-align: right;
    `;

  // اضافه کردن المان‌ها به پیام
  messageContent.appendChild(uploadTitle);
  messageContent.appendChild(fileNameElement);
  messageContent.appendChild(fileDetailsElement);
  messageContent.appendChild(statusContainer);

  messageDiv.appendChild(messageContent);
  messageDiv.appendChild(messageTime);

  //('پیام پیشرفت آپلود ایجاد شد با شناسه:', messageId);

  return messageDiv;
}

// تابع کمکی برای فرمت‌بندی اندازه فایل
function formatFileSize(bytes) {
  if (bytes === 0) return "0 بایت";

  const k = 1024;
  const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// تابع ایجاد نمایش فایل ضمیمه در پیام‌های ارسال شده
window.createAttachmentPreview = function (attachment, messageElement) {
  // بررسی وجود پارامترهای ورودی
  if (!attachment || !messageElement) {
    console.error(
      "پارامترهای ورودی برای تابع createAttachmentPreview ناقص است"
    );
    return;
  }

  //('ایجاد نمایش فایل ضمیمه:', attachment);

  // استخراج اطلاعات فایل
  const fileUrl = attachment.file_url || "";
  const fileName = fileUrl.split("/").pop() || "فایل";
  const fileExtension = fileName.split(".").pop().toLowerCase();
  const fileSize = attachment.file_size || 0;
  const fileType = attachment.file_type || "";

  // ایجاد کانتینر اصلی برای نمایش فایل
  const attachmentContainer = document.createElement("div");
  attachmentContainer.className = "telegram-attachment-container";
  attachmentContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        background-color: #0F9D58;
        border-radius: 10px;
        padding: 10px 12px;
        margin-top: 10px;
        cursor: pointer;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
    `;

  // اضافه کردن افکت گرادیان به پس‌زمینه
  const gradientOverlay = document.createElement("div");
  gradientOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 100%);
        pointer-events: none;
    `;
  attachmentContainer.appendChild(gradientOverlay);

  // تعیین آیکون مناسب بر اساس نوع فایل
  let fileIcon = "";
  if (fileType.includes("image")) {
    fileIcon =
      '<i class="fa-regular fa-image" style="margin-left: 8px; font-size: 22px;"></i>';
  } else if (fileType.includes("audio")) {
    fileIcon =
      '<i class="fa-solid fa-music" style="margin-left: 8px; font-size: 22px;"></i>';
  } else if (fileType.includes("video")) {
    fileIcon =
      '<i class="fa-solid fa-video" style="margin-left: 8px; font-size: 22px;"></i>';
  } else if (fileType.includes("pdf")) {
    fileIcon =
      '<i class="fa-solid fa-file-pdf" style="margin-left: 8px; font-size: 22px;"></i>';
  } else if (fileType.includes("word") || fileType.includes("document")) {
    fileIcon =
      '<i class="fa-solid fa-file-word" style="margin-left: 8px; font-size: 22px;"></i>';
  } else if (fileType.includes("excel") || fileType.includes("sheet")) {
    fileIcon =
      '<i class="fa-solid fa-file-excel" style="margin-left: 8px; font-size: 22px;"></i>';
  } else {
    fileIcon =
      '<i class="fa-solid fa-file" style="margin-left: 8px; font-size: 22px;"></i>';
  }

  // ایجاد هدر فایل با آیکون و دکمه دانلود
  const attachmentHeader = document.createElement("div");
  attachmentHeader.className = "telegram-attachment-header";
  attachmentHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    `;

  // آیکون فایل
  const iconElement = document.createElement("div");
  iconElement.className = "telegram-attachment-icon";
  iconElement.innerHTML = fileIcon;
  iconElement.style.cssText = `
        color: #fff;
        display: flex;
        align-items: center;
    `;

  // دکمه دانلود
  const downloadButton = document.createElement("a");
  downloadButton.href = fileUrl;
  downloadButton.download = fileName;
  downloadButton.className = "telegram-attachment-download";
  downloadButton.innerHTML = '<i class="fa-solid fa-download"></i>';
  downloadButton.style.cssText = `
        color: #fff;
        font-size: 16px;
        text-decoration: none;
        background-color: rgba(255, 255, 255, 0.2);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
    `;

  // اضافه کردن افکت hover به دکمه دانلود
  downloadButton.addEventListener("mouseover", function () {
    this.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
  });

  downloadButton.addEventListener("mouseout", function () {
    this.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
  });

  // اضافه کردن آیکون و دکمه دانلود به هدر
  attachmentHeader.appendChild(iconElement);
  attachmentHeader.appendChild(downloadButton);

  // اطلاعات فایل
  const attachmentInfo = document.createElement("div");
  attachmentInfo.className = "telegram-attachment-info";
  attachmentInfo.style.cssText = `
        display: flex;
        flex-direction: column;
    `;

  // نام فایل
  const attachmentName = document.createElement("div");
  attachmentName.className = "telegram-attachment-name";
  attachmentName.textContent = fileName;
  attachmentName.style.cssText = `
        font-size: 14px;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        font-weight: bold;
    `;

  // اطلاعات اضافی فایل (پسوند و حجم)
  const attachmentDetails = document.createElement("div");
  attachmentDetails.className = "telegram-attachment-details";

  // نمایش پسوند و حجم فایل به صورت جداگانه با فاصله بینشان
  const detailsContainer = document.createElement("div");
  detailsContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        direction: ltr;
    `;

  // پسوند فایل - راست‌چین
  const fileExtensionSpan = document.createElement("span");
  fileExtensionSpan.textContent = fileExtension.toUpperCase();
  fileExtensionSpan.style.cssText = `
        direction: rtl;
        text-align: right;
    `;

  // حجم فایل - چپ‌چین
  const fileSizeSpan = document.createElement("span");
  fileSizeSpan.textContent = formatFileSize(fileSize);
  fileSizeSpan.style.cssText = `
        direction: ltr;
        text-align: left;
    `;

  // اضافه کردن پسوند و حجم به کانتینر جزئیات
  detailsContainer.appendChild(fileExtensionSpan);
  detailsContainer.appendChild(fileSizeSpan);

  attachmentDetails.appendChild(detailsContainer);
  attachmentDetails.style.cssText = `
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
    `;

  // اضافه کردن اطلاعات فایل به کانتینر اطلاعات
  attachmentInfo.appendChild(attachmentName);
  attachmentInfo.appendChild(attachmentDetails);

  // اضافه کردن همه اجزا به کانتینر اصلی
  attachmentContainer.appendChild(attachmentHeader);
  attachmentContainer.appendChild(attachmentInfo);

  // اضافه کردن افکت hover به کانتینر
  attachmentContainer.addEventListener("mouseover", function () {
    this.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
  });

  attachmentContainer.addEventListener("mouseout", function () {
    this.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.1)";
  });

  // اضافه کردن رویداد کلیک برای باز کردن فایل
  attachmentContainer.addEventListener("click", function (e) {
    // جلوگیری از انتشار رویداد کلیک به دکمه دانلود
    if (e.target !== downloadButton && !downloadButton.contains(e.target)) {
      window.open(fileUrl, "_blank");
    }
  });

  // اضافه کردن کانتینر فایل به پیام
  const messageContent = messageElement.querySelector(
    ".telegram-message-content"
  );
  if (messageContent) {
    messageContent.appendChild(attachmentContainer);
  } else {
    console.error("عنصر محتوای پیام یافت نشد");
  }

  return attachmentContainer;
};
