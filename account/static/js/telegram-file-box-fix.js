/**
 * فایل اصلاح نمایش اطلاعات فایل در کلاس telegram-file-box
 * این فایل برای اصلاح مشکل نمایش اطلاعات فایل در باکس فایل تلگرام ایجاد شده است
 */

document.addEventListener("DOMContentLoaded", function () {
  /**
   * تابع اصلاح نمایش اطلاعات فایل در کلاس telegram-file-box
   * این تابع تمام عناصر با کلاس telegram-file-box را پیدا کرده و اطلاعات فایل را به آنها اضافه می‌کند
   */
  function fixTelegramFileBox() {
    // یافتن تمام عناصر با کلاس telegram-file-box
    const fileBoxes = document.querySelectorAll(".telegram-file-box");

    // بررسی هر عنصر
    fileBoxes.forEach((fileBox, index) => {
      // بررسی اگر قبلاً اصلاح شده است
      if (fileBox.dataset.fixed === "true") {
        return;
      }

      // یافتن لینک دانلود فایل
      const downloadLink = fileBox.querySelector("a[href]");
      if (!downloadLink) {
        console.warn(`لینک دانلود در عنصر شماره ${index + 1} یافت نشد`);
        return;
      }

      // استخراج آدرس فایل
      const fileUrl = downloadLink.href;

      // استخراج نام فایل از URL
      const fileName = fileUrl.split("/").pop().split("?")[0];
      const decodedFileName = decodeURIComponent(fileName);

      // استخراج پسوند فایل
      const fileExtension = decodedFileName.split(".").pop().toLowerCase();

      // تعیین نوع فایل بر اساس پسوند
      let fileType = "unknown";
      let iconClass = "fa-file";
      let iconColor = "";

      if (
        ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension)
      ) {
        fileType = "image";
        iconClass = "fa-image";
      } else if (["mp3", "wav", "ogg", "flac", "m4a"].includes(fileExtension)) {
        fileType = "audio";
        iconClass = "fa-music";
        iconColor = "doc";
      } else if (
        ["mp4", "webm", "avi", "mov", "wmv", "flv"].includes(fileExtension)
      ) {
        fileType = "video";
        iconClass = "fa-video";
        iconColor = "excel";
      } else if (fileExtension === "pdf") {
        fileType = "pdf";
        iconClass = "fa-file-pdf";
        iconColor = "pdf";
      } else if (["doc", "docx", "rtf", "txt"].includes(fileExtension)) {
        fileType = "document";
        iconClass = "fa-file-word";
        iconColor = "doc";
      } else if (["xls", "xlsx", "csv"].includes(fileExtension)) {
        fileType = "spreadsheet";
        iconClass = "fa-file-excel";
        iconColor = "excel";
      } else if (["ppt", "pptx"].includes(fileExtension)) {
        fileType = "presentation";
        iconClass = "fa-file-powerpoint";
        iconColor = "presentation";
      } else if (["zip", "rar", "7z", "tar", "gz"].includes(fileExtension)) {
        fileType = "archive";
        iconClass = "fa-file-archive";
        iconColor = "archive";
      }

      // نمایش مستقیم محتوای فایل بدون اسکلتون لودینگ
      updateFileBoxContent(fileBox, {
        name: decodedFileName,
        extension: fileExtension,
        size: null, // ابتدا حجم را null قرار می‌دهیم
        type: fileType,
        iconClass: iconClass,
        iconColor: iconColor,
        url: fileUrl,
      });

      // دریافت اطلاعات فایل از سرور
      getFileInfo(fileUrl)
        .then((fileInfo) => {
          // اگر حجم فایل با موفقیت دریافت شد، به‌روزرسانی کنیم
          if (fileInfo.size && fileInfo.size > 0) {
            updateFileSize(fileBox, fileInfo.size);
          }
        })
        .catch((error) => {
          console.error(`خطا در دریافت اطلاعات فایل: ${error.message}`);
          // در صورت خطا، حجم فایل را نمایش نمی‌دهیم
        });
    });
  }

  /**
   * به‌روزرسانی فقط حجم فایل
   * @param {HTMLElement} fileBox - المنت باکس فایل
   * @param {number} size - حجم فایل به بایت
   */
  function updateFileSize(fileBox, size) {
    if (!size || size <= 0) return; // اگر حجم صفر یا نامعتبر است، کاری نکنیم

    const fileMeta = fileBox.querySelector(".telegram-file-meta");
    if (!fileMeta) return;

    const fileType = fileMeta.querySelector(".telegram-file-type");
    if (!fileType) return;

    // حذف المنت قبلی حجم فایل اگر وجود داشته باشد
    const oldFileSize = fileMeta.querySelector(".telegram-file-size");
    if (oldFileSize) {
      oldFileSize.remove();
    }

    // ایجاد المنت جدید برای نمایش حجم فایل
    const fileSize = document.createElement("span");
    fileSize.className = "telegram-file-size";

    // فرمت‌بندی حجم فایل
    const formattedSize = formatFileSize(size);
    fileSize.textContent = ` • ${formattedSize}`;

    // اضافه کردن به متا
    fileMeta.appendChild(fileSize);
  }

  /**
   * به‌روزرسانی محتوای باکس فایل
   * @param {HTMLElement} fileBox - المنت باکس فایل
   * @param {Object} fileData - اطلاعات فایل
   */
  function updateFileBoxContent(fileBox, fileData) {
    // پاک کردن محتوای فعلی
    fileBox.innerHTML = "";

    // علامت‌گذاری به عنوان اصلاح شده
    fileBox.dataset.fixed = "true";

    // ایجاد آیکون فایل
    const fileIconWrapper = document.createElement("div");
    fileIconWrapper.className = "telegram-file-icon-wrapper";

    const fileIcon = document.createElement("div");
    fileIcon.className = `telegram-file-icon ${fileData.iconColor}`;
    fileIcon.innerHTML = `<i class="fa-regular ${fileData.iconClass}"></i>`;

    fileIconWrapper.appendChild(fileIcon);

    // ایجاد بخش اطلاعات فایل
    const fileInfo = document.createElement("div");
    fileInfo.className = "telegram-file-info";

    // نام فایل
    const fileName = document.createElement("div");
    fileName.className = "telegram-file-name";
    fileName.textContent = fileData.name;
    fileInfo.appendChild(fileName);

    // اطلاعات متا (سایز و نوع)
    const fileMeta = document.createElement("div");
    fileMeta.className = "telegram-file-meta";

    // نوع و پسوند فایل
    const fileType = document.createElement("span");
    fileType.className = "telegram-file-type";
    fileType.textContent = fileData.extension.toUpperCase();
    fileMeta.appendChild(fileType);

    // سایز فایل - فقط اگر مقدار معتبر داشته باشیم نمایش می‌دهیم
    if (fileData.size && fileData.size > 0) {
      const fileSize = document.createElement("span");
      fileSize.className = "telegram-file-size";
      const formattedSize = formatFileSize(fileData.size);
      fileSize.textContent = ` • ${formattedSize}`;
      fileMeta.appendChild(fileSize);
    }

    fileInfo.appendChild(fileMeta);

    // دکمه دانلود
    const downloadBtn = document.createElement("a");
    downloadBtn.href = fileData.url;
    downloadBtn.download = fileData.name;
    downloadBtn.className = "telegram-download-btn";
    downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
    downloadBtn.title = "دانلود فایل";

    // اضافه کردن عناصر به باکس فایل
    fileBox.appendChild(fileIconWrapper);
    fileBox.appendChild(fileInfo);
    fileBox.appendChild(downloadBtn);
  }

  /**
   * تابع دریافت اطلاعات فایل از سرور
   * @param {string} fileUrl - آدرس فایل
   * @returns {Promise} - وعده حاوی اطلاعات فایل (اندازه و نوع)
   */
  function getFileInfo(fileUrl) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("HEAD", fileUrl, true);

      // تنظیم تایم‌اوت برای جلوگیری از انتظار طولانی
      xhr.timeout = 5000; // 5 ثانیه تایم‌اوت

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          const size = xhr.getResponseHeader("Content-Length");
          const type = xhr.getResponseHeader("Content-Type");

          resolve({
            size: size ? parseInt(size) : 0,
            type: type || "",
          });
        } else {
          reject(new Error(`خطا در دریافت اطلاعات فایل: ${xhr.status}`));
        }
      };

      xhr.onerror = function () {
        reject(new Error("خطای شبکه در دریافت اطلاعات فایل"));
      };

      xhr.ontimeout = function () {
        reject(new Error("تایم‌اوت در دریافت اطلاعات فایل"));
      };

      xhr.send();
    });
  }

  /**
   * تابع فرمت‌بندی اندازه فایل
   * @param {number} bytes - اندازه فایل به بایت
   * @returns {string} - اندازه فایل فرمت‌بندی شده
   */
  function formatFileSize(bytes) {
    if (!bytes || bytes <= 0) return "";

    const k = 1024;
    const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];

    // اصلاح محاسبه اندازه فایل
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // استفاده از toFixed(1) برای نمایش یک رقم اعشار و حذف اعشارهای اضافی با parseFloat
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(1));

    return formattedSize + " " + sizes[i];
  }

  // اجرای تابع اصلاح بعد از بارگذاری صفحه
  setTimeout(fixTelegramFileBox, 500);

  // ایجاد یک MutationObserver برای نظارت بر تغییرات DOM و اصلاح عناصر جدید
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // بررسی اگر عناصر جدیدی با کلاس telegram-file-box اضافه شده‌اند
        let hasNewFileBox = false;

        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // عنصر HTML
            if (
              node.classList &&
              node.classList.contains("telegram-file-box")
            ) {
              hasNewFileBox = true;
            } else if (node.querySelectorAll) {
              const fileBoxes = node.querySelectorAll(".telegram-file-box");
              if (fileBoxes.length > 0) {
                hasNewFileBox = true;
              }
            }
          }
        });

        if (hasNewFileBox) {
          fixTelegramFileBox();
        }
      }
    });
  });

  // شروع نظارت بر تغییرات در کل بدنه سند
  observer.observe(document.body, { childList: true, subtree: true });
});
