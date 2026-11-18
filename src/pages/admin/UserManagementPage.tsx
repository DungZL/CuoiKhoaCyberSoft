import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { extractErrorMessage } from '../../api/httpClient';
import { EnrollmentByUserModal } from '../../components/EnrollmentByUserModal';
import { MA_NHOM_LIST } from '../../config/apiConfig';
import { useApp } from '../../context/AppContext';
import { NguoiDungItem, NguoiDungPayload } from '../../types/elearning';

export const UserManagementPage: React.FC = () => {
  const { serverConfig, notify } = useApp();

  const [users, setUsers] = useState<NguoiDungItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'GV' | 'HV'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  // Popup Ghi danh theo người dùng (API 13.2)
  const [enrollTargetUser, setEnrollTargetUser] = useState<NguoiDungItem | null>(
    null
  );

  // Màn hình Thêm / Sửa người dùng (API 11)
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<NguoiDungItem | null>(null);

  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDT, setSoDT] = useState('');
  const [maLoaiNguoiDung, setMaLoaiNguoiDung] = useState<'GV' | 'HV'>('HV');
  const [maNhom, setMaNhom] = useState(serverConfig.maNhom || 'GP01');
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(
    async (keyword = '') => {
      try {
        setLoading(true);
        const trimmed = keyword.trim();
        const data = trimmed
          ? await elearningApi.timKiemNguoiDung(trimmed, serverConfig.maNhom)
          : await elearningApi.layDanhSachNguoiDung(serverConfig.maNhom);
        setUsers(data.filter((u) => Boolean(u && u.taiKhoan?.trim())));
      } catch (err) {
        setUsers([]);
        notify('error', 'Không thể tải danh sách người dùng', extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [serverConfig.maNhom, notify]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers, serverConfig.baseUrl]);

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'ALL') return users;
    return users.filter((u) => u.maLoaiNguoiDung === roleFilter);
  }, [users, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const openAddForm = () => {
    setEditingUser(null);
    setTaiKhoan('');
    setMatKhau('');
    setHoTen('');
    setEmail('');
    setSoDT('');
    setMaLoaiNguoiDung('HV');
    setMaNhom(serverConfig.maNhom || 'GP01');
    setFormOpen(true);
  };

  const openEditForm = async (u: NguoiDungItem) => {
    setEditingUser(u);
    setTaiKhoan(u.taiKhoan);
    setHoTen(u.hoTen || '');
    setEmail(u.email || '');
    setSoDT(u.soDt || u.soDT || '');
    setMaLoaiNguoiDung(u.maLoaiNguoiDung === 'GV' ? 'GV' : 'HV');
    setMaNhom(serverConfig.maNhom || 'GP01');
    setMatKhau(u.matKhau || '');
    setFormOpen(true);

    // Nếu danh sách chưa kèm mật khẩu, tự động gọi TimKiemNguoiDung để điền mật khẩu hiện tại
    if (!u.matKhau) {
      try {
        const found = await elearningApi.timKiemNguoiDung(
          u.taiKhoan,
          serverConfig.maNhom
        );
        const exact = found.find((item) => item.taiKhoan === u.taiKhoan);
        if (exact?.matKhau) {
          setMatKhau(exact.matKhau);
        }
      } catch {
        // Ignore if not found
      }
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !taiKhoan.trim() ||
      !matKhau.trim() ||
      !hoTen.trim() ||
      !email.trim() ||
      !soDT.trim()
    ) {
      notify(
        'warning',
        'Thiếu thông tin bắt buộc',
        'Vui lòng điền đầy đủ Tài khoản, Mật khẩu, Họ tên, Email và Số điện thoại.'
      );
      return;
    }

    const payload: NguoiDungPayload = {
      taiKhoan: taiKhoan.trim(),
      matKhau: matKhau.trim(),
      hoTen: hoTen.trim(),
      email: email.trim(),
      soDT: soDT.trim(),
      maLoaiNguoiDung,
      maNhom,
    };

    try {
      setSubmitting(true);
      if (!editingUser) {
        await elearningApi.themNguoiDung(payload);
        notify('success', 'Thêm người dùng thành công!', `${payload.hoTen} (${payload.taiKhoan})`);
      } else {
        await elearningApi.capNhatThongTinNguoiDung(payload);
        notify('success', 'Cập nhật người dùng thành công!', `${payload.hoTen} (${payload.taiKhoan})`);
      }
      setFormOpen(false);
      await loadUsers(searchKeyword);
    } catch (err) {
      notify(
        'error',
        editingUser ? 'Cập nhật người dùng thất bại' : 'Thêm người dùng thất bại',
        extractErrorMessage(err)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: NguoiDungItem) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa tài khoản "${u.taiKhoan}" (${u.hoTen})?`
    );
    if (!confirmed) return;

    try {
      const msg = await elearningApi.xoaNguoiDung(u.taiKhoan);
      notify('success', 'Đã xóa người dùng', `${u.taiKhoan} (${msg})`);
      await loadUsers(searchKeyword);
    } catch (err) {
      notify('error', 'Không thể xóa người dùng', extractErrorMessage(err));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers(searchKeyword);
  };

  return (
    <div className="admin-page">
      {!formOpen ? (
        <>
          <div className="admin-page__header">
            <div>
              <span className="section-eyebrow">MODULE QUẢN TRỊ • API (11 & 13.2)</span>
              <h2>Quản Lý Người Dùng</h2>
            </div>

            <div className="admin-page__actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => loadUsers(searchKeyword)}
              >
                <RefreshCw size={15} /> Làm mới
              </button>
              <button type="button" className="btn btn-primary" onClick={openAddForm}>
                <Plus size={17} /> Thêm người dùng
              </button>
            </div>
          </div>

          <div className="content-card">
            <div className="admin-toolbar">
              <form className="admin-search-form" onSubmit={handleSearchSubmit}>
                <div className="input-with-icon">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Nhập vào tài khoản hoặc họ tên người dùng..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  Tìm
                </button>
              </form>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as 'ALL' | 'GV' | 'HV');
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo loại người dùng"
              >
                <option value="ALL">Tất cả vai trò ({users.length})</option>
                <option value="GV">Giáo vụ (GV)</option>
                <option value="HV">Học viên (HV)</option>
              </select>
            </div>

            {loading ? (
              <div className="loading-state">Đang tải danh sách người dùng từ Server...</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tài khoản</th>
                        <th>Mật khẩu</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Loại ND</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="empty-cell">
                            Không tìm thấy người dùng nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((u, idx) => {
                          const stt = (currentPage - 1) * pageSize + idx + 1;
                          return (
                            <tr key={u.taiKhoan}>
                              <td>{stt}</td>
                              <td>
                                <code>{u.taiKhoan}</code>
                              </td>
                              <td>{u.matKhau ? u.matKhau : '••••••'}</td>
                              <td>
                                <strong>{u.hoTen || u.taiKhoan}</strong>
                              </td>
                              <td>{u.email}</td>
                              <td>{u.soDt || u.soDT || '-'}</td>
                              <td>
                                <span
                                  className={`role-tag role-${
                                    u.maLoaiNguoiDung === 'GV' ? 'GV' : 'HV'
                                  }`}
                                >
                                  {u.maLoaiNguoiDung === 'GV' ? 'Giáo vụ' : 'Học viên'}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="btn btn-success btn-xs"
                                    onClick={() => setEnrollTargetUser(u)}
                                  >
                                    <BookOpen size={14} /> Ghi danh
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-xs"
                                    onClick={() => openEditForm(u)}
                                  >
                                    <Edit3 size={14} /> Sửa
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-xs"
                                    onClick={() => handleDeleteUser(u)}
                                    title="Xóa người dùng"
                                  >
                                    <Trash2 size={14} /> X
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="pagination-bar">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Trang trước
                    </button>
                    <span className="pagination-bar__info">
                      Trang <strong>{currentPage}</strong> / {totalPages} (Tổng:{' '}
                      {filteredUsers.length} người dùng)
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        /* Màn hình Thêm / Sửa người dùng theo đúng Wireframe "Them, Sua nguoi dung" */
        <div className="content-card">
          <div className="admin-form-header">
            <div>
              <button
                type="button"
                className="back-link-btn"
                onClick={() => setFormOpen(false)}
              >
                <ArrowLeft size={16} /> &lt;&lt; Trở lại danh sách người dùng
              </button>
              <h2>
                <UserPlus size={22} />{' '}
                {editingUser
                  ? `Cập Nhật Người Dùng (${editingUser.taiKhoan})`
                  : 'Thêm Người Dùng Mới'}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveUser} className="admin-user-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nd-taiKhoan">Tài khoản *</label>
                <input
                  id="nd-taiKhoan"
                  type="text"
                  placeholder="Nhập tài khoản..."
                  value={taiKhoan}
                  onChange={(e) => setTaiKhoan(e.target.value)}
                  disabled={Boolean(editingUser)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nd-email">Email *</label>
                <input
                  id="nd-email"
                  type="email"
                  placeholder="example@cybersoft.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nd-matKhau">Mật khẩu *</label>
                <input
                  id="nd-matKhau"
                  type="text"
                  placeholder="Nhập mật khẩu..."
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nd-soDT">Số điện thoại *</label>
                <input
                  id="nd-soDT"
                  type="tel"
                  placeholder="0909123456"
                  value={soDT}
                  onChange={(e) => setSoDT(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nd-hoTen">Họ tên *</label>
                <input
                  id="nd-hoTen"
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nd-loai">Loại người dùng (GV / HV) *</label>
                <select
                  id="nd-loai"
                  value={maLoaiNguoiDung}
                  onChange={(e) => setMaLoaiNguoiDung(e.target.value as 'GV' | 'HV')}
                >
                  <option value="HV">HỌC VIÊN (HV)</option>
                  <option value="GV">GIÁO VỤ (GV)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nd-maNhom">Mã nhóm</label>
                <select
                  id="nd-maNhom"
                  value={maNhom}
                  onChange={(e) => setMaNhom(e.target.value)}
                >
                  {MA_NHOM_LIST.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setFormOpen(false)}
              >
                &lt;&lt; Trở lại
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Save size={16} />
                {submitting
                  ? 'Đang lưu...'
                  : editingUser
                  ? 'Lưu cập nhật'
                  : 'Thêm người dùng'}
              </button>
            </div>
          </form>
        </div>
      )}

      <EnrollmentByUserModal
        targetUser={enrollTargetUser}
        onClose={() => setEnrollTargetUser(null)}
      />
    </div>
  );
};
