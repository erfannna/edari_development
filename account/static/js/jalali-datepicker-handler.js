/**
 * مدیریت انتخابگر تاریخ شمسی
 * این فایل برای مدیریت انتخابگر تاریخ شمسی در صفحه چت تلگرام استفاده می‌شود
 */

//('فایل jalali-datepicker-handler.js با موفقیت بارگذاری شد');

// متغیر برای ذخیره زمان انتخاب شده
window.scheduledTime = null;

// راه‌اندازی اولیه تقویم
document.addEventListener("DOMContentLoaded", function () {
  //('راه‌اندازی تقویم شمسی...');

  if (typeof jalaliDatepicker !== "undefined") {
    // شروع نظارت بر ورودی‌های تاریخ
    jalaliDatepicker.startWatch({
      minDate: "today",
      time: true,
      autoHide: true,
      hideAfterChange: true,
    });

    //('تقویم شمسی با موفقیت راه‌اندازی شد');
  } else {
    console.error("کتابخانه jalaliDatepicker بارگذاری نشده است");
  }

  // بازنویسی تابع loadJalaliDatepickerLibrary موجود
  if (typeof window.loadJalaliDatepickerLibrary === "function") {
    //('بازنویسی تابع loadJalaliDatepickerLibrary...');

    // ذخیره تابع قبلی برای اطمینان
    window._originalLoadJalaliDatepickerLibrary =
      window.loadJalaliDatepickerLibrary;

    // بازنویسی تابع
    window.loadJalaliDatepickerLibrary = function () {
      //('اجرای نسخه جدید تابع loadJalaliDatepickerLibrary');

      // بررسی اگر قبلا بارگذاری شده است
      if (typeof jalaliDatepicker !== "undefined") {
        //('کتابخانه تقویم شمسی قبلا بارگذاری شده است');
        return;
      }

      // بارگذاری فایل CSS از استاتیک
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "/static/css/jalalidatepicker.min.css";
      document.head.appendChild(cssLink);

      // بارگذاری فایل JavaScript از استاتیک
      const jsScript = document.createElement("script");
      jsScript.type = "text/javascript";
      jsScript.src = "/static/js/jalalidatepicker.min.js";

      // پس از بارگذاری کتابخانه، تقویم را راه‌اندازی کن
      jsScript.onload = function () {
        //('کتابخانه تقویم شمسی با موفقیت بارگذاری شد');

        // راه‌اندازی تقویم
        jalaliDatepicker.startWatch({
          minDate: "today",
          time: true,
          autoHide: true,
          hideAfterChange: true,
        });

        // نمایش مجدد پنل زمانبندی
        if (typeof window.showSchedulePanel === "function") {
          window.showSchedulePanel(false);
        }
      };

      document.head.appendChild(jsScript);
    };

    //('تابع loadJalaliDatepickerLibrary با موفقیت بازنویسی شد');
  } else {
    console.error("تابع loadJalaliDatepickerLibrary یافت نشد");
  }
});

