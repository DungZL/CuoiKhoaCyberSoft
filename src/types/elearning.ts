export interface DanhMucKhoaHoc {
  maDanhMuc: string;
  tenDanhMuc: string;
}

export interface NguoiTao {
  taiKhoan: string;
  hoTen: string;
  maLoaiNguoiDung: string;
  tenLoaiNguoiDung: string;
}

export interface DanhMucKhoaHocNested {
  maDanhMucKhoahoc: string;
  tenDanhMucKhoaHoc: string;
}

export interface KhoaHoc {
  maKhoaHoc: string;
  biDanh: string;
  tenKhoaHoc: string;
  moTa: string;
  luotXem: number;
  hinhAnh: string;
  maNhom: string;
  ngayTao: string;
  soLuongHocVien: number;
  danhGia?: number;
  nguoiTao?: NguoiTao;
  danhMucKhoaHoc?: DanhMucKhoaHocNested;
}

export interface KhoaHocPayload {
  maKhoaHoc: string;
  biDanh: string;
  tenKhoaHoc: string;
  moTa: string;
  luotXem: number;
  danhGia: number;
  hinhAnh: string;
  maNhom: string;
  ngayTao: string;
  maDanhMucKhoaHoc: string;
  taiKhoanNguoiTao: string;
}

export interface ThongTinDangNhap {
  taiKhoan: string;
  matKhau: string;
}

export interface UserSession {
  taiKhoan: string;
  hoTen: string;
  email: string;
  soDT: string;
  maNhom: string;
  maLoaiNguoiDung: 'GV' | 'HV' | string;
  accessToken: string;
  matKhau?: string;
}

export interface DangKyPayload {
  taiKhoan: string;
  matKhau: string;
  hoTen: string;
  soDT: string;
  maNhom: string;
  email: string;
  maLoaiNguoiDung?: string;
}

export interface NguoiDungItem {
  taiKhoan: string;
  hoTen: string;
  email: string;
  soDt?: string;
  soDT?: string;
  matKhau?: string;
  maLoaiNguoiDung: string;
  tenLoaiNguoiDung?: string;
  biDanh?: string;
}

export interface NguoiDungPayload {
  taiKhoan: string;
  matKhau: string;
  hoTen: string;
  soDT: string;
  maLoaiNguoiDung: string;
  maNhom: string;
  email: string;
}

export interface KhoaHocGhiDanhItem {
  maKhoaHoc: string;
  tenKhoaHoc: string;
  biDanh?: string;
  hinhAnh?: string;
  moTa?: string;
  ngayTao?: string;
  luotXem?: number;
  danhGia?: number;
}

export interface ThongTinTaiKhoanResponse {
  taiKhoan: string;
  matKhau: string;
  hoTen: string;
  soDT: string;
  maLoaiNguoiDung: string;
  maNhom: string;
  email: string;
  chiTietKhoaHocGhiDanh: KhoaHocGhiDanhItem[];
}

export interface GhiDanhPayload {
  maKhoaHoc: string;
  taiKhoan: string;
}

export interface PaginatedResponse<T> {
  currentPage: number;
  count: number;
  totalPages: number;
  totalCount: number;
  items: T[];
}

export interface HocVienGhiDanhItem {
  taiKhoan: string;
  hoTen: string;
  biDanh?: string;
}

export interface BaiHocItem {
  id: string;
  tieuDe: string;
  thoiLuong: string;
  videoUrl: string;
  moTa: string;
  mienPhi: boolean;
}

export interface ChuongHocItem {
  id: string;
  tenChuong: string;
  danhSachBaiHoc: BaiHocItem[];
}
