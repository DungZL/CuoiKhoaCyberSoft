import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { elearningApi } from '../api/elearningApi';
import { extractErrorMessage } from '../api/httpClient';
import { useApp } from '../context/AppContext';
import { HocVienGhiDanhItem, KhoaHoc } from '../types/elearning';

interface EnrollmentByCourseModalProps {
  course: KhoaHoc | null;
  onClose: () => void;
}

export const EnrollmentByCourseModal: React.FC<EnrollmentByCourseModalProps> = ({
  course,
  onClose,
}) => {
  const { notify } = useApp();

  const [unregisteredUsers, setUnregisteredUsers] = useState<HocVienGhiDanhItem[]>([]);
  const [pendingUsers, setPendingUsers] = useState<HocVienGhiDanhItem[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<HocVienGhiDanhItem[]>([]);

  const [selectedTaiKhoan, setSelectedTaiKhoan] = useState('');
  const [unregisteredFilter, setUnregisteredFilter] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [enrolledSearch, setEnrolledSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAllLists = useCallback(async () => {
    if (!course) return;
    try {
      setLoading(true);
      const [unreg, pending, enrolled] = await Promise.all([
        elearningApi.layDanhSachNguoiDungChuaGhiDanh(course.maKhoaHoc).catch(() => []),
        elearningApi.layDanhSachHocVienChoXetDuyet(course.maKhoaHoc).catch(() => []),
        elearningApi.layDanhSachHocVienKhoaHoc(course.maKhoaHoc).catch(() => []),
      ]);
      setUnregisteredUsers(unreg);
      setPendingUsers(pending);
      setEnrolledUsers(enrolled);
      if (unreg.length > 0) {
        setSelectedTaiKhoan((prev) =>
          prev && unreg.some((u) => u.taiKhoan === prev) ? prev : unreg[0].taiKhoan
        );
      } else {
        setSelectedTaiKhoan('');
      }
    } catch (err) {
      notify('error', 'Lỗi tải dữ liệu ghi danh', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [course, notify]);

  useEffect(() => {
    loadAllLists();
  }, [loadAllLists]);

  const filteredUnregistered = useMemo(() => {
    const q = unregisteredFilter.trim().toLowerCase();
    const list = !q
      ? unregisteredUsers
      : unregisteredUsers.filter(
          (u) =>
            u.taiKhoan?.toLowerCase().includes(q) || u.hoTen?.toLowerCase().includes(q)
        );
    return list.slice(0, 120);
  }, [unregisteredUsers, unregisteredFilter]);

  const filteredPending = useMemo(() => {
    const q = pendingSearch.trim().toLowerCase();
    if (!q) return pendingUsers;
    return pendingUsers.filter(
      (u) => u.taiKhoan?.toLowerCase().includes(q) || u.hoTen?.toLowerCase().includes(q)
    );
  }, [pendingUsers, pendingSearch]);

  const filteredEnrolled = useMemo(() => {
    const q = enrolledSearch.trim().toLowerCase();
    if (!q) return enrolledUsers;
    return enrolledUsers.filter(
      (u) => u.taiKhoan?.toLowerCase().includes(q) || u.hoTen?.toLowerCase().includes(q)
    );
  }, [enrolledUsers, enrolledSearch]);

  if (!course) return null;

  const handleConfirmEnroll = async (taiKhoan: string) => {
    if (!taiKhoan) {
      notify('warning', 'Vui lòng chọn người dùng cần ghi danh');
      return;
    }
    try {
      setProcessingId(taiKhoan);
      const msg = await elearningApi.ghiDanhKhoaHoc({
        maKhoaHoc: course.maKhoaHoc,
        taiKhoan,
      });
      notify('success', 'Xác thực ghi danh thành công!', `${taiKhoan} → ${course.tenKhoaHoc} (${msg})`);
      await loadAllLists();
    } catch (err) {
      notify('error', 'Không thể ghi danh người dùng', extractErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelEnroll = async (taiKhoan: string) => {
    try {
      setProcessingId(taiKhoan);
      const msg = await elearningApi.huyGhiDanh({
        maKhoaHoc: course.maKhoaHoc,
        taiKhoan,
      });
      notify('info', 'Đã hủy ghi danh', `${taiKhoan} (${msg})`);
      await loadAllLists();
    } catch (err) {
      notify('error', 'Không thể hủy ghi danh', extractErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog--xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title">
            <Users size={20} />
            <div>
              <h3>Quản Lý Ghi Danh Theo Khóa Học</h3>
              <p className="modal-subtitle">
                Khóa học: <strong>{course.tenKhoaHoc}</strong> ({course.maKhoaHoc})
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body enrollment-modal-body">
          {/* 13.1.1 Chọn người dùng chưa ghi danh */}
          <section className="enrollment-select-bar">
            <div className="enrollment-select-bar__label">
              <UserPlus size={18} />
              <span>Chọn người dùng chưa ghi danh ({unregisteredUsers.length}):</span>
            </div>
            <div className="enrollment-select-bar__controls">
              <div className="input-with-icon">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Lọc nhanh tài khoản / họ tên..."
                  value={unregisteredFilter}
                  onChange={(e) => {
                    setUnregisteredFilter(e.target.value);
                    const nextQ = e.target.value.trim().toLowerCase();
                    const firstMatch = unregisteredUsers.find(
                      (u) =>
                        u.taiKhoan?.toLowerCase().includes(nextQ) ||
                        u.hoTen?.toLowerCase().includes(nextQ)
                    );
                    if (firstMatch) setSelectedTaiKhoan(firstMatch.taiKhoan);
                  }}
                />
              </div>

              <select
                value={selectedTaiKhoan}
                onChange={(e) => setSelectedTaiKhoan(e.target.value)}
                aria-label="Chọn người dùng"
              >
                {filteredUnregistered.length === 0 ? (
                  <option value="">-- Không tìm thấy người dùng --</option>
                ) : (
                  filteredUnregistered.map((u) => (
                    <option key={u.taiKhoan} value={u.taiKhoan}>
                      {u.hoTen ? `${u.hoTen} (${u.taiKhoan})` : u.taiKhoan}
                    </option>
                  ))
                )}
              </select>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleConfirmEnroll(selectedTaiKhoan)}
                disabled={!selectedTaiKhoan || processingId === selectedTaiKhoan}
              >
                <UserCheck size={16} /> Ghi danh
              </button>
            </div>
          </section>

          {loading ? (
            <div className="loading-state">Đang đồng bộ danh sách học viên từ Server...</div>
          ) : (
            <div className="enrollment-tables-grid">
              {/* 13.1.3 Học viên chờ xác thực */}
              <section className="enrollment-panel">
                <div className="enrollment-panel__head">
                  <h4>
                    Học viên chờ xác thực <span className="badge-count">{pendingUsers.length}</span>
                  </h4>
                  <div className="input-with-icon input-sm">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Nhập tên HV hoặc tài khoản..."
                      value={pendingSearch}
                      onChange={(e) => setPendingSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-scroll-compact">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tài khoản</th>
                        <th>Họ tên</th>
                        <th>Chờ xác nhận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPending.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="empty-cell">
                            Không có học viên nào đang chờ xét duyệt.
                          </td>
                        </tr>
                      ) : (
                        filteredPending.map((u, idx) => (
                          <tr key={u.taiKhoan}>
                            <td>{idx + 1}</td>
                            <td>
                              <code>{u.taiKhoan}</code>
                            </td>
                            <td>{u.hoTen || u.taiKhoan}</td>
                            <td>
                              <div className="table-actions">
                                <button
                                  type="button"
                                  className="btn btn-success btn-xs"
                                  onClick={() => handleConfirmEnroll(u.taiKhoan)}
                                  disabled={processingId === u.taiKhoan}
                                >
                                  <CheckCircle2 size={14} /> Xác thực
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-xs"
                                  onClick={() => handleCancelEnroll(u.taiKhoan)}
                                  disabled={processingId === u.taiKhoan}
                                >
                                  <Trash2 size={14} /> Hủy
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 13.1.2 Học viên đã tham gia khóa học */}
              <section className="enrollment-panel">
                <div className="enrollment-panel__head">
                  <h4>
                    Học viên đã tham gia khóa học{' '}
                    <span className="badge-count badge-count--success">{enrolledUsers.length}</span>
                  </h4>
                  <div className="input-with-icon input-sm">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Nhập tên HV hoặc tài khoản..."
                      value={enrolledSearch}
                      onChange={(e) => setEnrolledSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-scroll-compact">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tài khoản</th>
                        <th>Họ tên</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEnrolled.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="empty-cell">
                            Chưa có học viên chính thức trong khóa học này.
                          </td>
                        </tr>
                      ) : (
                        filteredEnrolled.map((u, idx) => (
                          <tr key={u.taiKhoan}>
                            <td>{idx + 1}</td>
                            <td>
                              <code>{u.taiKhoan}</code>
                            </td>
                            <td>{u.hoTen || u.taiKhoan}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-xs"
                                onClick={() => handleCancelEnroll(u.taiKhoan)}
                                disabled={processingId === u.taiKhoan}
                              >
                                <Trash2 size={14} /> Hủy
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
