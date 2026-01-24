# 🏠 Thuê Nhà 24h - Web Project

Website cho thuê nhà, phòng trọ, căn hộ mini. Dự án kết thúc môn Lập trình Web.

## 📋 Yêu cầu hệ thống (Prerequisites)
Để chạy dự án này, máy tính cần cài đặt:
1.  **Node.js**: [Tải tại đây](https://nodejs.org/) (Version 14+).
2.  **MongoDB**: Đảm bảo MongoDB đang chạy ở cổng mặc định `27017` (Hoặc dùng MongoDB Compass).

---

## 🛠️ Hướng dẫn Cài đặt (Installation)

**Bước 1: Clone dự án hoặc tải về**
Mở terminal và chạy lệnh sau:
```bash
git clone [https://github.com/doanvnminh/final-web-app.git](https://github.com/doanvnminh/final-web-app.git)
cd final-web-app

Bước 2: Cài đặt các thư viện (Dependencies) Chạy lệnh sau để tải các gói cần thiết (Express, Mongoose, EJS...):
npm install

Bước 3: Khởi chạy Server
node server.js
Lưu ý: Khi chạy lần đầu tiên, hệ thống sẽ tự động tạo dữ liệu mẫu (9 căn nhà, tài khoản Admin) vào Database.

Hướng dẫn Sử dụng (Usage)
Mở trình duyệt và truy cập: http://localhost:3000

1. Tài khoản Đăng nhập (Accounts)
Hệ thống có sẵn 2 tài khoản mẫu để test:
Vai trò (Role),Username,Password,Quyền hạn
Admin,admin,123,"Truy cập trang Quản trị, Xóa bình luận, Sửa bài đăng."
User,user1,123,"Đăng bình luận, đánh giá sao."

2. Các chức năng chính
Trang chủ: Xem danh sách nhà dạng lưới (Grid), phân trang, Responsive.

Chi tiết nhà: Xem thông tin chi tiết, lượt xem (tăng tự động).

Bình luận: Phải đăng nhập mới được bình luận. Bình luận hiển thị công khai ngay lập tức.

Quản trị (Admin):

Xem thống kê tổng lượt truy cập website.

Cập nhật giá tiền, mô tả của nhà.

Xóa các bình luận vi phạm.

Tiện ích khác: Popup quảng cáo (sử dụng Cookie 1 ngày), Form liên hệ.