import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Heart,
  Layers,
  PlayCircle,
  Sparkles,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import { elearningApi } from '../../api/elearningApi';
import { extractErrorMessage } from '../../api/httpClient';
import { CourseCard } from '../../components/CourseCard';
import { STORAGE_KEYS } from '../../config/apiConfig';
import { useApp } from '../../context/AppContext';
import { BaiHocItem, KhoaHoc } from '../../types/elearning';
import {
  CATEGORY_META,
  getCourseSyllabus,
  getFallbackCourseImage,
  stripHtmlTags,
} from '../../utils/courseHelpers';

export const CourseDetailPage: React.FC = () => {
  const { maKhoaHoc = '' } = useParams<{ maKhoaHoc: string }>();
  const { user, notify, openAuthModal, bookmarks, toggleBookmark, serverConfig } =
    useApp();

  const [course, setCourse] = useState<KhoaHoc | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<KhoaHoc[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [activeLesson, setActiveLesson] = useState<BaiHocItem | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const loadCourseData = useCallback(async () => {
    if (!maKhoaHoc) return;
    try {
      setLoading(true);
      const data = await elearningApi.layThongTinKhoaHoc(maKhoaHoc);
      setCourse(data);

      const catCode = data.danhMucKhoaHoc?.maDanhMucKhoahoc || 'FrontEnd';
      elearningApi
        .layKhoaHocTheoDanhMuc(catCode, serverConfig.maNhom)
        .then((list) => {
          setRelatedCourses(
            list.filter((item) => item.maKhoaHoc !== data.maKhoaHoc).slice(0, 4)
          );
        })
        .catch(() => setRelatedCourses([]));

      if (user) {
        elearningApi
          .layThongTinTaiKhoan(user.taiKhoan)
          .then((profile) => {
            const found = profile.chiTietKhoaHocGhiDanh?.some(
              (item) => item.maKhoaHoc === data.maKhoaHoc
            );
            setIsEnrolled(Boolean(found));
          })
          .catch(() => setIsEnrolled(false));
      } else {
        setIsEnrolled(false);
      }
    } catch (err) {
      notify('error', 'Không tìm thấy thông tin khóa học', extractErrorMessage(err));
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [maKhoaHoc, serverConfig.maNhom, user, notify]);

  useEffect(() => {
    loadCourseData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadCourseData]);

  const syllabus = useMemo(() => (course ? getCourseSyllabus(course) : []), [course]);

  useEffect(() => {
    if (syllabus.length > 0 && syllabus[0].danhSachBaiHoc.length > 0) {
      setActiveLesson(syllabus[0].danhSachBaiHoc[0]);
    }
  }, [syllabus]);

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(next));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="container section-block">
        <div className="skeleton-detail" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container section-block">
        <div className="empty-state-box">
          <BookOpen size={44} />
          <h2>Không tìm thấy khóa học ({maKhoaHoc})</h2>
          <p>Khóa học có thể đã bị xóa hoặc thuộc nhóm dữ liệu khác.</p>
          <Link to="/" className="btn btn-primary">
            Quay về Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const maDanhMuc = course.danhMucKhoaHoc?.maDanhMucKhoahoc || 'FrontEnd';
  const tenDanhMuc =
    course.danhMucKhoaHoc?.tenDanhMucKhoaHoc ||
    CATEGORY_META[maDanhMuc]?.shortLabel ||
    'Lập trình chuyên sâu';
  const fallbackImg = getFallbackCourseImage(course.maKhoaHoc, maDanhMuc);
  const bannerImg =
    course.hinhAnh && !course.hinhAnh.endsWith('/') ? course.hinhAnh : fallbackImg;
  const isBookmarked = bookmarks.includes(course.maKhoaHoc);

  const totalLessons = syllabus.reduce((acc, ch) => acc + ch.danhSachBaiHoc.length, 0);
  const completedInCourse = syllabus.reduce(
    (acc, ch) =>
      acc +
      ch.danhSachBaiHoc.filter((b) => completedLessons.includes(b.id)).length,
    0
  );

  const handleEnroll = async () => {
    if (!user) {
      notify('warning', 'Cần đăng nhập', 'Vui lòng đăng nhập để đăng ký khóa học này.');
      openAuthModal('login');
      return;
    }
    try {
      setActionLoading(true);
      const msg = await elearningApi.dangKyKhoaHoc({
        maKhoaHoc: course.maKhoaHoc,
        taiKhoan: user.taiKhoan,
      });
      setIsEnrolled(true);
      notify('success', 'Đăng ký khóa học thành công!', msg);
    } catch (err) {
      notify('error', 'Đăng ký khóa học thất bại', extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEnroll = async () => {
    if (!user) return;
    try {
      setActionLoading(true);
      const msg = await elearningApi.huyGhiDanh({
        maKhoaHoc: course.maKhoaHoc,
        taiKhoan: user.taiKhoan,
      });
      setIsEnrolled(false);
      notify('info', 'Đã hủy ghi danh khóa học', msg);
    } catch (err) {
      notify('error', 'Không thể hủy ghi danh', extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="course-detail-page">
      {/* Hero Banner */}
      <section className="detail-hero">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Quay lại danh sách khóa học
          </Link>

          <div className="detail-hero__grid">
            <div className="detail-hero__main">
              <div className="detail-hero__badges">
                <Link
                  to={`/danh-muc/${encodeURIComponent(maDanhMuc)}`}
                  className="badge-pill badge-pill--primary"
                >
                  <Layers size={14} /> {tenDanhMuc}
                </Link>
                <span className="badge-pill">Mã KH: {course.maKhoaHoc}</span>
                <span className="badge-pill">Nhóm: {course.maNhom || serverConfig.maNhom}</span>
              </div>

              <h1>{course.tenKhoaHoc}</h1>

              <p className="detail-hero__lead">
                {stripHtmlTags(course.moTa) ||
                  CATEGORY_META[maDanhMuc]?.description ||
                  'Khóa học đào tạo lập trình bài bản từ nền tảng đến xây dựng dự án thực tế.'}
              </p>

              <div className="detail-hero__meta">
                <span>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <strong>4.9</strong> (Đánh giá học viên)
                </span>
                <span>
                  <Eye size={16} />
                  <strong>{(course.luotXem || 100).toLocaleString('vi-VN')}</strong> lượt xem
                </span>
                <span>
                  <User size={16} />
                  Giảng viên:{' '}
                  <strong>
                    {course.nguoiTao?.hoTen || course.nguoiTao?.taiKhoan || 'Cybersoft Mentor'}
                  </strong>
                </span>
                {course.ngayTao && (
                  <span>
                    <Calendar size={16} />
                    Ngày tạo: <strong>{course.ngayTao}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Sidebar Card */}
            <aside className="detail-enroll-card">
              <div className="detail-enroll-card__media">
                <img
                  src={bannerImg}
                  alt={course.tenKhoaHoc}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== fallbackImg) {
                      target.src = fallbackImg;
                    }
                  }}
                />
              </div>

              <div className="detail-enroll-card__body">
                <div className="detail-enroll-card__status">
                  <span className="price-tag">Học phí: Miễn phí ghi danh</span>
                  {isEnrolled && (
                    <span className="enrolled-chip">
                      <CheckCircle2 size={14} /> Đã ghi danh
                    </span>
                  )}
                </div>

                <div className="detail-enroll-card__actions">
                  {!isEnrolled ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={handleEnroll}
                      disabled={actionLoading}
                    >
                      <GraduationCap size={18} />
                      {actionLoading ? 'Đang xử lý...' : 'Đăng ký khóa học (API 7)'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-danger btn-block"
                      onClick={handleCancelEnroll}
                      disabled={actionLoading}
                    >
                      <Trash2 size={17} />
                      {actionLoading ? 'Đang hủy...' : 'Hủy ghi danh khóa học (API 8)'}
                    </button>
                  )}

                  <button
                    type="button"
                    className={`btn btn-outline btn-block ${isBookmarked ? 'active' : ''}`}
                    onClick={() => toggleBookmark(course.maKhoaHoc)}
                  >
                    <Heart size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                    {isBookmarked ? 'Đã lưu vào yêu thích' : 'Lưu khóa học yêu thích'}
                  </button>
                </div>

                <ul className="detail-enroll-card__perks">
                  <li>
                    <Clock size={15} /> Truy cập trọn đời {totalLessons} bài giảng tiêu chuẩn
                  </li>
                  <li>
                    <Sparkles size={15} /> Thực hành trực tiếp với Source Code & Đề cương
                  </li>
                  <li>
                    <Award size={15} /> Chứng nhận hoàn thành khóa học Cybersoft
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Main Content & Syllabus */}
      <section className="container section-block">
        <div className="detail-body-grid">
          <div className="detail-body-main">
            {/* Giới thiệu khóa học */}
            <div className="content-card">
              <h2>Giới thiệu khóa học (Phần mô tả của khóa học)</h2>
              <div className="prose-box">
                <p>
                  {stripHtmlTags(course.moTa) ||
                    `Khóa học "${course.tenKhoaHoc}" được thiết kế dành cho học viên mong muốn nắm vững kiến thức chuyên môn và kỹ năng thực hành thực tế theo tiêu chuẩn doanh nghiệp.`}
                </p>
                <div className="learning-outcomes">
                  <h3>Bạn sẽ đạt được gì sau khóa học này?</h3>
                  <div className="outcomes-grid">
                    <div className="outcome-item">
                      <CheckCircle2 size={17} />
                      <span>Nắm vững tư duy thiết kế kiến trúc và cấu trúc thư mục chuẩn Clean Code</span>
                    </div>
                    <div className="outcome-item">
                      <CheckCircle2 size={17} />
                      <span>Thành thạo quy trình kết nối RESTful API, xác thực JWT và phân quyền</span>
                    </div>
                    <div className="outcome-item">
                      <CheckCircle2 size={17} />
                      <span>Thiết kế giao diện UI/UX mượt mà, chuẩn Responsive trên mọi thiết bị</span>
                    </div>
                    <div className="outcome-item">
                      <CheckCircle2 size={17} />
                      <span>Tự tin hoàn thiện dự án thực tế và triển khai lên môi trường Production</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tính năng mở rộng: Đề cương khóa học & Trình phát bài giảng (QuanLyBaiHoc / TaoDeCuong) */}
            <div className="content-card">
              <div className="syllabus-header">
                <div>
                  <span className="section-eyebrow">
                    <PlayCircle size={14} /> TÍNH NĂNG MỞ RỘNG • ĐỀ CƯƠNG & BÀI HỌC
                  </span>
                  <h2>Nội Dung Bài Giảng & Học Thử Trực Tuyến</h2>
                </div>
                <div className="syllabus-progress-pill">
                  Tiến độ: <strong>{completedInCourse}</strong> / {totalLessons} bài học
                </div>
              </div>

              {activeLesson && (
                <div className="video-player-box">
                  <video
                    key={activeLesson.videoUrl}
                    controls
                    preload="metadata"
                    className="course-video-element"
                  >
                    <source src={activeLesson.videoUrl} type="video/mp4" />
                  </video>
                  <div className="video-player-box__info">
                    <div>
                      <strong>{activeLesson.tieuDe}</strong>
                      <p>{activeLesson.moTa}</p>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        completedLessons.includes(activeLesson.id)
                          ? 'btn-success'
                          : 'btn-outline'
                      }`}
                      onClick={() => toggleLessonComplete(activeLesson.id)}
                    >
                      <CheckCircle2 size={15} />
                      {completedLessons.includes(activeLesson.id)
                        ? 'Đã hoàn thành'
                        : 'Đánh dấu hoàn thành'}
                    </button>
                  </div>
                </div>
              )}

              <div className="syllabus-chapters">
                {syllabus.map((chapter) => (
                  <div key={chapter.id} className="chapter-card">
                    <div className="chapter-card__head">
                      <h3>{chapter.tenChuong}</h3>
                      <span>{chapter.danhSachBaiHoc.length} bài học</span>
                    </div>
                    <div className="chapter-card__lessons">
                      {chapter.danhSachBaiHoc.map((lesson) => {
                        const isDone = completedLessons.includes(lesson.id);
                        const isPlaying = activeLesson?.id === lesson.id;
                        return (
                          <div
                            key={lesson.id}
                            className={`lesson-row ${isPlaying ? 'active' : ''}`}
                          >
                            <button
                              type="button"
                              className="lesson-row__play"
                              onClick={() => setActiveLesson(lesson)}
                            >
                              <PlayCircle size={18} />
                              <div>
                                <strong>{lesson.tieuDe}</strong>
                                <small>{lesson.moTa}</small>
                              </div>
                            </button>

                            <div className="lesson-row__right">
                              <span className="lesson-duration">{lesson.thoiLuong}</span>
                              <button
                                type="button"
                                className={`lesson-check ${isDone ? 'done' : ''}`}
                                onClick={() => toggleLessonComplete(lesson.id)}
                                title="Đánh dấu hoàn thành"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Khóa học liên quan */}
        {relatedCourses.length > 0 && (
          <div className="related-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">GỢI Ý CÙNG CHUYÊN NGÀNH</span>
                <h2>Các Khóa Học Liên Quan</h2>
              </div>
            </div>
            <div className="course-grid">
              {relatedCourses.map((item) => (
                <CourseCard key={item.maKhoaHoc} course={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
