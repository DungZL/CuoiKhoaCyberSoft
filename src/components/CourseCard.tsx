import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Calendar,
  Eye,
  GraduationCap,
  Heart,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import { elearningApi } from '../api/elearningApi';
import { extractErrorMessage } from '../api/httpClient';
import { useApp } from '../context/AppContext';
import { KhoaHoc } from '../types/elearning';
import {
  CATEGORY_META,
  getFallbackCourseImage,
  stripHtmlTags,
} from '../utils/courseHelpers';

interface CourseCardProps {
  course: KhoaHoc;
  onEnrolled?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEnrolled }) => {
  const { user, notify, bookmarks, toggleBookmark, openAuthModal } = useApp();
  const navigate = useNavigate();

  const maDanhMuc = course.danhMucKhoaHoc?.maDanhMucKhoahoc || 'FrontEnd';
  const tenDanhMuc =
    course.danhMucKhoaHoc?.tenDanhMucKhoaHoc ||
    CATEGORY_META[maDanhMuc]?.shortLabel ||
    'Lập trình';
  const fallbackImg = getFallbackCourseImage(course.maKhoaHoc, maDanhMuc);

  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (!course.hinhAnh || course.hinhAnh.endsWith('/')) return fallbackImg;
    return course.hinhAnh;
  });
  const [enrolling, setEnrolling] = useState(false);

  const isBookmarked = bookmarks.includes(course.maKhoaHoc);
  const cleanDescription =
    stripHtmlTags(course.moTa) ||
    CATEGORY_META[maDanhMuc]?.description ||
    'Khóa học đào tạo thực chiến từ căn bản đến chuyên sâu theo chuẩn doanh nghiệp tại Cybersoft.';

  const catColor = CATEGORY_META[maDanhMuc]?.color || '#6366f1';
  const catBg = CATEGORY_META[maDanhMuc]?.badgeBg || 'rgba(99, 102, 241, 0.14)';

  const handleQuickEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      notify('warning', 'Vui lòng đăng nhập', 'Bạn cần đăng nhập để đăng ký khóa học.');
      openAuthModal('login');
      return;
    }

    try {
      setEnrolling(true);
      const msg = await elearningApi.dangKyKhoaHoc({
        maKhoaHoc: course.maKhoaHoc,
        taiKhoan: user.taiKhoan,
      });
      notify('success', 'Đăng ký khóa học thành công!', `${course.tenKhoaHoc} (${msg})`);
      onEnrolled?.();
    } catch (err) {
      notify('error', 'Không thể đăng ký khóa học', extractErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <article className="course-card">
      <div className="course-card__media">
        <Link to={`/chi-tiet/${encodeURIComponent(course.maKhoaHoc)}`} className="course-card__img-link">
          <img
            src={imgSrc}
            alt={course.tenKhoaHoc}
            loading="lazy"
            onError={() => {
              if (imgSrc !== fallbackImg) {
                setImgSrc(fallbackImg);
              }
            }}
          />
          <div className="course-card__overlay">
            <span className="course-card__preview-pill">
              <Sparkles size={14} /> Xem chi tiết khóa học
            </span>
          </div>
        </Link>

        <span
          className="course-card__badge"
          style={{ color: catColor, backgroundColor: catBg, borderColor: `${catColor}33` }}
        >
          {tenDanhMuc}
        </span>

        <button
          type="button"
          className={`course-card__bookmark ${isBookmarked ? 'active' : ''}`}
          onClick={() => toggleBookmark(course.maKhoaHoc)}
          title={isBookmarked ? 'Bỏ lưu khóa học' : 'Lưu khóa học yêu thích'}
          aria-label="Lưu khóa học"
        >
          {isBookmarked ? <Heart size={16} fill="currentColor" /> : <Bookmark size={16} />}
        </button>
      </div>

      <div className="course-card__body">
        <div className="course-card__meta-top">
          <span className="course-card__code">#{course.maKhoaHoc}</span>
          <span className="course-card__rating">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>4.9</span>
          </span>
        </div>

        <h3 className="course-card__title">
          <Link to={`/chi-tiet/${encodeURIComponent(course.maKhoaHoc)}`}>{course.tenKhoaHoc}</Link>
        </h3>

        <p className="course-card__desc">{cleanDescription}</p>

        <div className="course-card__stats">
          <span title="Giảng viên / Người tạo">
            <User size={14} />
            {course.nguoiTao?.hoTen || course.nguoiTao?.taiKhoan || 'Giảng viên Cybersoft'}
          </span>
          <span title="Lượt xem">
            <Eye size={14} />
            {(course.luotXem || 100).toLocaleString('vi-VN')}
          </span>
          {course.ngayTao && (
            <span title="Ngày tạo">
              <Calendar size={14} />
              {course.ngayTao}
            </span>
          )}
        </div>

        <div className="course-card__footer">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/chi-tiet/${encodeURIComponent(course.maKhoaHoc)}`)}
          >
            Chi tiết
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleQuickEnroll}
            disabled={enrolling}
          >
            <GraduationCap size={15} />
            {enrolling ? 'Đang xử lý...' : 'Đăng ký học'}
          </button>
        </div>
      </div>
    </article>
  );
};
