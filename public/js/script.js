document.addEventListener("DOMContentLoaded", function () {
    // Hàm lấy cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Hàm set cookie
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    const popup = document.getElementById('ad-popup');
    const closeBtn = document.getElementById('close-popup');

    // Kiểm tra nếu chưa có cookie 'hidePopup'
    if (!getCookie('hidePopup')) {
        // Yêu cầu: Sau 1 phút (60000ms) thì hiện 
        setTimeout(() => {
            if (popup) popup.style.display = 'block';
        }, 60000);
        // Để test nhanh bạn có thể sửa 60000 thành 3000 (3 giây)
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            // Yêu cầu: Lần sau mở trang không hiện lại 
            setCookie('hidePopup', 'true', 1); // Lưu cookie 1 ngày
        });
    }
});