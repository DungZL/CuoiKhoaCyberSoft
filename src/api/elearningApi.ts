import { getServerConfig } from '../config/apiConfig';
import {
  DangKyPayload,
  DanhMucKhoaHoc,
  GhiDanhPayload,
  HocVienGhiDanhItem,
  KhoaHoc,
  KhoaHocGhiDanhItem,
  KhoaHocPayload,
  NguoiDungItem,
  NguoiDungPayload,
  PaginatedResponse,
  ThongTinDangNhap,
  ThongTinTaiKhoanResponse,
  UserSession,
} from '../types/elearning';
import { httpClient } from './httpClient';

function currentMaNhom(maNhom?: string): string {
  return maNhom || getServerConfig().maNhom || 'GP01';
}

export const elearningApi = {
  // 1 - Lấy danh sách & tìm kiếm khóa học
  async layDanhSachKhoaHoc(tenKhoaHoc = '', maNhom?: string): Promise<KhoaHoc[]> {
    const params: Record<string, string> = {
      MaNhom: currentMaNhom(maNhom),
    };
    if (tenKhoaHoc.trim()) {
      params.tenKhoaHoc = tenKhoaHoc.trim();
    }
    const response = await httpClient.get<KhoaHoc[]>('/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc', {
      params,
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  // 1b - Lấy danh sách khóa học phân trang
  async layDanhSachKhoaHocPhanTrang(
    page = 1,
    pageSize = 8,
    tenKhoaHoc = '',
    maNhom?: string
  ): Promise<PaginatedResponse<KhoaHoc>> {
    const response = await httpClient.get<PaginatedResponse<KhoaHoc>>(
      '/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc_PhanTrang',
      {
        params: {
          tenKhoaHoc: tenKhoaHoc.trim(),
          page,
          pageSize,
          MaNhom: currentMaNhom(maNhom),
        },
      }
    );
    return response.data;
  },

  // 1.1 - Lấy chi tiết khóa học
  async layThongTinKhoaHoc(maKhoaHoc: string): Promise<KhoaHoc> {
    const response = await httpClient.get<KhoaHoc>('/api/QuanLyKhoaHoc/LayThongTinKhoaHoc', {
      params: { maKhoaHoc },
    });
    return response.data;
  },

  // 2 - Lấy danh mục khóa học
  async layDanhMucKhoaHoc(): Promise<DanhMucKhoaHoc[]> {
    const response = await httpClient.get<DanhMucKhoaHoc[]>(
      '/api/QuanLyKhoaHoc/LayDanhMucKhoaHoc'
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  // 3 - Lấy khóa học theo danh mục
  async layKhoaHocTheoDanhMuc(maDanhMuc: string, maNhom?: string): Promise<KhoaHoc[]> {
    const response = await httpClient.get<KhoaHoc[]>('/api/QuanLyKhoaHoc/LayKhoaHocTheoDanhMuc', {
      params: {
        maDanhMuc,
        MaNhom: currentMaNhom(maNhom),
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  // 4 - Đăng ký tài khoản
  async dangKy(payload: DangKyPayload): Promise<DangKyPayload> {
    const body = {
      ...payload,
      maNhom: currentMaNhom(payload.maNhom),
      maLoaiNguoiDung: payload.maLoaiNguoiDung || 'HV',
    };
    const response = await httpClient.post<DangKyPayload>('/api/QuanLyNguoiDung/DangKy', body);
    return response.data;
  },

  // 5 - Đăng nhập
  async dangNhap(payload: ThongTinDangNhap): Promise<UserSession> {
    const response = await httpClient.post<UserSession>('/api/QuanLyNguoiDung/DangNhap', payload);
    return response.data;
  },

  // 6 & 10 - Cập nhật thông tin cá nhân / người dùng
  async capNhatThongTinNguoiDung(payload: NguoiDungPayload): Promise<unknown> {
    const body: NguoiDungPayload = {
      ...payload,
      maNhom: currentMaNhom(payload.maNhom),
    };
    const response = await httpClient.put('/api/QuanLyNguoiDung/CapNhatThongTinNguoiDung', body);
    return response.data;
  },

  // 7 - Đăng ký khóa học (Học viên tự đăng ký)
  async dangKyKhoaHoc(payload: GhiDanhPayload): Promise<string> {
    const response = await httpClient.post<string>('/api/QuanLyKhoaHoc/DangKyKhoaHoc', payload);
    return typeof response.data === 'string' ? response.data : 'Đăng ký khóa học thành công!';
  },

  // 8 & 13.1.5 & 13.2.5 - Hủy ghi danh khóa học
  async huyGhiDanh(payload: GhiDanhPayload): Promise<string> {
    const response = await httpClient.post<string>('/api/QuanLyKhoaHoc/HuyGhiDanh', payload);
    return typeof response.data === 'string' ? response.data : 'Hủy ghi danh thành công!';
  },

  // 9 - Xem thông tin cá nhân & danh sách khóa học đã ghi danh
  async layThongTinTaiKhoan(taiKhoan?: string): Promise<ThongTinTaiKhoanResponse> {
    const response = await httpClient.post<ThongTinTaiKhoanResponse>(
      '/api/QuanLyNguoiDung/ThongTinTaiKhoan',
      taiKhoan ? { taiKhoan } : {}
    );
    return response.data;
  },

  // 11 - Quản lý người dùng
  async layDanhSachNguoiDung(maNhom?: string, tuKhoa = ''): Promise<NguoiDungItem[]> {
    const params: Record<string, string> = {
      MaNhom: currentMaNhom(maNhom),
    };
    if (tuKhoa.trim()) {
      params.tuKhoa = tuKhoa.trim();
    }
    const response = await httpClient.get<NguoiDungItem[]>(
      '/api/QuanLyNguoiDung/LayDanhSachNguoiDung',
      { params }
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async layDanhSachNguoiDungPhanTrang(
    page = 1,
    pageSize = 10,
    tuKhoa = '',
    maNhom?: string
  ): Promise<PaginatedResponse<NguoiDungItem>> {
    const params: Record<string, string | number> = {
      MaNhom: currentMaNhom(maNhom),
      page,
      pageSize,
    };
    if (tuKhoa.trim()) {
      params.tuKhoa = tuKhoa.trim();
    }
    const response = await httpClient.get<PaginatedResponse<NguoiDungItem>>(
      '/api/QuanLyNguoiDung/LayDanhSachNguoiDung_PhanTrang',
      { params }
    );
    return response.data;
  },

  async timKiemNguoiDung(tuKhoa: string, maNhom?: string): Promise<NguoiDungItem[]> {
    const response = await httpClient.get<NguoiDungItem[]>(
      '/api/QuanLyNguoiDung/TimKiemNguoiDung',
      {
        params: {
          MaNhom: currentMaNhom(maNhom),
          tuKhoa: tuKhoa.trim(),
        },
      }
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async themNguoiDung(payload: NguoiDungPayload): Promise<NguoiDungPayload> {
    const body: NguoiDungPayload = {
      ...payload,
      maNhom: currentMaNhom(payload.maNhom),
    };
    const response = await httpClient.post<NguoiDungPayload>(
      '/api/QuanLyNguoiDung/ThemNguoiDung',
      body
    );
    return response.data;
  },

  async xoaNguoiDung(taiKhoan: string): Promise<string> {
    const response = await httpClient.delete<string>('/api/QuanLyNguoiDung/XoaNguoiDung', {
      params: { TaiKhoan: taiKhoan },
    });
    return typeof response.data === 'string' ? response.data : 'Xóa người dùng thành công!';
  },

  // 12 - Quản lý khóa học
  async themKhoaHoc(payload: KhoaHocPayload): Promise<unknown> {
    const response = await httpClient.post('/api/QuanLyKhoaHoc/ThemKhoaHoc', {
      ...payload,
      maNhom: currentMaNhom(payload.maNhom),
    });
    return response.data;
  },

  async capNhatKhoaHoc(payload: KhoaHocPayload): Promise<unknown> {
    const response = await httpClient.put('/api/QuanLyKhoaHoc/CapNhatKhoaHoc', {
      ...payload,
      maNhom: currentMaNhom(payload.maNhom),
    });
    return response.data;
  },

  async xoaKhoaHoc(maKhoaHoc: string): Promise<string> {
    const response = await httpClient.delete<string>('/api/QuanLyKhoaHoc/XoaKhoaHoc', {
      params: { MaKhoaHoc: maKhoaHoc, maKhoaHoc },
    });
    return typeof response.data === 'string' ? response.data : 'Xóa khóa học thành công!';
  },

  async uploadHinhAnhKhoaHoc(file: File, tenKhoaHoc: string): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenKhoaHoc', tenKhoaHoc);
    const response = await httpClient.post(
      '/api/QuanLyKhoaHoc/UploadHinhAnhKhoaHoc',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // 13.1 - Ghi danh người dùng dựa vào khóa học
  async layDanhSachNguoiDungChuaGhiDanh(maKhoaHoc: string): Promise<HocVienGhiDanhItem[]> {
    const response = await httpClient.post<HocVienGhiDanhItem[]>(
      '/api/QuanLyNguoiDung/LayDanhSachNguoiDungChuaGhiDanh',
      { maKhoaHoc, MaKhoaHoc: maKhoaHoc }
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async layDanhSachHocVienKhoaHoc(maKhoaHoc: string): Promise<HocVienGhiDanhItem[]> {
    const response = await httpClient.post<HocVienGhiDanhItem[]>(
      '/api/QuanLyNguoiDung/LayDanhSachHocVienKhoaHoc',
      { maKhoaHoc, MaKhoaHoc: maKhoaHoc }
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async layDanhSachHocVienChoXetDuyet(maKhoaHoc: string): Promise<HocVienGhiDanhItem[]> {
    const response = await httpClient.post<HocVienGhiDanhItem[]>(
      '/api/QuanLyNguoiDung/LayDanhSachHocVienChoXetDuyet',
      { maKhoaHoc, MaKhoaHoc: maKhoaHoc }
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async ghiDanhKhoaHoc(payload: GhiDanhPayload): Promise<string> {
    const response = await httpClient.post<string>('/api/QuanLyKhoaHoc/GhiDanhKhoaHoc', payload);
    return typeof response.data === 'string' ? response.data : 'Ghi danh thành công!';
  },

  // 13.2 - Ghi danh khóa học dựa vào người dùng
  async layDanhSachKhoaHocChuaGhiDanh(taiKhoan: string): Promise<KhoaHocGhiDanhItem[]> {
    const response = await httpClient.post<KhoaHocGhiDanhItem[]>(
      '/api/QuanLyNguoiDung/LayDanhSachKhoaHocChuaGhiDanh',
      { taiKhoan, TaiKhoan: taiKhoan },
      { params: { TaiKhoan: taiKhoan } }
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async layDanhSachKhoaHocDaXetDuyet(taiKhoan: string): Promise<KhoaHocGhiDanhItem[]> {
    const response = await httpClient.post<KhoaHocGhiDanhItem[]>(
      '/api/QuanLyNguoiDung/LayDanhSachKhoaHocDaXetDuyet',
      { taiKhoan, TaiKhoan: taiKhoan }
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async layDanhSachKhoaHocChoXetDuyet(taiKhoan: string): Promise<KhoaHocGhiDanhItem[]> {
    const response = await httpClient.post<KhoaHocGhiDanhItem[]>(
      '/api/QuanLyNguoiDung/LayDanhSachKhoaHocChoXetDuyet',
      { taiKhoan, TaiKhoan: taiKhoan }
    );
    return Array.isArray(response.data) ? response.data : [];
  },
};
