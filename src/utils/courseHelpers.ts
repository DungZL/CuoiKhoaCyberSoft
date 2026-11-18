import { ChuongHocItem, KhoaHoc } from '../types/elearning';
import { STORAGE_KEYS } from '../config/apiConfig';

const CATEGORY_THUMBNAILS: Record<string, string[]> = {
  BackEnd: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  ],
  Design: [
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
  ],
  DiDong: [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=800&q=80',
  ],
  FrontEnd: [
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  ],
  FullStack: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
  ],
  TuDuy: [
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  ],
};

export const CATEGORY_META: Record<
  string,
  { color: string; badgeBg: string; description: string; shortLabel: string }
> = {
  BackEnd: {
    color: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.14)',
    description: 'Kiến trúc Microservices, Node.js, .NET Core, Java Spring, SQL & Bảo mật hệ thống',
    shortLabel: 'Backend',
  },
  Design: {
    color: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.14)',
    description: 'Thiết kế UI/UX hiện đại với Figma, Design System, Responsive Web & Prototyping',
    shortLabel: 'UI/UX Design',
  },
  DiDong: {
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    description: 'Xây dựng ứng dụng đa nền tảng iOS & Android với React Native, Flutter & Swift',
    shortLabel: 'Mobile Dev',
  },
  FrontEnd: {
    color: '#0ea5e9',
    badgeBg: 'rgba(14, 165, 233, 0.14)',
    description: 'Làm chủ React, TypeScript, Next.js, SASS/Tailwind và tối ưu hiệu năng trình duyệt',
    shortLabel: 'Frontend',
  },
  FullStack: {
    color: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    description: 'Phát triển sản phẩm trọn gói từ giao diện người dùng đến hạ tầng đám mây & CI/CD',
    shortLabel: 'Full Stack',
  },
  TuDuy: {
    color: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.14)',
    description: 'Cấu trúc dữ liệu, Giải thuật, Lập trình hướng đối tượng (OOP) và Clean Architecture',
    shortLabel: 'Tư duy & Thuật toán',
  },
};

export function getFallbackCourseImage(maKhoaHoc: string, maDanhMuc?: string): string {
  const cat = maDanhMuc && CATEGORY_THUMBNAILS[maDanhMuc] ? maDanhMuc : 'FrontEnd';
  const list = CATEGORY_THUMBNAILS[cat];
  let hash = 0;
  const seed = maKhoaHoc || 'cybersoft';
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return list[Math.abs(hash) % list.length];
}

export function stripHtmlTags(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCleanCourse(course: KhoaHoc): boolean {
  if (!course || !course.maKhoaHoc || !course.tenKhoaHoc) return false;
  const title = course.tenKhoaHoc.trim();
  if (title.length < 4) return false;
  if (/([a-zA-Z])\1{3,}/.test(title)) return false;
  if (/^[a-z]{7,}$/i.test(title) && !/[aeiouyàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(title)) {
    return false;
  }
  if (/^(gaga|taiff|test|abc|xyz|string|demo123|qwer|asdf)/i.test(title)) return false;
  return true;
}

export function filterAndSortCourses(courses: KhoaHoc[], hideGibberish: boolean): KhoaHoc[] {
  if (!Array.isArray(courses)) return [];
  const valid = courses.filter((c) => Boolean(c && c.maKhoaHoc && c.tenKhoaHoc));
  if (!hideGibberish) return valid;

  const clean = valid.filter(isCleanCourse);
  return clean.length >= 6 ? clean : valid;
}

export function formatTodayDdMmYyyy(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function getCourseSyllabus(course: KhoaHoc): ChuongHocItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYLLABUS_STORE);
    if (raw) {
      const store = JSON.parse(raw) as Record<string, ChuongHocItem[]>;
      if (store[course.maKhoaHoc] && store[course.maKhoaHoc].length > 0) {
        return store[course.maKhoaHoc];
      }
    }
  } catch {
    // Fallback to default generated syllabus
  }

  const title = course.tenKhoaHoc || 'Lập trình chuyên sâu';
  return [
    {
      id: 'chuong-1',
      tenChuong: `Chương 1: Tổng quan & Thiết lập môi trường ${title}`,
      danhSachBaiHoc: [
        {
          id: `${course.maKhoaHoc}-b1`,
          tieuDe: `Bài 1: Giới thiệu lộ trình và mục tiêu khóa học ${title}`,
          thoiLuong: '12:45',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          moTa: 'Tổng quan kiến trúc hệ thống, công cụ cần thiết và tiêu chuẩn Clean Code trong dự án thực tế.',
          mienPhi: true,
        },
        {
          id: `${course.maKhoaHoc}-b2`,
          tieuDe: 'Bài 2: Cài đặt công cụ, cấu trúc thư mục chuẩn & Git Workflow',
          thoiLuong: '18:20',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          moTa: 'Hướng dẫn tổ chức dự án theo chuẩn doanh nghiệp, quy tắc đặt tên CamelCase & PascalCase.',
          mienPhi: true,
        },
      ],
    },
    {
      id: 'chuong-2',
      tenChuong: 'Chương 2: Kiến thức cốt lõi & Thực hành xây dựng Module',
      danhSachBaiHoc: [
        {
          id: `${course.maKhoaHoc}-b3`,
          tieuDe: 'Bài 3: Xây dựng tầng giao tiếp RESTful API & Xử lý bất đồng bộ',
          thoiLuong: '25:10',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          moTa: 'Tích hợp Axios Interceptor, quản lý JWT AccessToken và xử lý lỗi chuẩn xác.',
          mienPhi: false,
        },
        {
          id: `${course.maKhoaHoc}-b4`,
          tieuDe: 'Bài 4: Tối ưu hóa UI/UX, Responsive Design & Form Validation',
          thoiLuong: '22:35',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4',
          moTa: 'Thiết kế giao diện thích ứng đa thiết bị (Desktop, iPad, iPhone) với hệ thống SASS модуl hóa.',
          mienPhi: false,
        },
      ],
    },
    {
      id: 'chuong-3',
      tenChuong: 'Chương 3: Đồ án thực chiến & Triển khai Production (Deploy)',
      danhSachBaiHoc: [
        {
          id: `${course.maKhoaHoc}-b5`,
          tieuDe: 'Bài 5: Hoàn thiện chức năng nâng cao, kiểm thử & đóng gói',
          thoiLuong: '30:00',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          moTa: 'Kiểm tra toàn diện các luồng nghiệp vụ, tối ưu bundle và deploy lên Vercel/Netlify.',
          mienPhi: false,
        },
      ],
    },
  ];
}

export function saveCourseSyllabus(maKhoaHoc: string, syllabus: ChuongHocItem[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYLLABUS_STORE);
    const store: Record<string, ChuongHocItem[]> = raw ? JSON.parse(raw) : {};
    store[maKhoaHoc] = syllabus;
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_STORE, JSON.stringify(store));
  } catch {
    // Ignore storage quota errors
  }
}
