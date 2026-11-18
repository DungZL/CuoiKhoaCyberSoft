import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  Eye,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  UserCheck,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { extractErrorMessage } from '../../api/httpClient';
import { EnrollmentByCourseModal } from '../../components/EnrollmentByCourseModal';
import { MA_NHOM_LIST } from '../../config/apiConfig';
import { useApp } from '../../context/AppContext';
import { KhoaHoc, KhoaHocPayload, NguoiDungItem } from '../../types/elearning';
import {
  formatTodayDdMmYyyy,
  getFallbackCourseImage,
  stripHtmlTags,
} from '../../utils/courseHelpers';

export const CourseManagementPage: React.FC = () => {
  const { categories, serverConfig, user, notify } = useApp();

  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [gvUsers, setGvUsers] = useState<NguoiDungItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [loading, setLoading] = useState(true);

  // Enrollment popup (13.1)
  const [enrollModalCourse, setEnrollModalCourse] = useState<KhoaHoc | null>(null);

  // Add / Edit course modal (12)
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<KhoaHoc | null>(null);

  const [maKhoaHoc, setMaKhoaHoc] = useState('');
  const [tenKhoaHoc, setTenKhoaHoc] = useState('');
  const [maDanhMucKhoaHoc, setMaDanhMucKhoaHoc] = useState('FrontEnd');
  const [ngayTao, setNgayTao] = useState(formatTodayDdMmYyyy());
  const [danhGia, setDanhGia] = useState(5);
  const [luotXem, setLuotXem] = useState(100);
  const [taiKhoanNguoiTao, setTaiKhoanNguoiTao] = useState('bonnamsau');
  const [maNhom, setMaNhom] = useState(serverConfig.maNhom || 'GP01');
  const [hinhAnhName, setHinhAnhName] = useState('khoa-hoc-cybersoft.png');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [moTa, setMoTa] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCourses = useCallback(
    async (keyword = '') => {
      try {
        setLoading(true);
        const list = await elearningApi.layDanhSachKhoaHoc(
          keyword,
          serverConfig.maNhom
        );
        setCourses(list);
      } catch (err) {
        setCourses([]);
        if (!keyword) {
          notify('error', 'Không thể tải danh sách khóa học', extractErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    },
    [serverConfig.maNhom, notify]
  );

  const loadGvAccounts = useCallback(async () => {
    try {
      const allUsers = await elearningApi.layDanhSachNguoiDung(serverConfig.maNhom);
      const gvs = allUsers.filter((u) => u.maLoaiNguoiDung === 'GV' && u.taiKhoan?.trim());
      setGvUsers(gvs.slice(0, 60));
    } catch {
      setGvUsers([]);
    }
  }, [serverConfig.maNhom]);

  useEffect(() => {
    loadCourses();
    loadGvAccounts();
  }, [loadCourses, loadGvAccounts, serverConfig.baseUrl]);

  const filteredCourses = useMemo(() => {
    if (categoryFilter === 'ALL') return courses;
    return courses.filter(
      (c) => c.danhMucKhoaHoc?.maDanhMucKhoahoc === categoryFilter
    );
  }, [courses, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage]);

  const openAddForm = () => {
    setEditingCourse(null);
    setMaKhoaHoc('');
    setTenKhoaHoc('');
    setMaDanhMucKhoaHoc(categories[0]?.maDanhMuc || 'FrontEnd');
    setNgayTao(formatTodayDdMmYyyy());
    setDanhGia(5);
    setLuotXem(100);
    setTaiKhoanNguoiTao(
      user?.maLoaiNguoiDung === 'GV'
        ? user.taiKhoan
        : gvUsers[0]?.taiKhoan || 'bonnamsau'
    );
    setMaNhom(serverConfig.maNhom || 'GP01');
    setHinhAnhName('khoa-hoc-cybersoft.png');
    setSelectedFile(null);
    setFilePreview('');
    setMoTa('');
    setFormOpen(true);
  };

  const openEditForm = (course: KhoaHoc) => {
    setEditingCourse(course);
    setMaKhoaHoc(course.maKhoaHoc);
    setTenKhoaHoc(course.tenKhoaHoc);
    setMaDanhMucKhoaHoc(
      course.danhMucKhoaHoc?.maDanhMucKhoahoc || categories[0]?.maDanhMuc || 'FrontEnd'
    );
    setNgayTao(course.ngayTao || formatTodayDdMmYyyy());
    setDanhGia(course.danhGia ?? 5);
    setLuotXem(course.luotXem ?? 100);
    setTaiKhoanNguoiTao(
      course.nguoiTao?.taiKhoan ||
        (user?.maLoaiNguoiDung === 'GV' ? user.taiKhoan : 'bonnamsau')
    );
    setMaNhom(course.maNhom?.toUpperCase() || serverConfig.maNhom || 'GP01');
    const existingImgName = course.hinhAnh
      ? course.hinhAnh.split('/').pop() || 'khoa-hoc.png'
      : 'khoa-hoc.png';
    setHinhAnhName(existingImgName);
    setSelectedFile(null);
    setFilePreview(course.hinhAnh || '');
    setMoTa(stripHtmlTags(course.moTa));
    setFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Theo đúng đặc tả XMind mục 12: "hinhAnh: tên hình ảnh phải lấy tên file từ thẻ input file. Không được tự đặt"
    setSelectedFile(file);
    setHinhAnhName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFilePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maKhoaHoc.trim() || !tenKhoaHoc.trim() || !moTa.trim()) {
      notify(
        'warning',
        'Thiếu thông tin bắt buộc',
        'Vui lòng nhập đầy đủ Mã khóa học, Tên khóa học và Mô tả.'
      );
      return;
    }

    const biDanh = tenKhoaHoc
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const payload: KhoaHocPayload = {
      maKhoaHoc: maKhoaHoc.trim(),
      biDanh: biDanh || maKhoaHoc.trim().toLowerCase(),
      tenKhoaHoc: tenKhoaHoc.trim(),
      moTa: moTa.trim(),
      luotXem: Number(luotXem) || 0,
      danhGia: Number(danhGia) || 0,
      hinhAnh: selectedFile ? selectedFile.name : hinhAnhName,
      maNhom,
      ngayTao: ngayTao.trim() || formatTodayDdMmYyyy(),
      maDanhMucKhoaHoc,
      taiKhoanNguoiTao: taiKhoanNguoiTao.trim() || 'bonnamsau',
    };

    try {
      setSubmitting(true);
      if (!editingCourse) {
        await elearningApi.themKhoaHoc(payload);
        // Theo đúng đặc tả XMind: "Lưu ý api upload phải được gọi trong hàm then của thêm hoặc sửa"
        if (selectedFile) {
          await elearningApi
            .uploadHinhAnhKhoaHoc(selectedFile, payload.tenKhoaHoc)
            .catch(() => null);
        }
        notify('success', 'Thêm khóa học thành công!', payload.tenKhoaHoc);
      } else {
        await elearningApi.capNhatKhoaHoc(payload);
        if (selectedFile) {
          await elearningApi
            .uploadHinhAnhKhoaHoc(selectedFile, payload.tenKhoaHoc)
            .catch(() => null);
        }
        notify('success', 'Cập nhật khóa học thành công!', payload.tenKhoaHoc);
      }

      setFormOpen(false);
      await loadCourses(searchKeyword);
    } catch (err) {
      notify(
        'error',
        editingCourse ? 'Cập nhật khóa học thất bại' : 'Thêm khóa học thất bại',
        extractErrorMessage(err)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (course: KhoaHoc) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa khóa học "${course.tenKhoaHoc}" (${course.maKhoaHoc})?`
    );
    if (!confirmed) return;

    try {
      const msg = await elearningApi.xoaKhoaHoc(course.maKhoaHoc);
      notify('success', 'Đã xóa khóa học', `${course.tenKhoaHoc} (${msg})`);
      await loadCourses(searchKeyword);
    } catch (err) {
      notify('error', 'Không thể xóa khóa học', extractErrorMessage(err));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCourses(searchKeyword);
  };

  return (
    <div className="admin-page">
      {!formOpen ? (
        <>
          <div className="admin-page__header">
            <div>
              <span className="section-eyebrow">MODULE QUẢN TRỊ • API (12 & 13.1)</span>
              <h2>Quản Lý Khóa Học</h2>
            </div>

            <div className="admin-page__actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => loadCourses(searchKeyword)}
              >
                <RefreshCw size={15} /> Làm mới
              </button>
              <button type="button" className="btn btn-primary" onClick={openAddForm}>
                <Plus size={17} /> Thêm khóa học
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
                    placeholder="Nhập vào tên khóa học cần tìm..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  Tìm
                </button>
              </form>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo danh mục"
              >
                <option value="ALL">Tất cả danh mục ({courses.length})</option>
                {categories.map((cat) => (
                  <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
                    {cat.tenDanhMuc}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="loading-state">Đang tải danh sách khóa học từ Server...</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Mã khóa học</th>
                        <th>Tên khóa học</th>
                        <th>Hình ảnh</th>
                        <th>Lượt xem</th>
                        <th>Người tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCourses.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="empty-cell">
                            Không tìm thấy khóa học nào.
                          </td>
                        </tr>
                      ) : (
                        paginatedCourses.map((course, idx) => {
                          const stt = (currentPage - 1) * pageSize + idx + 1;
                          const catCode =
                            course.danhMucKhoaHoc?.maDanhMucKhoahoc || 'FrontEnd';
                          const fallback = getFallbackCourseImage(
                            course.maKhoaHoc,
                            catCode
                          );
                          const imgSrc =
                            course.hinhAnh && !course.hinhAnh.endsWith('/')
                              ? course.hinhAnh
                              : fallback;
                          return (
                            <tr key={course.maKhoaHoc}>
                              <td>{stt}</td>
                              <td>
                                <code>{course.maKhoaHoc}</code>
                              </td>
                              <td>
                                <div className="table-course-title">
                                  <strong>{course.tenKhoaHoc}</strong>
                                  <small>
                                    {course.danhMucKhoaHoc?.tenDanhMucKhoaHoc || catCode} •{' '}
                                    {course.ngayTao}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <img
                                  src={imgSrc}
                                  alt={course.tenKhoaHoc}
                                  className="table-thumb"
                                  onError={(e) => {
                                    if (e.currentTarget.src !== fallback) {
                                      e.currentTarget.src = fallback;
                                    }
                                  }}
                                />
                              </td>
                              <td>
                                <span className="views-badge">
                                  <Eye size={13} />{' '}
                                  {(course.luotXem || 0).toLocaleString('vi-VN')}
                                </span>
                              </td>
                              <td>
                                {course.nguoiTao?.hoTen ||
                                  course.nguoiTao?.taiKhoan ||
                                  'Giáo vụ'}
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="btn btn-success btn-xs"
                                    onClick={() => setEnrollModalCourse(course)}
                                  >
                                    <UserCheck size={14} /> Ghi danh
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-xs"
                                    onClick={() => openEditForm(course)}
                                  >
                                    <Edit3 size={14} /> Sửa
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-xs"
                                    onClick={() => handleDeleteCourse(course)}
                                    title="Xóa khóa học"
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
                      {filteredCourses.length} khóa học)
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
        /* Màn hình Thêm / Sửa khóa học theo đúng Wireframe "Them sua khoa hoc" */
        <div className="content-card">
          <div className="admin-form-header">
            <div>
              <button
                type="button"
                className="back-link-btn"
                onClick={() => setFormOpen(false)}
              >
                <ArrowLeft size={16} /> &lt;&lt; Trở lại danh sách khóa học
              </button>
              <h2>
                <BookOpen size={22} />{' '}
                {editingCourse
                  ? `Cập Nhật Khóa Học (${editingCourse.maKhoaHoc})`
                  : 'Thêm Khóa Học Mới'}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveCourse} className="admin-course-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="kh-maKhoaHoc">Mã khóa học *</label>
                <input
                  id="kh-maKhoaHoc"
                  type="text"
                  placeholder="VD: FE_REACT_2026"
                  value={maKhoaHoc}
                  onChange={(e) => setMaKhoaHoc(e.target.value)}
                  disabled={Boolean(editingCourse)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="kh-tenKhoaHoc">Tên khóa học *</label>
                <input
                  id="kh-tenKhoaHoc"
                  type="text"
                  placeholder="VD: Lập trình React & TypeScript Chuyên Sâu"
                  value={tenKhoaHoc}
                  onChange={(e) => setTenKhoaHoc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="kh-danhMuc">Danh mục khóa học *</label>
                <select
                  id="kh-danhMuc"
                  value={maDanhMucKhoaHoc}
                  onChange={(e) => setMaDanhMucKhoaHoc(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
                      {cat.tenDanhMuc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="kh-ngayTao">Ngày tạo (dd/MM/yyyy) *</label>
                <input
                  id="kh-ngayTao"
                  type="text"
                  placeholder="dd/MM/yyyy"
                  value={ngayTao}
                  onChange={(e) => setNgayTao(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="kh-danhGia">Đánh giá (0 → 5)</label>
                <input
                  id="kh-danhGia"
                  type="number"
                  min={0}
                  max={5}
                  value={danhGia}
                  onChange={(e) => setDanhGia(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="kh-luotXem">Lượt xem</label>
                <input
                  id="kh-luotXem"
                  type="number"
                  min={0}
                  value={luotXem}
                  onChange={(e) => setLuotXem(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="kh-nguoiTao">Người tạo (Tài khoản Giáo vụ - GV)</label>
                <select
                  id="kh-nguoiTao"
                  value={taiKhoanNguoiTao}
                  onChange={(e) => setTaiKhoanNguoiTao(e.target.value)}
                >
                  {user?.maLoaiNguoiDung === 'GV' && (
                    <option value={user.taiKhoan}>
                      {user.hoTen} ({user.taiKhoan} - Đang đăng nhập)
                    </option>
                  )}
                  <option value="bonnamsau">Đức Nguyễn (bonnamsau - GV)</option>
                  {gvUsers
                    .filter((g) => g.taiKhoan !== 'bonnamsau' && g.taiKhoan !== user?.taiKhoan)
                    .map((g) => (
                      <option key={g.taiKhoan} value={g.taiKhoan}>
                        {g.hoTen || g.taiKhoan} ({g.taiKhoan})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="kh-maNhom">Mã nhóm (GP01 → GP15)</label>
                <select
                  id="kh-maNhom"
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

              <div className="form-group form-group--full">
                <label htmlFor="kh-file">
                  Hình ảnh (.jpg, .png, .jpeg — Tự động lấy filename từ thẻ input file)
                </label>
                <div className="upload-box">
                  <label htmlFor="kh-file" className="btn btn-outline btn-sm">
                    <Upload size={15} /> Chọn file hình ảnh
                  </label>
                  <input
                    id="kh-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                  />
                  <span className="upload-filename">
                    File hiện tại: <code>{hinhAnhName}</code>
                  </span>
                  {filePreview && (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="upload-preview-thumb"
                    />
                  )}
                </div>
              </div>

              <div className="form-group form-group--full">
                <label htmlFor="kh-moTa">Mô tả khóa học *</label>
                <textarea
                  id="kh-moTa"
                  rows={5}
                  placeholder="Nhập nội dung giới thiệu chi tiết và đề cương tóm tắt của khóa học..."
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  required
                />
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
                  : editingCourse
                  ? 'Lưu cập nhật'
                  : 'Thêm khóa học'}
              </button>
            </div>
          </form>
        </div>
      )}

      <EnrollmentByCourseModal
        course={enrollModalCourse}
        onClose={() => setEnrollModalCourse(null)}
      />
    </div>
  );
};
