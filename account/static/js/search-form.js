jalaliDatepicker.updateOptions({"minDate": "attr"});
jalaliDatepicker.updateOptions({"maxDate": "attr"});

$(" #id_start_date ").change(function() {
    let minDate = $(this).val();
    $(" #id_end_date ").attr('data-jdp-min-date', minDate);

});
$(" #id_end_date ").change(function() {
    let maxDate = $(this).val();
    $(" #id_start_date ").attr('data-jdp-max-date', maxDate);

});

// اسکریپت برای مدیریت table-filter-bar
$(document).ready(function() {
    // متغیرهای اصلی
    const $tableSearch = $('#tableSearch');
    const $filterColumn = $('#filterColumn');
    const $filterChips = $('.filter-chip');
    const $tableRows = $('#dataTable tbody tr');
    
    // فانکشن برای فیلتر کردن جدول
    function filterTable() {
        const searchValue = $tableSearch.val() ? $tableSearch.val().trim().toLowerCase() : '';
        const columnValue = $filterColumn.val() ? $filterColumn.val() : 'all';
        const statusValue = $('.filter-chip.active').data('status') || 'all';
        
        //('فیلتر با مقادیر:', { جستجو: searchValue, ستون: columnValue, وضعیت: statusValue });
        
        $tableRows.each(function() {
            let showRow = true;
            const $row = $(this);
            
            // فیلتر بر اساس متن جستجو
            if (searchValue !== '') {
                showRow = false;
                $row.find('td').each(function() {
                    const $cell = $(this);
                    if (columnValue === 'all' || $cell.data('column') === columnValue) {
                        if ($cell.text().trim().toLowerCase().includes(searchValue)) {
                            showRow = true;
                            return false; // خروج از حلقه
                        }
                    }
                });
            }
            
            // فیلتر بر اساس وضعیت
            if (showRow && statusValue !== 'all') {
                const statusText = $row.find('td[data-column="status"]').text().trim();
                if (!statusText.includes(statusValue)) {
                    showRow = false;
                }
            }
            
            // نمایش یا مخفی کردن سطر
            $row.toggle(showRow);
        });
    }
    
    // رویدادها برای فیلتر
    $tableSearch.on('input', filterTable);
    $filterColumn.on('change', filterTable);
    
    // رویداد برای فیلتر چیپ‌ها
    $filterChips.on('click', function() {
        $filterChips.removeClass('active');
        $(this).addClass('active');
        filterTable();
    });
    
    // اعمال فیلتر اولیه هنگام بارگذاری صفحه
    setTimeout(filterTable, 500); // تاخیر کوتاه برای اطمینان از بارگذاری کامل داده‌ها
});