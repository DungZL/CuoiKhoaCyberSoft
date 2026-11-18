import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  Laptop,
  Layers,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { extractErrorMessage } from '../../api/httpClient';
import { CourseCard } from '../../components/CourseCard';
import { useApp } from '../../context/AppContext';
import { KhoaHoc } from '../../types/elearning';
import { CATEGORY_META, filterAndSortCourses } from '../../utils/courseHelpers';

export const HomePage: React.FC = () => {
  const { categories, serverConfig, notify } = useApp();
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState<KhoaHoc[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [heroSearch, setHeroSearch] = useState('');
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await elearningApi.layDanhSachKhoaHoc('', serverConfig.maNhom);
      setAllCourses(data);
    } catch (err) {
      notify('error', 'Không thể tải danh sách khóa học', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [serverConfig.maNhom, notify]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, serverConfig.baseUrl]);

  const cleanCourses = useMemo(
    () => filterAndSortCourses(allCourses, serverConfig.hideGibberishCourses),
    [allCourses, serverConfig.hideGibberishCourses]
  );

  const filteredByTab = useMemo(() => {
    if (activeCategory === 'ALL') return cleanCourses;
    return cleanCourses.filter(
      (c) => c.danhMucKhoaHoc?.maDanhMucKhoahoc === activeCategory
    );
  }, [cleanCourses, activeCategory]);

  // Theo đúng wireframe TrangChu: hiển thị 8 khóa học đầu tiên, có nút mở rộng xem thêm
  const displayedCourses = useMemo(
    () => (showAllCourses ? filteredByTab.slice(0, 24) : filteredByTab.slice(0, 8)),
    [filteredByTab, showAllCourses]
  );

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = heroSearch.trim();
    navigate(q ? `/tim-kiem?tenKhoaHoc=${encodeURIComponent(q)}` : '/tim-kiem');
  };

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="container hero-section__grid">
          <div className="hero-section__content">
            <div className="hero-badge">
              <Sparkles size={15} />
              <span>Hệ Thống Đào Tạo Lập Trình Thực Chiến Chuẩn Doanh Nghiệp</span>
            </div>

            <h1 className="hero-title">
              Bứt Phá Sự Nghiệp Công Nghệ Cùng{' '}
              <span className="text-gradient">Cybersoft E-Learning</span>
            </h1>

            <p className="hero-subtitle">
              Làm chủ lộ trình từ Tư duy thuật toán, Frontend React/TypeScript, Backend
              Microservices, Lập trình Di động đến Full Stack qua hàng trăm dự án thực tế.
            </p>

            <form className="hero-search-bar" onSubmit={handleHeroSearch}>
              <Search size={20} className="hero-search-bar__icon" />
              <input
                type="search"
                placeholder="Bạn muốn học kỹ năng gì hôm nay? (VD: React, NodeJS, C++, UI/UX...)"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Khám phá ngay
              </button>
            </form>

            <div className="hero-quick-tags">
              <span>Phổ biến:</span>
              {categories.map((cat) => (
                <Link
                  key={cat.maDanhMuc}
                  to={`/danh-muc/${encodeURIComponent(cat.maDanhMuc)}`}
                  className="quick-tag"
                >
                  {cat.tenDanhMuc}
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-section__visual">
            <div className="hero-visual-card">
              <div className="hero-visual-card__header">
                <span className="dot dot--red" />
                <span className="dot dot--yellow" />
                <span className="dot dot--green" />
                <code>cybersoft-academy.tsx</code>
              </div>
              <div className="hero-visual-card__body">
                <div className="hero-stat-grid">
                  <div className="hero-stat-box">
                    <BookOpen size={22} className="stat-icon stat-icon--primary" />
                    <div>
                      <strong>{allCourses.length || 60}+</strong>
                      <span>Khóa học thực chiến</span>
                    </div>
                  </div>
                  <div className="hero-stat-box">
                    <Layers size={22} className="stat-icon stat-icon--purple" />
                    <div>
                      <strong>{categories.length}</strong>
                      <span>Chuyên ngành cốt lõi</span>
                    </div>
                  </div>
                  <div className="hero-stat-box">
                    <Users size={22} className="stat-icon stat-icon--emerald" />
                    <div>
                      <strong>15,000+</strong>
                      <span>Học viên tốt nghiệp</span>
                    </div>
                  </div>
                  <div className="hero-stat-box">
                    <Award size={22} className="stat-icon stat-icon--amber" />
                    <div>
                      <strong>98.5%</strong>
                      <span>Hài lòng & Có việc làm</span>
                    </div>
                  </div>
                </div>

                <div className="hero-code-preview">
                  <pre>
                    <code>{`const LoTrinhThanhCong = async (hocVien) => {
  await hocVien.renLuyen("TuDuyLapTrinh");
  await hocVien.thucChien(["FrontEnd", "BackEnd", "FullStack"]);
  return "Kỹ Sư Phần Mềm Chuyên Nghiệp 🚀";
};`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danh mục khóa học (API 2) */}
      <section className="section-block">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">
                <Compass size={15} /> LỘ TRÌNH CHUYÊN NGÀNH (API 2)
              </span>
              <h2>Danh Mục Khóa Học Đào Tạo</h2>
            </div>
            <Link to="/tim-kiem" className="btn btn-outline btn-sm">
              Xem toàn bộ khóa học <ArrowRight size={15} />
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat.maDanhMuc];
              const count = cleanCourses.filter(
                (c) => c.danhMucKhoaHoc?.maDanhMucKhoahoc === cat.maDanhMuc
              ).length;
              return (
                <Link
                  key={cat.maDanhMuc}
                  to={`/danh-muc/${encodeURIComponent(cat.maDanhMuc)}`}
                  className="category-card"
                >
                  <div
                    className="category-card__icon"
                    style={{
                      backgroundColor: meta?.badgeBg || 'rgba(99,102,241,0.14)',
                      color: meta?.color || '#6366f1',
                    }}
                  >
                    <Code2 size={24} />
                  </div>
                  <div className="category-card__content">
                    <div className="category-card__top">
                      <h3>{cat.tenDanhMuc}</h3>
                      <span className="category-card__count">{count} khóa</span>
                    </div>
                    <p>
                      {meta?.description ||
                        'Chương trình đào tạo chuyên sâu bám sát yêu cầu tuyển dụng thực tế.'}
                    </p>
                    <span className="category-card__cta">
                      Khám phá danh mục <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Các khóa học mới nhất (API 1) */}
      <section className="section-block section-block--alt">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">
                <TrendingUp size={15} /> KHÓA HỌC NỔI BẬT (API 1)
              </span>
              <h2>Các Khóa Học Mới Nhất</h2>
            </div>

            <div className="section-header__controls">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={fetchCourses}
                title="Làm mới danh sách"
              >
                <RefreshCw size={15} /> Làm mới
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="filter-pills">
            <button
              type="button"
              className={`filter-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory('ALL');
                setShowAllCourses(false);
              }}
            >
              Tất cả ({cleanCourses.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.maDanhMuc}
                type="button"
                className={`filter-pill ${
                  activeCategory === cat.maDanhMuc ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveCategory(cat.maDanhMuc);
                  setShowAllCourses(false);
                }}
              >
                {cat.tenDanhMuc}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="course-grid">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="skeleton-card" />
              ))}
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="empty-state-box">
              <BookOpen size={40} />
              <h3>Chưa có khóa học nào trong mục này</h3>
              <p>Hãy thử chọn danh mục khác hoặc đổi Mã nhóm (GP01 → GP15) trên thanh công cụ.</p>
            </div>
          ) : (
            <>
              <div className="course-grid">
                {displayedCourses.map((course) => (
                  <CourseCard key={course.maKhoaHoc} course={course} />
                ))}
              </div>

              {filteredByTab.length > 8 && (
                <div className="section-center-cta">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowAllCourses((prev) => !prev)}
                  >
                    {showAllCourses
                      ? 'Thu gọn về 8 khóa học đầu tiên'
                      : `Xem thêm khóa học (${filteredByTab.length - 8}+ khóa học khác)`}
                  </button>
                  <Link to="/tim-kiem" className="btn btn-primary">
                    Tra cứu nâng cao & Phân trang <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Điểm khác biệt & Giá trị cốt lõi */}
      <section className="section-block">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">
                <ShieldCheck size={15} /> PHƯƠNG PHÁP ĐÀO TẠO
              </span>
              <h2>Trải Nghiệm Học Tập Tối Ưu Tại Cybersoft</h2>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-box__icon">
                <Laptop size={24} />
              </div>
              <h3>100% Dự Án Thực Chiến</h3>
              <p>
                Học viên trực tiếp xây dựng hệ thống hoàn chỉnh từ Wireframe, UI/UX, tích
                hợp RESTful API đến triển khai thực tế.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-box__icon">
                <PlayCircle size={24} />
              </div>
              <h3>Hệ Thống Video & Đề Cương Trực Quan</h3>
              <p>
                Tích hợp trình xem bài giảng, theo dõi tiến độ từng chương học và lưu trữ
                lộ trình cá nhân hóa ngay trên trình duyệt.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-box__icon">
                <CheckCircle2 size={24} />
              </div>
              <h3>Quản Trị Ghi Danh Hai Chiều</h3>
              <p>
                Hỗ trợ đầy đủ quy trình Học viên đăng ký, Giáo vụ xét duyệt ghi danh theo
                Khóa học hoặc theo từng Người dùng.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
