import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from './components/ToastContainer';
import { AppProvider } from './context/AppContext';
import { AdminTemplate } from './layouts/AdminTemplate';
import { HomeTemplate } from './layouts/HomeTemplate';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { CourseManagementPage } from './pages/admin/CourseManagementPage';
import { EnrollmentManagementPage } from './pages/admin/EnrollmentManagementPage';
import { SyllabusManagementPage } from './pages/admin/SyllabusManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AuthPage } from './pages/home/AuthPage';
import { CategoryCoursesPage } from './pages/home/CategoryCoursesPage';
import { CourseDetailPage } from './pages/home/CourseDetailPage';
import { HomePage } from './pages/home/HomePage';
import { ProfilePage } from './pages/home/ProfilePage';
import { SearchCoursesPage } from './pages/home/SearchCoursesPage';
import './styles/style.scss';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Module Người Dùng (templateHome & templateLogin) */}
          <Route path="/" element={<HomeTemplate />}>
            <Route index element={<HomePage />} />

            {/* Danh mục khóa học */}
            <Route path="danh-muc/:maDanhMuc" element={<CategoryCoursesPage />} />
            <Route path="DanhMucKhoaHoc/:maDanhMuc" element={<CategoryCoursesPage />} />

            {/* Tìm kiếm khóa học */}
            <Route path="tim-kiem" element={<SearchCoursesPage />} />
            <Route path="TimKiemKhoaHoc" element={<SearchCoursesPage />} />

            {/* Chi tiết khóa học */}
            <Route path="chi-tiet/:maKhoaHoc" element={<CourseDetailPage />} />
            <Route path="Chitiet/:maKhoaHoc" element={<CourseDetailPage />} />

            {/* Đăng nhập & Đăng ký */}
            <Route path="dang-nhap" element={<AuthPage />} />
            <Route path="dangnhap" element={<AuthPage />} />
            <Route path="dang-ky" element={<AuthPage />} />
            <Route path="dangky" element={<AuthPage />} />

            {/* Thông tin cá nhân & Khóa học của tôi */}
            <Route path="thong-tin-tai-khoan" element={<ProfilePage />} />
            <Route path="thongtintaikhoan" element={<ProfilePage />} />
          </Route>

          {/* Module Quản Trị (templateAdmin) */}
          <Route path="/admin" element={<AdminTemplate />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="quan-ly-khoa-hoc" element={<CourseManagementPage />} />
            <Route path="quanlykhoahoc/*" element={<CourseManagementPage />} />
            <Route path="quan-ly-nguoi-dung" element={<UserManagementPage />} />
            <Route path="quanlynguoidung/*" element={<UserManagementPage />} />
            <Route path="quan-ly-ghi-danh" element={<EnrollmentManagementPage />} />
            <Route path="quan-ly-bai-hoc" element={<SyllabusManagementPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
