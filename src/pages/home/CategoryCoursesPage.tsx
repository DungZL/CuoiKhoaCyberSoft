import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
  Compass,
  Layers,
  Search,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { extractErrorMessage } from '../../api/httpClient';
import { CourseCard } from '../../components/CourseCard';
import { useApp } from '../../context/AppContext';
import { KhoaHoc } from '../../types/elearning';
import { CATEGORY_META } from '../../utils/courseHelpers';

export const CategoryCoursesPage: React.FC = () => {
  const { maDanhMuc = 'FrontEnd' } = useParams<{ maDanhMuc: string }>();
  const { categories, serverConfig, notify } = useApp();

  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [localQuery, setLocalQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'views' | 'name'>('default');
  const [loading, setLoading] = useState(true);

  const currentCategory = useMemo(
    () => categories.find((c) => c.maDanhMuc === maDanhMuc),
    [categories, maDanhMuc]
  );

  const meta = CATEGORY_META[maDanhMuc];

  const fetchByCategory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await elearningApi.layKhoaHocTheoDanhMuc(
        maDanhMuc,
        serverConfig.maNhom
      );
      setCourses(data);
    } catch (err) {
      setCourses([]);
      notify('error', 'Không thể tải khóa học theo danh mục', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [maDanhMuc, serverConfig.maNhom, notify]);

  useEffect(() => {
    fetchByCategory();
  }, [fetchByCategory, serverConfig.baseUrl]);

  const displayedCourses = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    const filtered = !q
      ? courses
      : courses.filter(
          (c) =>
            c.tenKhoaHoc?.toLowerCase().includes(q) ||
            c.maKhoaHoc?.toLowerCase().includes(q) ||
            c.moTa?.toLowerCase().includes(q)
        );

    const copy = [...filtered];
    if (sortBy === 'views') {
      copy.sort((a, b) => (b.luotXem || 0) - (a.luotXem || 0));
    } else if (sortBy === 'name') {
      copy.sort((a, b) => (a.tenKhoaHoc || '').localeCompare(b.tenKhoaHoc || ''));
    }
    return copy;
  }, [courses, localQuery, sortBy]);

  return (
    <div className="page-wrapper">
      <section className="page-banner">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
          <div className="page-banner__head">
            <div>
              <span className="section-eyebrow">
                <Compass size={14} /> DANH MỤC KHÓA HỌC • API (3)
              </span>
              <h1>{currentCategory?.tenDanhMuc || maDanhMuc}</h1>
              <p>
                {meta?.description ||
                  'Khám phá các khóa học chuyên sâu theo danh mục đào tạo tại Cybersoft.'}
              </p>
            </div>
            <div className="page-banner__stat">
              <Layers size={22} />
              <div>
                <strong>{displayedCourses.length}</strong>
                <span>Khóa học ({serverConfig.maNhom})</span>
              </div>
            </div>
          </div>

          <div className="filter-pills">
            {categories.map((cat) => (
              <Link
                key={cat.maDanhMuc}
                to={`/danh-muc/${encodeURIComponent(cat.maDanhMuc)}`}
                className={`filter-pill ${cat.maDanhMuc === maDanhMuc ? 'active' : ''}`}
              >
                {cat.tenDanhMuc}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="toolbar-bar">
          <div className="input-with-icon toolbar-bar__search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Lọc nhanh khóa học trong danh mục này..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
          </div>

          <div className="toolbar-bar__right">
            <div className="input-with-icon">
              <ArrowUpDown size={15} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'default' | 'views' | 'name')}
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
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : displayedCourses.length === 0 ? (
          <div className="empty-state-box">
            <BookOpen size={42} />
            <h3>Không tìm thấy khóa học nào trong danh mục {maDanhMuc}</h3>
            <p>Hãy thử từ khóa khác hoặc chuyển sang danh mục đào tạo khác.</p>
          </div>
        ) : (
          <div className="course-grid">
            {displayedCourses.map((course) => (
              <CourseCard key={course.maKhoaHoc} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
