import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, BookOpen, Filter, Search } from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { extractErrorMessage } from '../../api/httpClient';
import { CourseCard } from '../../components/CourseCard';
import { useApp } from '../../context/AppContext';
import { KhoaHoc } from '../../types/elearning';
import { filterAndSortCourses } from '../../utils/courseHelpers';

export const SearchCoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword =
    searchParams.get('tenKhoaHoc') || searchParams.get('tenkhoahoc') || '';

  const { categories, serverConfig, notify } = useApp();

  const [inputValue, setInputValue] = useState(initialKeyword);
  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'views' | 'name'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [loading, setLoading] = useState(true);

  const activeQuery =
    searchParams.get('tenKhoaHoc') || searchParams.get('tenkhoahoc') || '';

  useEffect(() => {
    setInputValue(activeQuery);
    setCurrentPage(1);
  }, [activeQuery]);

  const fetchSearchResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await elearningApi.layDanhSachKhoaHoc(
        activeQuery,
        serverConfig.maNhom
      );
      setCourses(data);
    } catch (err) {
      // Nếu API trả 404/500 khi không tìm thấy từ khóa, trả về mảng rỗng nhẹ nhàng
      setCourses([]);
      if (activeQuery.trim() === '') {
        notify('error', 'Không thể tải danh sách khóa học', extractErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [activeQuery, serverConfig.maNhom, notify]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults, serverConfig.baseUrl]);

  const filteredCourses = useMemo(() => {
    const base = activeQuery
      ? courses
      : filterAndSortCourses(courses, serverConfig.hideGibberishCourses);

    const byCat =
      selectedCategory === 'ALL'
        ? base
        : base.filter(
            (c) => c.danhMucKhoaHoc?.maDanhMucKhoahoc === selectedCategory
          );

    const copy = [...byCat];
    if (sortBy === 'views') {
      copy.sort((a, b) => (b.luotXem || 0) - (a.luotXem || 0));
    } else if (sortBy === 'name') {
      copy.sort((a, b) => (a.tenKhoaHoc || '').localeCompare(b.tenKhoaHoc || ''));
    }
    return copy;
  }, [
    courses,
    activeQuery,
    serverConfig.hideGibberishCourses,
    selectedCategory,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      setSearchParams({ tenKhoaHoc: trimmed });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="page-wrapper">
      <section className="page-banner">
        <div className="container">
          <span className="section-eyebrow">
            <Search size={14} /> TRA CỨU & TÌM KIẾM KHÓA HỌC • API (1)
          </span>
          <h1>
            {activeQuery
              ? `Tìm thấy ${filteredCourses.length} khóa học cho "${activeQuery}"`
              : `Khám Phá Kho Khóa Học (${filteredCourses.length} khóa học)`}
          </h1>
          <p>
            Tìm kiếm theo tên khóa học, lọc theo danh mục chuyên ngành và sắp xếp kết quả
            tức thì.
          </p>

          <form className="search-page-form" onSubmit={handleSubmit}>
            <Search size={18} />
            <input
              type="search"
              placeholder="Nhập tên khóa học cần tìm (VD: FrontEnd, React, C++, Thiết kế...)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      <section className="container section-block">
        <div className="toolbar-bar">
          <div className="filter-pills">
            <button
              type="button"
              className={`filter-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('ALL');
                setCurrentPage(1);
              }}
            >
              <Filter size={13} /> Tất cả danh mục
            </button>
            {categories.map((cat) => (
              <button
                key={cat.maDanhMuc}
                type="button"
                className={`filter-pill ${
                  selectedCategory === cat.maDanhMuc ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedCategory(cat.maDanhMuc);
                  setCurrentPage(1);
                }}
              >
                {cat.tenDanhMuc}
              </button>
            ))}
          </div>

          <div className="toolbar-bar__right">
            <div className="input-with-icon">
              <ArrowUpDown size={15} />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'default' | 'views' | 'name')
                }
                aria-label="Sắp xếp"
              >
                <option value="default">Mặc định</option>
                <option value="views">Lượt xem cao nhất</option>
                <option value="name">Tên khóa học (A → Z)</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="course-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : paginatedCourses.length === 0 ? (
          <div className="empty-state-box">
            <BookOpen size={42} />
            <h3>Không tìm thấy khóa học nào phù hợp</h3>
            <p>
              Hãy thử tìm với từ khóa ngắn gọn hơn hoặc nhấn nút bên dưới để xem tất cả
              khóa học.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setInputValue('');
                setSelectedCategory('ALL');
                setSearchParams({});
              }}
            >
              Xem toàn bộ khóa học
            </button>
          </div>
        ) : (
          <>
            <div className="course-grid">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.maKhoaHoc} course={course} />
              ))}
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
                  Trang <strong>{currentPage}</strong> / {totalPages} ({filteredCourses.length}{' '}
                  khóa học)
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
      </section>
    </div>
  );
};
