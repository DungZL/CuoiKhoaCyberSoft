import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpDown,
  BookOpen,
  Edit3,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { extractErrorMessage } from '../../api/httpClient';
import { useApp } from '../../context/AppContext';
import { KhoaHocGhiDanhItem, ThongTinTaiKhoanResponse } from '../../types/elearning';
import { getFallbackCourseImage } from '../../utils/courseHelpers';

export const ProfilePage: React.FC = () => {
  const { user, setSessionUser, notify, openAuthModal, serverConfig } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab =
    searchParams.get('tab') === 'courses' ? 'courses' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'courses'>(initialTab);

  const [accountInfo, setAccountInfo] = useState<ThongTinTaiKhoanResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Edit profile state (API 6 & 10)
  const [isEditing, setIsEditing] = useState(false);
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDT, setSoDT] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [saving, setSaving] = useState(false);

  // Tab Khóa học của tôi: ES6 search & sort (theo đúng yêu cầu trong Balsamiq wireframe)
  const [courseSearch, setCourseSearch] = useState('');
  const [courseSort, setCourseSort] = useState<'asc' | 'desc'>('asc');
  const [cancellingCode, setCancellingCode] = useState<string | null>(null);

  const fetchAccountProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await elearningApi.layThongTinTaiKhoan(user.taiKhoan);
      setAccountInfo(data);
      setHoTen(data.hoTen || user.hoTen || '');
      setEmail(data.email || user.email || '');
      setSoDT(data.soDT || user.soDT || '');
      setMatKhau(data.matKhau || user.matKhau || '');
    } catch (err) {
      notify('error', 'Không thể tải thông tin tài khoản', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user, notify]);

  useEffect(() => {
    fetchAccountProfile();
  }, [fetchAccountProfile]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'courses') {
      setActiveTab('courses');
    } else if (tabParam === 'profile') {
      setActiveTab('profile');
    }
  }, [searchParams]);

  // ES6 filter & sort trên mảng chiTietKhoaHocGhiDanh theo đúng ghi chú Balsamiq
  const enrolledCourses = useMemo<KhoaHocGhiDanhItem[]>(() => {
    const rawList = accountInfo?.chiTietKhoaHocGhiDanh || [];
    const q = courseSearch.trim().toLowerCase();
    const filtered = !q
      ? rawList
      : rawList.filter(
          (item) =>
            item.tenKhoaHoc?.toLowerCase().includes(q) ||
            item.maKhoaHoc?.toLowerCase().includes(q)
        );
    return [...filtered].sort((a, b) => {
      const cmp = (a.tenKhoaHoc || '').localeCompare(b.tenKhoaHoc || '');
      return courseSort === 'asc' ? cmp : -cmp;
    });
  }, [accountInfo, courseSearch, courseSort]);

  if (!user) {
    return (
      <div className="container section-block">
        <div className="empty-state-box">
          <User size={44} />
          <h2>Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem thông tin cá nhân và quản lý khóa học đã ghi danh.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openAuthModal('login')}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim() || !email.trim() || !soDT.trim() || !matKhau.trim()) {
      notify('warning', 'Thiếu thông tin', 'Vui lòng điền đầy đủ Họ tên, Email, SĐT và Mật khẩu.');
      return;
    }

    try {
      setSaving(true);
      await elearningApi.capNhatThongTinNguoiDung({
        taiKhoan: user.taiKhoan,
        matKhau: matKhau.trim(),
        hoTen: hoTen.trim(),
        soDT: soDT.trim(),
        email: email.trim(),
        maLoaiNguoiDung: accountInfo?.maLoaiNguoiDung || user.maLoaiNguoiDung || 'HV',
        maNhom: accountInfo?.maNhom || user.maNhom || serverConfig.maNhom,
      });

      setSessionUser({
        ...user,
        hoTen: hoTen.trim(),
        email: email.trim(),
        soDT: soDT.trim(),
        matKhau: matKhau.trim(),
      });
      setIsEditing(false);
      notify('success', 'Cập nhật thông tin cá nhân thành công!');
      await fetchAccountProfile();
    } catch (err) {
      notify('error', 'Cập nhật thất bại', extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelCourse = async (maKhoaHoc: string) => {
    try {
      setCancellingCode(maKhoaHoc);
      const msg = await elearningApi.huyGhiDanh({
        maKhoaHoc,
        taiKhoan: user.taiKhoan,
      });
      notify('info', 'Đã hủy đăng ký khóa học', `${maKhoaHoc} (${msg})`);
      await fetchAccountProfile();
    } catch (err) {
      notify('error', 'Không thể hủy ghi danh', extractErrorMessage(err));
    } finally {
      setCancellingCode(null);
    }
  };

  return (
    <div className="page-wrapper">
      <section className="page-banner">
        <div className="container">
          <div className="profile-hero">
            <div className="profile-hero__avatar">
              {(accountInfo?.hoTen || user.hoTen || user.taiKhoan || 'U')
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="profile-hero__info">
              <span className="section-eyebrow">QUẢN LÝ TÀI KHOẢN • API (9 & 10)</span>
              <h1>{accountInfo?.hoTen || user.hoTen || user.taiKhoan}</h1>
              <div className="profile-hero__badges">
                <span className="badge-pill">
                  Tài khoản: <strong>{user.taiKhoan}</strong>
                </span>
                <span className="badge-pill">
                  Vai trò:{' '}
                  <strong>
                    {(accountInfo?.maLoaiNguoiDung || user.maLoaiNguoiDung) === 'GV'
                      ? 'Giáo vụ (GV)'
                      : 'Học viên (HV)'}
                  </strong>
                </span>
                <span className="badge-pill">
                  Khóa học đã tham gia:{' '}
                  <strong>{accountInfo?.chiTietKhoaHocGhiDanh?.length || 0}</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={fetchAccountProfile}
              disabled={loading}
            >
              <RefreshCw size={15} /> Đồng bộ
            </button>
          </div>

          {/* 2 Tabs theo đúng wireframe: THÔNG TIN CÁ NHÂN | KHÓA HỌC CỦA TÔI */}
          <div className="profile-tabs">
            <button
              type="button"
              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile');
                setSearchParams({ tab: 'profile' });
              }}
            >
              <User size={16} /> THÔNG TIN CÁ NHÂN
            </button>
            <button
              type="button"
              className={`profile-tab ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('courses');
                setSearchParams({ tab: 'courses' });
              }}
            >
              <GraduationCap size={16} /> KHÓA HỌC CỦA TÔI (
              {accountInfo?.chiTietKhoaHocGhiDanh?.length || 0})
            </button>
          </div>
        </div>
      </section>

      <section className="container section-block">
        {loading ? (
          <div className="loading-state">Đang tải hồ sơ tài khoản từ Server...</div>
        ) : activeTab === 'profile' ? (
          <div className="content-card profile-card">
            <div className="profile-card__header">
              <div>
                <h2>Thông Tin Cá Nhân</h2>
                <p>
                  Xem hoặc bấm &quot;Cập nhật&quot; để chuyển sang chế độ chỉnh sửa thông tin
                  tài khoản (API 6 / 10).
                </p>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 size={16} /> Cập nhật
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={16} /> Hủy chỉnh sửa
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-item__label">
                    <User size={15} /> Tài khoản
                  </span>
                  <strong>{accountInfo?.taiKhoan || user.taiKhoan}</strong>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-item__label">
                    <User size={15} /> Họ tên
                  </span>
                  <strong>{accountInfo?.hoTen || user.hoTen}</strong>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-item__label">
                    <Mail size={15} /> Email
                  </span>
                  <strong>{accountInfo?.email || user.email}</strong>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-item__label">
                    <Phone size={15} /> Số điện thoại
                  </span>
                  <strong>{accountInfo?.soDT || user.soDT || 'Chưa cập nhật'}</strong>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-item__label">
                    <Lock size={15} /> Mật khẩu
                  </span>
                  <strong>••••••••</strong>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-item__label">
                    <Shield size={15} /> Loại người dùng & Nhóm
                  </span>
                  <strong>
                    {(accountInfo?.maLoaiNguoiDung || user.maLoaiNguoiDung) === 'GV'
                      ? 'Giáo vụ (GV)'
                      : 'Học viên (HV)'}{' '}
                    • {accountInfo?.maNhom || user.maNhom || serverConfig.maNhom}
                  </strong>
                </div>
              </div>
            ) : (
              <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tài khoản (Không thể thay đổi)</label>
                    <input type="text" value={user.taiKhoan} disabled />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prof-hoTen">Họ tên *</label>
                    <input
                      id="prof-hoTen"
                      type="text"
                      value={hoTen}
                      onChange={(e) => setHoTen(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prof-email">Email *</label>
                    <input
                      id="prof-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prof-soDT">Số điện thoại *</label>
                    <input
                      id="prof-soDT"
                      type="tel"
                      value={soDT}
                      onChange={(e) => setSoDT(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prof-matKhau">Mật khẩu *</label>
                    <input
                      id="prof-matKhau"
                      type="password"
                      value={matKhau}
                      onChange={(e) => setMatKhau(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="profile-edit-form__actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="content-card">
            <div className="enrolled-header">
              <div>
                <h2>Các Khóa Học Đã Tham Gia</h2>
                <p>
                  Tìm kiếm & sắp xếp danh sách khóa học đã ghi danh tại Frontend (ES6 Search &
                  Sort).
                </p>
              </div>

              <div className="enrolled-header__controls">
                <div className="input-with-icon">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Nhập khóa học cần tìm..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    setCourseSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                >
                  <ArrowUpDown size={15} />
                  Sắp xếp: {courseSort === 'asc' ? 'A → Z' : 'Z → A'}
                </button>
              </div>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="empty-state-box">
                <BookOpen size={40} />
                <h3>Chưa có khóa học nào trong danh sách</h3>
                <p>
                  Bạn chưa đăng ký khóa học nào hoặc không có khóa học khớp với từ khóa tìm
                  kiếm.
                </p>
                <Link to="/tim-kiem" className="btn btn-primary btn-sm">
                  Khám phá khóa học ngay
                </Link>
              </div>
            ) : (
              <div className="enrolled-course-list">
                {enrolledCourses.map((item) => {
                  const thumb =
                    item.hinhAnh && !item.hinhAnh.endsWith('/')
                      ? item.hinhAnh
                      : getFallbackCourseImage(item.maKhoaHoc);
                  return (
                    <div key={item.maKhoaHoc} className="enrolled-course-row">
                      <img
                        src={thumb}
                        alt={item.tenKhoaHoc}
                        className="enrolled-course-row__img"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackCourseImage(item.maKhoaHoc);
                        }}
                      />
                      <div className="enrolled-course-row__body">
                        <span className="course-card__code">#{item.maKhoaHoc}</span>
                        <h3>
                          <Link to={`/chi-tiet/${encodeURIComponent(item.maKhoaHoc)}`}>
                            {item.tenKhoaHoc}
                          </Link>
                        </h3>
                        <p>
                          {item.moTa ||
                            'Khóa học đã ghi danh tại hệ thống đào tạo trực tuyến Cybersoft E-Learning.'}
                        </p>
                      </div>
                      <div className="enrolled-course-row__actions">
                        <Link
                          to={`/chi-tiet/${encodeURIComponent(item.maKhoaHoc)}`}
                          className="btn btn-primary btn-sm"
                        >
                          Vào học
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelCourse(item.maKhoaHoc)}
                          disabled={cancellingCode === item.maKhoaHoc}
                        >
                          <Trash2 size={15} />
                          {cancellingCode === item.maKhoaHoc ? 'Đang hủy...' : 'Hủy'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
