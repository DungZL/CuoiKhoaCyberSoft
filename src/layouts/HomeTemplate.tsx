import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronDown,
  Code2,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import { AuthModal } from '../components/AuthModal';
import { ServerConfigModal } from '../components/ServerConfigModal';
import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../utils/courseHelpers';

export const HomeTemplate: React.FC = () => {
  const {
    user,
    categories,
    serverConfig,
    theme,
    toggleTheme,
    logout,
    openAuthModal,
  } = useApp();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchKeyword.trim();
    navigate(
      trimmed
        ? `/tim-kiem?tenKhoaHoc=${encodeURIComponent(trimmed)}`
        : '/tim-kiem'
    );
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          {/* Brand */}
          <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-logo__mark">
              <Code2 size={22} />
            </div>
            <div className="brand-logo__text">
              <span className="brand-logo__title">CYBERSOFT</span>
              <span className="brand-logo__sub">E-LEARNING ACADEMY</span>
            </div>
          </Link>

          {/* Category Dropdown */}
          <div
            className="nav-category"
            onMouseEnter={() => setCategoryMenuOpen(true)}
            onMouseLeave={() => setCategoryMenuOpen(false)}
          >
            <button
              type="button"
              className="nav-category__trigger"
              onClick={() => setCategoryMenuOpen((prev) => !prev)}
            >
              <Compass size={17} />
              <span>Danh mục khóa học</span>
              <ChevronDown size={15} />
            </button>

            {categoryMenuOpen && (
              <div className="nav-category__dropdown">
                <div className="nav-category__dropdown-head">
                  <Sparkles size={14} /> Chuyên ngành đào tạo chuẩn doanh nghiệp
                </div>
                <div className="nav-category__list">
                  {categories.map((cat) => {
                    const meta = CATEGORY_META[cat.maDanhMuc];
                    return (
                      <Link
                        key={cat.maDanhMuc}
                        to={`/danh-muc/${encodeURIComponent(cat.maDanhMuc)}`}
                        className="nav-category__item"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <span
                          className="nav-category__dot"
                          style={{ backgroundColor: meta?.color || '#6366f1' }}
                        />
                        <div>
                          <strong>{cat.tenDanhMuc}</strong>
                          <small>{meta?.shortLabel || cat.maDanhMuc}</small>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Form */}
          <form className="header-search" onSubmit={handleSearchSubmit}>
            <Search size={17} className="header-search__icon" />
            <input
              type="search"
              placeholder="Tìm khóa học (VD: React, Backend, Thiết kế, Tư duy...)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              aria-label="Tìm khóa học"
            />
            <button type="submit" className="header-search__btn">
              Tìm
            </button>
          </form>

          {/* Right Controls */}
          <div className="site-header__actions">
            <button
              type="button"
              className="icon-pill"
              onClick={() => setConfigOpen(true)}
              title="Cấu hình Server & Mã nhóm"
            >
              <Settings size={16} />
              <span>{serverConfig.maNhom}</span>
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
              aria-label="Đổi giao diện sáng/tối"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {!user ? (
              <div className="auth-btn-group">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => openAuthModal('register')}
                >
                  Đăng ký
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => openAuthModal('login')}
                >
                  Đăng nhập
                </button>
              </div>
            ) : (
              <div className="user-dropdown">
                <button
                  type="button"
                  className="user-chip"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                >
                  <div className="user-chip__avatar">
                    {(user.hoTen || user.taiKhoan || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="user-chip__info">
                    <strong>{user.hoTen || user.taiKhoan}</strong>
                    <span className={`role-tag role-${user.maLoaiNguoiDung}`}>
                      {user.maLoaiNguoiDung === 'GV' ? 'Giáo vụ' : 'Học viên'}
                    </span>
                  </div>
                  <ChevronDown size={15} />
                </button>

                {userMenuOpen && (
                  <div
                    className="user-dropdown__menu"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <Link
                      to="/thong-tin-tai-khoan"
                      className="user-dropdown__item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} /> Thông tin cá nhân
                    </Link>
                    <Link
                      to="/thong-tin-tai-khoan?tab=courses"
                      className="user-dropdown__item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <GraduationCap size={16} /> Khóa học của tôi
                    </Link>
                    <Link
                      to="/admin/quan-ly-khoa-hoc"
                      className="user-dropdown__item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} /> Quản trị hệ thống (Admin)
                    </Link>
                    <hr />
                    <button
                      type="button"
                      className="user-dropdown__item user-dropdown__item--danger"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <form className="mobile-search" onSubmit={handleSearchSubmit}>
              <Search size={16} />
              <input
                type="search"
                placeholder="Tìm kiếm khóa học..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-xs">
                Tìm
              </button>
            </form>

            <div className="mobile-drawer__section">
              <div className="mobile-drawer__title">Danh mục khóa học</div>
              <div className="mobile-drawer__grid">
                {categories.map((cat) => (
                  <NavLink
                    key={cat.maDanhMuc}
                    to={`/danh-muc/${encodeURIComponent(cat.maDanhMuc)}`}
                    className="mobile-cat-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BookOpen size={14} /> {cat.tenDanhMuc}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="mobile-drawer__section">
              <div className="mobile-drawer__title">Tài khoản & Điều hướng</div>
              {!user ? (
                <div className="mobile-auth-btns">
                  <Link
                    to="/dang-nhap"
                    className="btn btn-primary btn-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/dang-ky"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              ) : (
                <div className="mobile-user-links">
                  <Link
                    to="/thong-tin-tai-khoan"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={15} /> Thông tin tài khoản ({user.hoTen})
                  </Link>
                  <Link
                    to="/admin/quan-ly-khoa-hoc"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={15} /> Hệ thống Quản trị Admin
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__grid">
          <div className="site-footer__brand">
            <div className="brand-logo">
              <div className="brand-logo__mark">
                <Code2 size={20} />
              </div>
              <div className="brand-logo__text">
                <span className="brand-logo__title">CYBERSOFT</span>
                <span className="brand-logo__sub">E-LEARNING SYSTEM</span>
              </div>
            </div>
            <p>
              Hệ thống đào tạo lập trình trực tuyến theo dự án thực tế. Cung cấp lộ trình
              bài bản từ Tư duy lập trình, Frontend, Backend, Mobile đến Full Stack.
            </p>
            <div className="footer-status">
              <span className="status-dot" />
              <span>
                API Server: <code>{serverConfig.baseUrl}</code> ({serverConfig.maNhom})
              </span>
            </div>
          </div>

          <div className="site-footer__col">
            <h4>Danh mục đào tạo</h4>
            <ul>
              {categories.map((c) => (
                <li key={c.maDanhMuc}>
                  <Link to={`/danh-muc/${encodeURIComponent(c.maDanhMuc)}`}>
                    {c.tenDanhMuc}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>Tiện ích học viên</h4>
            <ul>
              <li>
                <Link to="/tim-kiem">Tra cứu & Tìm kiếm khóa học</Link>
              </li>
              <li>
                <Link to="/thong-tin-tai-khoan">Hồ sơ cá nhân & Khóa học của tôi</Link>
              </li>
              <li>
                <Link to="/dang-nhap">Đăng nhập hệ thống</Link>
              </li>
              <li>
                <Link to="/dang-ky">Đăng ký học viên mới</Link>
              </li>
              <li>
                <Link to="/admin/quan-ly-khoa-hoc">Bảng điều khiển Giáo vụ (Admin)</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container site-footer__bottom">
          <span>© 2026 Cybersoft Academy — Dự Án Cuối Khóa E-Learning</span>
          <span>Chuẩn Clean Code • SASS • Responsive Desktop / iPad / iPhone</span>
        </div>
      </footer>

      <AuthModal />
      <ServerConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
};
