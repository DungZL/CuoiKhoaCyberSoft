# Dự Án Cuối Khóa 1: Hệ Thống E-Learning Cybersoft

Hệ thống đào tạo lập trình trực tuyến và quản trị trung tâm tin học Cybersoft (**Dự án 1 — E-Learning**), được xây dựng theo đúng đặc tả `DAC_TA_ELEARNING.xmind`, wireframe Balsamiq `xmind.bmpr` và tài liệu Swagger API của Cybersoft.

---

## 1. Công Nghệ & Kiến Trúc

- **Core**: React 18 + TypeScript 5 + Vite 6
- **Routing**: React Router v6 (`templateHome`, `templateLogin` & Popup Auth, `templateAdmin`)
- **Styling**: SASS (`src/styles/style.scss` gom tất cả partials `_variables.scss`, `_base.scss`, `_layouts.scss`, `_components.scss`, `_pages.scss`, `_responsive.scss`), hỗ trợ **Light/Dark Mode** và **Responsive** hoàn chỉnh (Desktop, Laptop, iPad, iPhone).
- **HTTP Client**: Axios Interceptor tự động đính kèm `Authorization: Bearer <accessToken>` và `TokenCybersoft`, cho phép chuyển đổi linh hoạt giữa các domain server (`https://elearning0706.cybersoft.edu.vn` và `https://elearningnew.cybersoft.edu.vn`) cùng các nhóm dữ liệu (`GP01` → `GP15`).

---

## 2. Hướng Dẫn Cài Đặt & Chạy Dự Án

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy môi trường Development (http://localhost:3000)
npm run dev

# 3. Build bản Production
npm run build
```

---

## 3. Tài Khoản Demo Thật Trên Server (1-Click Login)

Trên màn hình **Đăng nhập** (hoặc thanh cảnh báo trong trang Admin), hệ thống tích hợp sẵn nút **Đăng nhập nhanh 1-Click** với tài khoản thực tế trên Server Cybersoft:

| Vai trò | Tài khoản | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Giáo vụ (Admin - GV)** | `bonnamsau` | `bonnamsau` | Toàn quyền Quản lý khóa học, Quản lý người dùng, Xét duyệt & Hủy ghi danh |
| **Học viên (HV)** | `vuachua1` | `123456` | Xem, tìm kiếm, đăng ký khóa học, hủy ghi danh, cập nhật hồ sơ cá nhân |

---

## 4. Danh Mục Chức Năng Đã Hoàn Thiện (100% Đặc Tả)

### A. Module Người Dùng (`templateHome` & `templateLogin`)
1. **Lấy danh sách & Tìm kiếm khóa học (API 1)**: Hiển thị 8 khóa học mới nhất tại Trang chủ, mở rộng xem thêm, lọc theo danh mục và tìm kiếm theo từ khóa tại `/tim-kiem`.
2. **Chi tiết khóa học (API 1.1)**: Trang `/chi-tiet/:maKhoaHoc` hiển thị đầy đủ thông tin, giảng viên, lượt xem, mô tả khóa học.
3. **Danh mục khóa học (API 2 & API 3)**: Dropdown danh mục trên Header và trang `/danh-muc/:maDanhMuc`.
4. **Đăng ký (API 4) & Đăng nhập (API 5)**: Hỗ trợ cả trang riêng (`/dang-nhap`, `/dang-ky`) lẫn Popup Modal, kiểm tra lỗi (Validation) chặt chẽ và lưu phiên đăng nhập vào `localStorage`.
5. **Thông tin cá nhân & Khóa học của tôi (API 6, 7, 8, 9, 10)**:
   - Tab **THÔNG TIN CÁ NHÂN**: Xem và chỉnh sửa thông tin tài khoản (`PUT /api/QuanLyNguoiDung/CapNhatThongTinNguoiDung`).
   - Tab **KHÓA HỌC CỦA TÔI**: Tìm kiếm và sắp xếp A-Z / Z-A bằng ES6 ngay tại Frontend trên mảng `chiTietKhoaHocGhiDanh`, hỗ trợ hủy ghi danh (`POST /api/QuanLyKhoaHoc/HuyGhiDanh`).

### B. Module Quản Trị (`templateAdmin`)
1. **Quản lý người dùng (API 11)**: Tìm kiếm, phân trang, Thêm / Sửa / Xóa người dùng (`GV` và `HV`).
2. **Quản lý khóa học (API 12)**: Tìm kiếm, phân trang, Thêm / Sửa / Xóa khóa học, tự động lấy `file.name` từ thẻ `<input type="file">` và gọi `UploadHinhAnhKhoaHoc` trong `.then()` sau khi thêm/cập nhật.
3. **Ghi danh hai chiều nâng cao (API 13.1 & 13.2)**:
   - **13.1 Ghi danh người dùng dựa vào khóa học**: Lấy danh sách chưa ghi danh, học viên chờ xét duyệt, học viên đã tham gia; Xác thực ghi danh & Hủy ghi danh.
   - **13.2 Ghi danh khóa học dựa vào người dùng**: Lấy danh sách khóa học chưa ghi danh, khóa học chờ xét duyệt, khóa học đã ghi danh; Xác thực & Hủy ghi danh.

### C. Tính Năng Mở Rộng
- **Cấu hình Domain Server & Mã Nhóm động (`src/config/apiConfig.ts`)**: Chuyển đổi trực tiếp trên giao diện giữa `elearning0706.cybersoft.edu.vn` và `elearningnew.cybersoft.edu.vn`.
- **Quản lý Đề cương & Bài học (`QuanLyBaiHoc` / `TaoDeCuong`)**: Biên tập chương học, bài giảng video trong Admin và học thử trực tuyến kèm đánh dấu tiến độ bài học tại trang Chi tiết khóa học.
- **Tài liệu đặc tả & Wireframe gốc**: Đính kèm trong thư mục `docs/DAC_TA_ELEARNING.xmind` và `docs/xmind.bmpr`.
