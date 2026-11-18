import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  ClipboardCheck,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { EnrollmentByCourseModal } from '../../components/EnrollmentByCourseModal';
import { EnrollmentByUserModal } from '../../components/EnrollmentByUserModal';
import { useApp } from '../../context/AppContext';
import { KhoaHoc, NguoiDungItem } from '../../types/elearning';

export const EnrollmentManagementPage: React.FC = () => {
  const { serverConfig } = useApp();

  const [mode, setMode] = useState<'byCourse' | 'byUser'>('byCourse');
  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [users, setUsers] = useState<NguoiDungItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState<KhoaHoc | null>(null);
  const [selectedUser, setSelectedUser] = useState<NguoiDungItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cList, uList] = await Promise.all([
        elearningApi.layDanhSachKhoaHoc('', serverConfig.maNhom).catch(() => []),
        elearningApi.layDanhSachNguoiDung(serverConfig.maNhom).catch(() => []),
      ]);
      setCourses(cList);
      setUsers(uList.filter((u) => Boolean(u.taiKhoan?.trim())));
    } finally {
      setLoading(false);
    }
  }, [serverConfig.maNhom]);

  useEffect(() => {
    loadData();
  }, [loadData, serverConfig.baseUrl]);

  const q = query.trim().toLowerCase();
  const filteredCourses = courses
    .filter(
      (c) =>
        !q ||
        c.tenKhoaHoc?.toLowerCase().includes(q) ||
        c.maKhoaHoc?.toLowerCase().includes(q)
    )
    .slice(0, 24);

  const filteredUsers = users
    .filter(
      (u) =>
        !q ||
        u.taiKhoan?.toLowerCase().includes(q) ||
        u.hoTen?.toLowerCase().includes(q)
    )
    .slice(0, 24);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <span className="section-eyebrow">
            TRUNG TÂM XÉT DUYỆT GHI DANH • API (13.1 & 13.2)
          </span>
          <h2>Quản Lý Ghi Danh Tập Trung</h2>
        </div>

        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${mode === 'byCourse' ? 'active' : ''}`}
            onClick={() => setMode('byCourse')}
          >
            <BookOpen size={15} /> 13.1 Ghi danh theo Khóa học
          </button>
          <button
            type="button"
            className={`filter-pill ${mode === 'byUser' ? 'active' : ''}`}
            onClick={() => setMode('byUser')}
          >
            <Users size={15} /> 13.2 Ghi danh theo Người dùng
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="admin-toolbar">
          <div className="input-with-icon" style={{ flex: 1 }}>
            <Search size={16} />
            <input
              type="search"
              placeholder={
                mode === 'byCourse'
                  ? 'Tìm nhanh khóa học để mở bảng xét duyệt học viên...'
                  : 'Tìm nhanh tài khoản học viên để mở bảng xét duyệt khóa học...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Đang tải dữ liệu ghi danh...</div>
        ) : mode === 'byCourse' ? (
          <div className="enrollment-hub-grid">
            {filteredCourses.map((c) => (
              <div key={c.maKhoaHoc} className="enrollment-hub-card">
                <div>
                  <span className="course-card__code">#{c.maKhoaHoc}</span>
                  <h4>{c.tenKhoaHoc}</h4>
                  <small>
                    {c.danhMucKhoaHoc?.tenDanhMucKhoaHoc || 'Khóa học'} • Người tạo:{' '}
                    {c.nguoiTao?.hoTen || 'GV'}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedCourse(c)}
                >
                  <ClipboardCheck size={15} /> Mở bảng ghi danh (13.1)
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="enrollment-hub-grid">
            {filteredUsers.map((u) => (
              <div key={u.taiKhoan} className="enrollment-hub-card">
                <div>
                  <span className={`role-tag role-${u.maLoaiNguoiDung}`}>
                    {u.maLoaiNguoiDung === 'GV' ? 'Giáo vụ' : 'Học viên'}
                  </span>
                  <h4>{u.hoTen || u.taiKhoan}</h4>
                  <small>
                    Tài khoản: <code>{u.taiKhoan}</code> • {u.email}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedUser(u)}
                >
                  <UserCheck size={15} /> Mở bảng ghi danh (13.2)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <EnrollmentByCourseModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
      <EnrollmentByUserModal
        targetUser={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};