// تنظیم رویدادها
function setupDatepickerEvents() {
  // رویداد تغییر مقدار فیلد زمانبندی
  const scheduledTimeInput = document.getElementById("scheduledTimeInput");
  if (scheduledTimeInput) {
    // اضافه کردن رویداد input برای شناسایی تغییرات در همان لحظه
    scheduledTimeInput.addEventListener("input", function () {
      //('تغییر در حال انجام در ورودی تاریخ:', this.value);
    });

    scheduledTimeInput.addEventListener("change", function () {
      //('تاریخ تغییر کرد:', this.value);

      // بررسی مقدار وارد شده
      if (!this.value || this.value.trim() === "") {
        console.warn("مقدار تاریخ خالی است");
        window.scheduledTime = null;
        return;
      }

      // تبدیل تاریخ شمسی به میلادی
      const jalaliDate = this.value;
      const gregorianDate = jalaliToGregorian(jalaliDate);

      if (gregorianDate && !isNaN(gregorianDate)) {
        // تبدیل تاریخ به فرمت ISO برای ارسال به سرور
        window.scheduledTime = gregorianDate.toISOString();
        //('تاریخ ذخیره شده (ISO):', window.scheduledTime);

        // تست اطمینان از تبدیل صحیح
        const testDate = new Date(window.scheduledTime);
        //('تاریخ بازیابی شده از ISO:', testDate);
        //('سال میلادی:', testDate.getFullYear());

        // اطمینان از اینکه تاریخ میلادی است نه شمسی
        if (testDate.getFullYear() > 2000) {
          //('تاریخ به درستی به میلادی تبدیل شده است');

          // تبدیل سال شمسی به میلادی برای اطمینان
          const jalaliYear = parseInt(jalaliDate.split("/")[0]);
          const expectedGregorianYear = jalaliYear + 621;

          //(`انتظار می‌رود سال میلادی حدود ${expectedGregorianYear} باشد`);
          //(`سال میلادی واقعی: ${testDate.getFullYear()}`);

          // بررسی تقریبی صحت تبدیل
          if (Math.abs(testDate.getFullYear() - expectedGregorianYear) <= 1) {
            //('تبدیل تاریخ صحیح به نظر می‌رسد');
          } else {
            console.error("خطا در تبدیل سال شمسی به میلادی!");
            console.error(
              `سال شمسی ${jalaliYear} باید به حدود ${expectedGregorianYear} تبدیل شود، اما ${testDate.getFullYear()} شده است`
            );
          }
        } else {
          console.error("خطا: تاریخ هنوز به صورت شمسی است!");
        }

        // نمایش تاریخ انتخاب شده در پنل زمانبندی
        const scheduleTimeDisplay = document.getElementById(
          "scheduleTimeDisplay"
        );
        if (scheduleTimeDisplay) {
          scheduleTimeDisplay.textContent = this.value;

          // حذف کلاس "انتخاب نشده" اگر وجود داشته باشد
          scheduleTimeDisplay.classList.remove("not-selected");
          scheduleTimeDisplay.classList.add("selected");
        }

        // نمایش پنل زمانبندی
        const schedulePanel = document.getElementById("schedulePanel");
        if (schedulePanel) {
          schedulePanel.style.display = "flex";
        }

        // حذف کلاس active از overlay پس از انتخاب تاریخ
        const overlay = document.getElementById("jdpModalOverlay");
        if (overlay) {
          overlay.classList.remove("active");
        }
      } else {
        console.error("تاریخ غیرمعتبر:", jalaliDate);
        alert("لطفاً یک تاریخ معتبر انتخاب کنید.");
        window.scheduledTime = null;
      }
    });
  } else {
    console.error("ورودی تاریخ یافت نشد (scheduledTimeInput)");
  }

  // رویداد کلیک روی دکمه زمانبندی
  const scheduleMessageBtn = document.getElementById("scheduleBtn");
  if (scheduleMessageBtn) {
    scheduleMessageBtn.addEventListener("click", function () {
      //('دکمه زمانبندی کلیک شد');

      // اطمینان از بارگذاری تقویم
      if (typeof jalaliDatepicker === "undefined") {
        //('تلاش برای بارگذاری کتابخانه تقویم شمسی');
        if (typeof loadJalaliDatepickerLibrary === "function") {
          loadJalaliDatepickerLibrary();
        }
      }

      if (typeof window.showSchedulePanel === "function") {
        window.showSchedulePanel(true);
      }
    });
  } else {
    console.error("دکمه زمانبندی یافت نشد (scheduleMessageBtn)");
  }

  // رویداد کلیک روی دکمه حذف زمانبندی
  const removeScheduleBtn = document.getElementById("removeScheduleBtn");
  if (removeScheduleBtn) {
    removeScheduleBtn.addEventListener("click", function () {
      const schedulePanel = document.getElementById("schedulePanel");
      const scheduledTimeInput = document.getElementById("scheduledTimeInput");
      const scheduleTimeDisplay = document.getElementById(
        "scheduleTimeDisplay"
      );

      if (schedulePanel) schedulePanel.style.display = "none";
      if (scheduledTimeInput) scheduledTimeInput.value = "";
      window.scheduledTime = null;

      //('زمانبندی پاک شد، مقدار scheduledTime:', window.scheduledTime);

      if (scheduleTimeDisplay) {
        scheduleTimeDisplay.textContent = "انتخاب نشده";

        // اضافه کردن کلاس "انتخاب نشده"
        scheduleTimeDisplay.classList.add("not-selected");
        scheduleTimeDisplay.classList.remove("selected");
      }
    });
  } else {
    console.error("دکمه حذف زمانبندی یافت نشد (removeScheduleBtn)");
  }

  // اضافه کردن رویداد کلیک به "انتخاب نشده" برای باز کردن تقویم
  const scheduleTimeDisplay = document.getElementById("scheduleTimeDisplay");
  if (scheduleTimeDisplay) {
    scheduleTimeDisplay.style.cursor = "pointer";
    scheduleTimeDisplay.addEventListener("click", function () {
      //('روی نمایش تاریخ کلیک شد');

      // نمایش تقویم
      const scheduledTimeInput = document.getElementById("scheduledTimeInput");
      if (scheduledTimeInput && typeof jalaliDatepicker !== "undefined") {
        try {
          // فعال کردن فیلد ورودی قبل از نمایش تقویم
          scheduledTimeInput.disabled = false;
          scheduledTimeInput.readOnly = false;

          // اضافه کردن تاخیر کوتاه برای اطمینان از اعمال تغییرات
          setTimeout(() => {
            try {
              // تلاش برای نمایش تقویم
              jalaliDatepicker.show(scheduledTimeInput);
            } catch (err) {
              console.error("خطا در نمایش تقویم:", err);
              // روش جایگزین: کلیک مستقیم روی فیلد ورودی
              scheduledTimeInput.focus();
              scheduledTimeInput.click();
            }
          }, 100);
        } catch (err) {
          console.error("خطا در فعال کردن فیلد انتخاب تاریخ:", err);
        }
      }
    });

    // اضافه کردن کلاس "انتخاب نشده" در ابتدا
    if (
      scheduleTimeDisplay.textContent === "انتخاب نشده" ||
      !scheduleTimeDisplay.textContent.trim()
    ) {
      scheduleTimeDisplay.classList.add("not-selected");
      scheduleTimeDisplay.classList.remove("selected");
    } else {
      scheduleTimeDisplay.classList.add("selected");
      scheduleTimeDisplay.classList.remove("not-selected");
    }
  } else {
    console.error("نمایش تاریخ یافت نشد (scheduleTimeDisplay)");
  }

  // اضافه کردن رویداد برای overlay تقویم برای حذف کلاس active هنگام کلیک روی آن
  const overlay = document.getElementById("jdpModalOverlay");
  if (overlay) {
    overlay.addEventListener("click", function () {
      this.classList.remove("active");
      // همچنین تقویم را ببند
      if (typeof jalaliDatepicker !== "undefined") {
        jalaliDatepicker.hide();
      }
    });
  }

  // اضافه کردن رویداد به تقویم شمسی برای حذف کلاس active از overlay هنگام انتخاب تاریخ
  document.addEventListener("jdp:change", function () {
    const overlay = document.getElementById("jdpModalOverlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
  });

  // همچنین برداشتن overlay هنگام بستن تقویم
  document.addEventListener("jdp:hide", function () {
    const overlay = document.getElementById("jdpModalOverlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
  });
}

// اضافه کردن استایل‌های CSS مورد نیاز
function addRequiredStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
        #scheduleTimeDisplay.not-selected {
            color: #ff5722;
            background-color: rgba(255, 87, 34, 0.1);
        }
        
        #scheduleTimeDisplay.selected {
            color: #0F9D58;
            background-color: rgba(15, 157, 88, 0.1);
        }
        
        #scheduleTimeDisplay {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        #scheduleTimeDisplay:hover {
            opacity: 0.8;
        }
    `;
  document.head.appendChild(styleElement);
}

// تنظیم رویدادها در زمان بارگذاری صفحه
document.addEventListener("DOMContentLoaded", function () {
  setupDatepickerEvents();
  addRequiredStyles();
});

// تابع تبدیل تاریخ شمسی به میلادی
function jalaliToGregorian(jDate) {
  // فرمت ورودی: 1404/04/29 09:55:00
  if (!jDate || typeof jDate !== "string" || jDate.trim() === "") {
    console.error("تاریخ شمسی نامعتبر یا خالی است:", jDate);
    return null;
  }

  //('تبدیل تاریخ شمسی به میلادی:', jDate);

  try {
    // جداسازی تاریخ و زمان
    const parts = jDate.split(" ");
    const datePart = parts[0]; // مثلا 1404/04/29
    let timePart = parts.length > 1 ? parts[1] : "00:00:00"; // مثلا 09:55:00

    // اطمینان از فرمت صحیح زمان (اگر ثانیه نداشت)
    if (timePart.split(":").length === 2) {
      timePart += ":00";
    }

    // جداسازی اجزای تاریخ
    const dateParts = datePart.split("/");
    if (dateParts.length !== 3) {
      console.error("فرمت تاریخ نامعتبر است - باید به صورت سال/ماه/روز باشد");
      return null;
    }

    // تبدیل اعداد فارسی به انگلیسی
    const toEnglishDigits = (str) =>
      str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

    const jYear = parseInt(toEnglishDigits(dateParts[0]));
    const jMonth = parseInt(toEnglishDigits(dateParts[1]));
    const jDay = parseInt(toEnglishDigits(dateParts[2]));

    // بررسی اعداد وارد شده
    if (isNaN(jYear) || isNaN(jMonth) || isNaN(jDay)) {
      console.error("اعداد تاریخ نامعتبر هستند:", { jYear, jMonth, jDay });
      return null;
    }

    // بررسی محدوده تاریخ
    if (
      jYear < 1300 ||
      jYear > 1500 ||
      jMonth < 1 ||
      jMonth > 12 ||
      jDay < 1 ||
      jDay > 31
    ) {
      console.error("محدوده تاریخ نامعتبر است:", { jYear, jMonth, jDay });
      return null;
    }

    // جداسازی اجزای زمان
    const timeParts = timePart.split(":");
    let hour = parseInt(toEnglishDigits(timeParts[0]));
    let minute = parseInt(toEnglishDigits(timeParts[1]));
    let second =
      timeParts.length > 2 ? parseInt(toEnglishDigits(timeParts[2])) : 0;

    // بررسی اعداد وارد شده
    if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
      console.warn("اعداد زمان نامعتبر هستند، مقدار پیش فرض استفاده می شود");
      hour = 0;
      minute = 0;
      second = 0;
    }

    // بررسی محدوده زمان
    hour = Math.min(Math.max(hour, 0), 23);
    minute = Math.min(Math.max(minute, 0), 59);
    second = Math.min(Math.max(second, 0), 59);

    // استفاده از الگوریتم دقیق تبدیل تاریخ شمسی به میلادی
    function jalaliToGregorianConverter(jy, jm, jd) {
      jy = parseInt(jy);
      jm = parseInt(jm);
      jd = parseInt(jd);

      var sal_a, gy, gm, gd, days;
      if (jy > 979) {
        gy = 1600;
        jy -= 979;
      } else {
        gy = 621;
      }

      days =
        365 * jy +
        parseInt(jy / 33) * 8 +
        parseInt(((jy % 33) + 3) / 4) +
        78 +
        jd;

      if (jm < 7) {
        days += (jm - 1) * 31;
      } else {
        days += (jm - 7) * 30 + 186;
      }

      gy += 400 * parseInt(days / 146097);
      days = days % 146097;

      if (days > 36524) {
        gy += 100 * parseInt(--days / 36524);
        days = days % 36524;

        if (days >= 365) days++;
      }

      gy += 4 * parseInt(days / 1461);
      days = days % 1461;

      if (days > 365) {
        gy += parseInt((days - 1) / 365);
        days = (days - 1) % 365;
      }

      gd = days + 1;

      var sal_a = [
        0,
        31,
        (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];

      for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) {
        gd -= sal_a[gm];
      }

      return [gy, gm, gd];
    }

    // تبدیل تاریخ شمسی به میلادی
    const gDate = jalaliToGregorianConverter(jYear, jMonth, jDay);
    if (gDate && gDate.length === 3) {
      const gYear = gDate[0];
      const gMonth = gDate[1] - 1; // ماه در جاوااسکریپت از 0 شروع می‌شود
      const gDay = gDate[2];

      // ساخت تاریخ میلادی
      const gregorianDate = new Date(gYear, gMonth, gDay, hour, minute, second);

      // //('تاریخ میلادی ایجاد شده:', {
      //     date: gregorianDate,
      //     isoString: gregorianDate.toISOString(),
      //     components: {
      //         year: gYear,
      //         month: gMonth + 1,
      //         day: gDay,
      //         hour: hour,
      //         minute: minute,
      //         second: second
      //     }
      // });

      return gregorianDate;
    }

    return null;
  } catch (error) {
    console.error("خطا در تبدیل تاریخ شمسی به میلادی:", error);
    return null;
  }
}

// تبدیل تاریخ میلادی به شمسی
function getJalaliDate(date) {
  try {
    // تبدیل تاریخ میلادی به شمسی
    function gregorianToJalali(gy, gm, gd) {
      var g_d_m, jy, jm, jd;
      g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      gy2 = gm > 2 ? gy + 1 : gy;
      d =
        g_d_m[gm - 1] +
        gd +
        parseInt((gy2 + 3) / 4) -
        parseInt((gy2 + 99) / 100) +
        parseInt((gy2 + 399) / 400) -
        80;

      jy = -1595 + 33 * parseInt(d / 12053);
      d %= 12053;
      jy += 4 * parseInt(d / 1461);
      d %= 1461;

      if (d > 365) {
        jy += parseInt((d - 1) / 365);
        d = (d - 1) % 365;
      }

      if (d < 186) {
        jm = 1 + parseInt(d / 31);
        jd = 1 + (d % 31);
      } else {
        jm = 7 + parseInt((d - 186) / 30);
        jd = 1 + ((d - 186) % 30);
      }

      return [jy, jm, jd];
    }

    // تبدیل عدد به فرمت دو رقمی
    function pad(n) {
      return n < 10 ? "0" + n : n;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // تبدیل به شمسی
    const jalali = gregorianToJalali(year, month, day);

    // ساخت رشته نهایی
    return `${jalali[0]}/${pad(jalali[1])}/${pad(jalali[2])} ${pad(
      hours
    )}:${pad(minutes)}`;
  } catch (error) {
    console.error("خطا در تبدیل تاریخ میلادی به شمسی:", error);

    // برگرداندن تاریخ فعلی به فرمت رشته‌ای
    const now = new Date();
    return `${now.getFullYear()}/01/01 12:00`;
  }
}
