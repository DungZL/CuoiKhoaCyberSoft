import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  PlusCircle,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { elearningApi } from '../api/elearningApi';
import { extractErrorMessage } from '../api/httpClient';
import { useApp } from '../context/AppContext';
import { KhoaHocGhiDanhItem, NguoiDungItem } from '../types/elearning';

interface EnrollmentByUserModalProps {
  targetUser: NguoiDungItem | null;
  onClose: () => void;
}

export const EnrollmentByUserModal: React.FC<EnrollmentByUserModalProps> = ({
  targetUser,
  onClose,
}) => {
  const { notify } = useApp();

  const [unregisteredCourses, setUnregisteredCourses] = useState<KhoaHocGhiDanhItem[]>([]);
  const [pendingCourses, setPendingCourses] = useState<KhoaHocGhiDanhItem[]>([]);
  const [approvedCourses, setApprovedCourses] = useState<KhoaHocGhiDanhItem[]>([]);

  const [selectedMaKhoaHoc, setSelectedMaKhoaHoc] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAllLists = useCallback(async () => {
    if (!targetUser) return;
    try {
      setLoading(true);
      const [unreg, pending, approved] = await Promise.all([
        elearningApi.layDanhSachKhoaHocChuaGhiDanh(targetUser.taiKhoan).catch(() => []),
        elearningApi.layDanhSachKhoaHocChoXetDuyet(targetUser.taiKhoan).catch(() => []),
        elearningApi.layDanhSachKhoaHocDaXetDuyet(targetUser.taiKhoan).catch(() => []),
      ]);
      const validUnreg = unreg.filter((c) => Boolean(c.maKhoaHoc && c.tenKhoaHoc));
      setUnregisteredCourses(validUnreg);
      setPendingCourses(pending);
      setApprovedCourses(approved);
      if (validUnreg.length > 0) {
        setSelectedMaKhoaHoc((prev) =>
          prev && validUnreg.some((c) => c.maKhoaHoc === prev) ? prev : validUnreg[0].maKhoaHoc
        );
      } else {
        setSelectedMaKhoaHoc('');
      }
    } catch (err) {
      notify('error', 'Không thể tải thông tin ghi danh', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [targetUser, notify]);

  useEffect(() => {
    loadAllLists();
  }, [loadAllLists]);

  const filteredUnregistered = useMemo(() => {
    const q = courseFilter.trim().toLowerCase();
    if (!q) return unregisteredCourses;
    return unregisteredCourses.filter(
      (c) =>
        c.tenKhoaHoc?.toLowerCase().includes(q) || c.maKhoaHoc?.toLowerCase().includes(q)
    );
  }, [unregisteredCourses, courseFilter]);

  if (!targetUser) return null;

  const handleConfirmEnroll = async (maKhoaHoc: string) => {
    if (!maKhoaHoc) {
      notify('warning', 'Vui lòng chọn khóa học cần ghi danh');
      return;
    }
    try {
      setProcessingId(maKhoaHoc);
      const msg = await elearningApi.ghiDanhKhoaHoc({
        maKhoaHoc,
        taiKhoan: targetUser.taiKhoan,
      });
      notify(
        'success',
        'Ghi danh khóa học thành công!',
        `${targetUser.taiKhoan} → ${maKhoaHoc} (${msg})`
      );
      await loadAllLists();
    } catch (err) {
      notify('error', 'Không thể ghi danh khóa học', extractErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelEnroll = async (maKhoaHoc: string) => {
    try {
      setProcessingId(maKhoaHoc);
      const msg = await elearningApi.huyGhiDanh({
        maKhoaHoc,
        taiKhoan: targetUser.taiKhoan,
      });
      notify('info', 'Đã hủy ghi danh khóa học', `${maKhoaHoc} (${msg})`);
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
            <BookOpen size={20} />
            <div>
              <h3>Quản Lý Ghi Danh Theo Người Dùng</h3>
              <p className="modal-subtitle">
                Học viên: <strong>{targetUser.hoTen || targetUser.taiKhoan}</strong> (
                <code>{targetUser.taiKhoan}</code>)
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body enrollment-modal-body">
          {/* 13.2.1 Chọn khóa học chưa ghi danh */}
          <section className="enrollment-select-bar">
            <div className="enrollment-select-bar__label">
              <PlusCircle size={18} />
              <span>Chọn khóa học ({unregisteredCourses.length}):</span>
            </div>
            <div className="enrollment-select-bar__controls">
              <div className="input-with-icon">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Tìm nhanh khóa học..."
                  value={courseFilter}
                  onChange={(e) => {
                    setCourseFilter(e.target.value);
                    const nextQ = e.target.value.trim().toLowerCase();
                    const first = unregisteredCourses.find(
                      (c) =>
                        c.tenKhoaHoc?.toLowerCase().includes(nextQ) ||
                        c.maKhoaHoc?.toLowerCase().includes(nextQ)
                    );
                    if (first) setSelectedMaKhoaHoc(first.maKhoaHoc);
                  }}
                />
              </div>

              <select
                value={selectedMaKhoaHoc}
                onChange={(e) => setSelectedMaKhoaHoc(e.target.value)}
                aria-label="Chọn khóa học"
              >
                {filteredUnregistered.length === 0 ? (
                  <option value="">-- Không có khóa học phù hợp --</option>
                ) : (
                  filteredUnregistered.map((c) => (
                    <option key={c.maKhoaHoc} value={c.maKhoaHoc}>
                      {c.tenKhoaHoc} ({c.maKhoaHoc})
                    </option>
                  ))
                )}
              </select>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleConfirmEnroll(selectedMaKhoaHoc)}
                disabled={!selectedMaKhoaHoc || processingId === selectedMaKhoaHoc}
              >
                <CheckCircle2 size={16} /> Ghi danh
              </button>
            </div>
          </section>

          {loading ? (
            <div className="loading-state">Đang tải danh sách khóa học của người dùng...</div>
          ) : (
            <div className="enrollment-tables-grid">
              {/* 13.2.3 Khóa học chờ xác thực */}
              <section className="enrollment-panel">
                <div className="enrollment-panel__head">
                  <h4>
                    Khóa học chờ xác thực{' '}
                    <span className="badge-count">{pendingCourses.length}</span>
                  </h4>
                </div>
                <div className="table-scroll-compact">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã KH</th>
                        <th>Tên khóa học</th>
                        <th>Chờ xác nhận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCourses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="empty-cell">
                            Không có khóa học chờ xác thực.
                          </td>
                        </tr>
                      ) : (
                        pendingCourses.map((c, idx) => (
                          <tr key={c.maKhoaHoc}>
                            <td>{idx + 1}</td>
                            <td>
                              <code>{c.maKhoaHoc}</code>
                            </td>
                            <td>{c.tenKhoaHoc}</td>
                            <td>
                              <div className="table-actions">
                                <button
                                  type="button"
                                  className="btn btn-success btn-xs"
                                  onClick={() => handleConfirmEnroll(c.maKhoaHoc)}
                                  disabled={processingId === c.maKhoaHoc}
                                >
                                  <CheckCircle2 size={14} /> Xác thực
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-xs"
                                  onClick={() => handleCancelEnroll(c.maKhoaHoc)}
                                  disabled={processingId === c.maKhoaHoc}
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

              {/* 13.2.2 Khóa học đã ghi danh */}
              <section className="enrollment-panel">
                <div className="enrollment-panel__head">
                  <h4>
                    Khóa học đã ghi danh{' '}
                    <span className="badge-count badge-count--success">
                      {approvedCourses.length}
                    </span>
                  </h4>
                </div>
                <div className="table-scroll-compact">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã KH</th>
                        <th>Tên khóa học</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedCourses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="empty-cell">
                            Học viên chưa ghi danh khóa học nào.
                          </td>
                        </tr>
                      ) : (
                        approvedCourses.map((c, idx) => (
                          <tr key={c.maKhoaHoc}>
                            <td>{idx + 1}</td>
                            <td>
                              <code>{c.maKhoaHoc}</code>
                            </td>
                            <td>{c.tenKhoaHoc}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-xs"
                                onClick={() => handleCancelEnroll(c.maKhoaHoc)}
                                disabled={processingId === c.maKhoaHoc}
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
