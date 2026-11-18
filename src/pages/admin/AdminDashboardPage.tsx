import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookCopy,
  BookOpen,
  ClipboardCheck,
  Layers,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { useApp } from '../../context/AppContext';
import { KhoaHoc, NguoiDungItem } from '../../types/elearning';
import { CATEGORY_META } from '../../utils/courseHelpers';

export const AdminDashboardPage: React.FC = () => {
  const { categories, serverConfig } = useApp();

  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [users, setUsers] = useState<NguoiDungItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [courseList, userList] = await Promise.all([
        elearningApi.layDanhSachKhoaHoc('', serverConfig.maNhom).catch(() => []),
        elearningApi.layDanhSachNguoiDung(serverConfig.maNhom).catch(() => []),
      ]);
      setCourses(courseList);
      setUsers(userList);
    } finally {
      setLoading(false);
    }
  }, [serverConfig.maNhom]);

  useEffect(() => {
    loadStats();
  }, [loadStats, serverConfig.baseUrl]);

  const gvCount = users.filter((u) => u.maLoaiNguoiDung === 'GV').length;
  const hvCount = users.filter((u) => u.maLoaiNguoiDung !== 'GV').length;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <span className="section-eyebrow">BẢNG ĐIỀU KHIỂN QUẢN TRỊ</span>
          <h2>Tổng Quan Hệ Thống E-Learning ({serverConfig.maNhom})</h2>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={loadStats}
          disabled={loading}
        >
          <RefreshCw size={15} /> Làm mới số liệu
        </button>
      </div>

      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--blue">
            <BookOpen size={24} />
          </div>
          <div>
            <span>Tổng số khóa học</span>
            <strong>{loading ? '...' : courses.length.toLocaleString('vi-VN')}</strong>
            <small>Nhóm {serverConfig.maNhom}</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--purple">
            <Users size={24} />
          </div>
          <div>
            <span>Tổng tài khoản người dùng</span>
            <strong>{loading ? '...' : users.length.toLocaleString('vi-VN')}</strong>
            <small>{hvCount.toLocaleString('vi-VN')} Học viên (HV)</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--emerald">
            <UserCheck size={24} />
          </div>
          <div>
            <span>Đội ngũ Giáo vụ (GV)</span>
            <strong>{loading ? '...' : gvCount.toLocaleString('vi-VN')}</strong>
            <small>Quyền quản trị hệ thống</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__icon kpi-card__icon--amber">
            <Layers size={24} />
          </div>
          <div>
            <span>Danh mục đào tạo</span>
            <strong>{categories.length}</strong>
            <small>Chuyên ngành tiêu chuẩn</small>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="content-card">
          <div className="card-head-between">
            <h3>
              <TrendingUp size={18} /> Phân Bố Khóa Học Theo Danh Mục
            </h3>
            <Link to="/admin/quan-ly-khoa-hoc" className="btn btn-ghost btn-xs">
              Quản lý khóa học <ArrowRight size={14} />
            </Link>
          </div>

          <div className="category-bars">
            {categories.map((cat) => {
              const count = courses.filter(
                (c) => c.danhMucKhoaHoc?.maDanhMucKhoahoc === cat.maDanhMuc
              ).length;
              const percent =
                courses.length > 0
                  ? Math.min(100, Math.round((count / courses.length) * 100))
                  : 0;
              const meta = CATEGORY_META[cat.maDanhMuc];
              return (
                <div key={cat.maDanhMuc} className="cat-bar-row">
                  <div className="cat-bar-row__info">
                    <strong>{cat.tenDanhMuc}</strong>
                    <span>
                      {count} khóa học ({percent}%)
                    </span>
                  </div>
                  <div className="cat-bar-row__track">
                    <div
                      className="cat-bar-row__fill"
                      style={{
                        width: `${Math.max(6, percent)}%`,
                        backgroundColor: meta?.color || '#6366f1',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="content-card">
          <h3>Phân Hệ Quản Trị Nhanh</h3>
          <div className="quick-admin-links">
            <Link to="/admin/quan-ly-khoa-hoc" className="quick-admin-card">
              <BookOpen size={22} />
              <div>
                <strong>Quản lý khóa học (API 12 & 13.1)</strong>
                <span>Thêm, sửa, xóa, upload hình ảnh và xét duyệt học viên vào khóa học</span>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link to="/admin/quan-ly-nguoi-dung" className="quick-admin-card">
              <Users size={22} />
              <div>
                <strong>Quản lý người dùng (API 11 & 13.2)</strong>
                <span>Tìm kiếm, phân trang, tạo tài khoản GV/HV và ghi danh khóa học</span>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link to="/admin/quan-ly-ghi-danh" className="quick-admin-card">
              <ClipboardCheck size={22} />
              <div>
                <strong>Trung tâm Quản lý Ghi danh (API 13.1 & 13.2)</strong>
                <span>Xét duyệt học viên chờ xác nhận theo khóa học hoặc theo tài khoản</span>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link to="/admin/quan-ly-bai-hoc" className="quick-admin-card">
              <BookCopy size={22} />
              <div>
                <strong>Quản lý Đề cương & Bài học (Tính năng mở rộng)</strong>
                <span>Thiết kế chương học, bài giảng video và thời lượng cho từng khóa học</span>
              </div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
