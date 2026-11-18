import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookCopy,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Code2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sun,
  UserCog,
  Users,
} from 'lucide-react';
import { elearningApi } from '../api/elearningApi';
import { extractErrorMessage } from '../api/httpClient';
import { ServerConfigModal } from '../components/ServerConfigModal';
import { useApp } from '../context/AppContext';

export const AdminTemplate: React.FC = () => {
  const {
    user,
    setSessionUser,
    logout,
    notify,
    serverConfig,
    theme,
    toggleTheme,
  } = useApp();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [switchingGV, setSwitchingGV] = useState(false);

  const handleQuickLoginGV = async () => {
    try {
      setSwitchingGV(true);
      const session = await elearningApi.dangNhap({
        taiKhoan: 'bonnamsau',
        matKhau: 'bonnamsau',
      });
      setSessionUser({
        ...session,
        matKhau: 'bonnamsau',
      });
      notify(
        'success',
        'Đã đăng nhập tài khoản Giáo vụ (GV)',
        `Xin chào ${session.hoTen} (${session.taiKhoan})`
      );
    } catch (err) {
      notify('error', 'Không thể đăng nhập nhanh GV', extractErrorMessage(err));
    } finally {
      setSwitchingGV(false);
    }
  };

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'admin-shell--collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">
          <Link to="/" className="brand-logo">
            <div className="brand-logo__mark">
              <Code2 size={20} />
            </div>
            {!sidebarCollapsed && (
              <div className="brand-logo__text">
                <span className="brand-logo__title">Dashboard</span>
                <span className="brand-logo__sub">CYBERSOFT ADMIN</span>
              </div>
            )}
          </Link>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label="Thu gọn menu"
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            {!sidebarCollapsed && <span>Tổng quan hệ thống</span>}
          </NavLink>

          <NavLink
            to="/admin/quan-ly-khoa-hoc"
            className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            {!sidebarCollapsed && <span>Quản lý khóa học</span>}
          </NavLink>

          <NavLink
            to="/admin/quan-ly-nguoi-dung"
            className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            {!sidebarCollapsed && <span>Quản lý người dùng</span>}
          </NavLink>

          <NavLink
            to="/admin/quan-ly-ghi-danh"
            className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}
          >
            <ClipboardCheck size={18} />
            {!sidebarCollapsed && <span>Quản lý ghi danh</span>}
          </NavLink>

          <NavLink
            to="/admin/quan-ly-bai-hoc"
            className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}
          >
            <BookCopy size={18} />
            {!sidebarCollapsed && <span>Đề cương & Bài học</span>}
          </NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-nav__link">
            <Home size={18} />
            {!sidebarCollapsed && <span>Về trang chủ học viên</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header__left">
            <h1 className="admin-header__title">Hệ Thống Quản Trị Trung Tâm Cybersoft</h1>
            <span className="badge-group">Nhóm: {serverConfig.maNhom}</span>
          </div>

          <div className="admin-header__right">
            <button
              type="button"
              className="icon-pill"
              onClick={() => setConfigOpen(true)}
              title="Cấu hình Server"
            >
              <Settings size={15} />
              <span>Server & Nhóm</span>
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label="Đổi giao diện"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="user-dropdown">
              <button
                type="button"
                className="user-chip"
                onClick={() => setAdminMenuOpen((prev) => !prev)}
              >
                <div className="user-chip__avatar">
                  {(user?.hoTen || user?.taiKhoan || 'G').charAt(0).toUpperCase()}
                </div>
                <div className="user-chip__info">
                  <strong>Chào !, {user?.hoTen || user?.taiKhoan || 'Khách'}</strong>
                  <span className={`role-tag role-${user?.maLoaiNguoiDung || 'HV'}`}>
                    {user?.maLoaiNguoiDung === 'GV' ? 'Giáo vụ (GV)' : 'Chưa có quyền GV'}
                  </span>
                </div>
                <ChevronDown size={15} />
              </button>

              {adminMenuOpen && (
                <div
                  className="user-dropdown__menu"
                  onMouseLeave={() => setAdminMenuOpen(false)}
                >
                  <Link
                    to="/thong-tin-tai-khoan"
                    className="user-dropdown__item"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <UserCog size={16} /> &gt; Cập nhật thông tin
                  </Link>
                  <Link
                    to="/"
                    className="user-dropdown__item"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <Home size={16} /> &gt; Trang chủ E-Learning
                  </Link>
                  <hr />
                  <button
                    type="button"
                    className="user-dropdown__item user-dropdown__item--danger"
                    onClick={() => {
                      setAdminMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                  >
                    <LogOut size={16} /> &gt; Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {(!user || user.maLoaiNguoiDung !== 'GV') && (
          <div className="admin-role-banner">
            <div className="admin-role-banner__text">
              <ShieldAlert size={20} />
              <div>
                <strong>Lưu ý phân quyền theo đặc tả:</strong> Các API Thêm/Xóa/Sửa và Ghi danh
                yêu cầu tài khoản <code>maLoaiNguoiDung = &quot;GV&quot;</code> (Giáo vụ).
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleQuickLoginGV}
              disabled={switchingGV}
            >
              <ShieldCheck size={15} />
              {switchingGV ? 'Đang chuyển quyền...' : 'Đăng nhập nhanh Giáo vụ (GV)'}
            </button>
          </div>
        )}

        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      <ServerConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
};
