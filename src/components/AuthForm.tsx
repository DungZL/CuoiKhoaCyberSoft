import React, { useState } from 'react';
import {
  ArrowRight,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { elearningApi } from '../api/elearningApi';
import { extractErrorMessage } from '../api/httpClient';
import { MA_NHOM_LIST } from '../config/apiConfig';
import { useApp } from '../context/AppContext';

interface AuthFormProps {
  initialMode: 'login' | 'register';
  onSuccess?: () => void;
  onSwitchMode?: (mode: 'login' | 'register') => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  initialMode,
  onSuccess,
  onSwitchMode,
}) => {
  const { setSessionUser, notify, serverConfig } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [nhapLaiMatKhau, setNhapLaiMatKhau] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDT, setSoDT] = useState('');
  const [maNhom, setMaNhom] = useState(serverConfig.maNhom || 'GP01');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrors({});
    onSwitchMode?.(nextMode);
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!taiKhoan.trim()) {
      nextErrors.taiKhoan = 'Tài khoản không được để trống.';
    } else if (taiKhoan.trim().length < 2) {
      nextErrors.taiKhoan = 'Tài khoản phải có ít nhất 2 ký tự.';
    }

    if (!matKhau) {
      nextErrors.matKhau = 'Mật khẩu không được để trống.';
    } else if (matKhau.length < 4) {
      nextErrors.matKhau = 'Mật khẩu phải từ 4 ký tự trở lên.';
    }

    if (mode === 'register') {
      if (nhapLaiMatKhau !== matKhau) {
        nextErrors.nhapLaiMatKhau = 'Mật khẩu nhập lại không khớp.';
      }
      if (!hoTen.trim()) {
        nextErrors.hoTen = 'Họ tên không được để trống.';
      }
      if (!email.trim()) {
        nextErrors.email = 'Email không được để trống.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        nextErrors.email = 'Định dạng Email không hợp lệ.';
      }
      if (!soDT.trim()) {
        nextErrors.soDT = 'Số điện thoại không được để trống.';
      } else if (!/^[0-9+]{8,15}$/.test(soDT.trim())) {
        nextErrors.soDT = 'Số điện thoại phải từ 8 đến 15 chữ số.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const performLogin = async (username: string, password: string) => {
    try {
      setSubmitting(true);
      const session = await elearningApi.dangNhap({
        taiKhoan: username.trim(),
        matKhau: password,
      });
      setSessionUser({
        ...session,
        matKhau: password,
      });
      notify(
        'success',
        `Chào mừng ${session.hoTen || session.taiKhoan}!`,
        `Đăng nhập thành công với quyền ${
          session.maLoaiNguoiDung === 'GV' ? 'Giáo vụ (Admin)' : 'Học viên'
        }.`
      );
      onSuccess?.();
    } catch (err) {
      notify('error', 'Đăng nhập thất bại', extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'login') {
      await performLogin(taiKhoan, matKhau);
      return;
    }

    try {
      setSubmitting(true);
      await elearningApi.dangKy({
        taiKhoan: taiKhoan.trim(),
        matKhau,
        hoTen: hoTen.trim(),
        soDT: soDT.trim(),
        email: email.trim(),
        maNhom,
        maLoaiNguoiDung: 'HV',
      });
      notify(
        'success',
        'Đăng ký tài khoản thành công!',
        'Hệ thống đang tự động đăng nhập cho bạn...'
      );
      await performLogin(taiKhoan.trim(), matKhau);
    } catch (err) {
      notify('error', 'Đăng ký thất bại', extractErrorMessage(err));
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'GV' | 'HV') => {
    const account =
      role === 'GV'
        ? { user: 'bonnamsau', pass: 'bonnamsau' }
        : { user: 'vuachua1', pass: '123456' };
    setTaiKhoan(account.user);
    setMatKhau(account.pass);
    setErrors({});
    await performLogin(account.user, account.pass);
  };

  return (
    <div className="auth-card">
      <div className="auth-card__tabs">
        <button
          type="button"
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => switchMode('login')}
        >
          <KeyRound size={16} /> Đăng nhập
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => switchMode('register')}
        >
          <UserPlus size={16} /> Đăng ký
        </button>
      </div>

      <div className="auth-card__header">
        <h2>{mode === 'login' ? 'ĐĂNG NHẬP HỆ THỐNG' : 'ĐĂNG KÝ TÀI KHOẢN'}</h2>
        <p>
          {mode === 'login'
            ? 'Truy cập kho khóa học lập trình thực chiến & bảng điều khiển quản trị Cybersoft.'
            : 'Tạo tài khoản Học viên (HV) để đăng ký khóa học và theo dõi lộ trình học tập.'}
        </p>
      </div>

      {mode === 'login' && (
        <div className="demo-login-box">
          <span className="demo-login-box__label">Đăng nhập nhanh tài khoản thật trên Server:</span>
          <div className="demo-login-box__actions">
            <button
              type="button"
              className="btn btn-demo-gv"
              onClick={() => handleQuickDemoLogin('GV')}
              disabled={submitting}
            >
              <ShieldCheck size={15} /> Giáo vụ Admin (GV)
            </button>
            <button
              type="button"
              className="btn btn-demo-hv"
              onClick={() => handleQuickDemoLogin('HV')}
              disabled={submitting}
            >
              <UserCheck size={15} /> Học viên (HV)
            </button>
          </div>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="auth-taiKhoan">Tài khoản *</label>
            <div className="input-with-icon">
              <User size={16} />
              <input
                id="auth-taiKhoan"
                type="text"
                placeholder="Nhập tài khoản..."
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
              />
            </div>
            {errors.taiKhoan && <span className="field-error">{errors.taiKhoan}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-hoTen">Họ tên *</label>
              <div className="input-with-icon">
                <UserCheck size={16} />
                <input
                  id="auth-hoTen"
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                />
              </div>
              {errors.hoTen && <span className="field-error">{errors.hoTen}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-matKhau">Mật khẩu *</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                id="auth-matKhau"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
              />
            </div>
            {errors.matKhau && <span className="field-error">{errors.matKhau}</span>}
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="auth-nhapLaiMatKhau">Nhập lại mật khẩu *</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    id="auth-nhapLaiMatKhau"
                    type="password"
                    placeholder="Xác nhận mật khẩu..."
                    value={nhapLaiMatKhau}
                    onChange={(e) => setNhapLaiMatKhau(e.target.value)}
                  />
                </div>
                {errors.nhapLaiMatKhau && (
                  <span className="field-error">{errors.nhapLaiMatKhau}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="auth-email">Email *</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="auth-soDT">Số điện thoại *</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input
                    id="auth-soDT"
                    type="tel"
                    placeholder="0909123456"
                    value={soDT}
                    onChange={(e) => setSoDT(e.target.value)}
                  />
                </div>
                {errors.soDT && <span className="field-error">{errors.soDT}</span>}
              </div>

              <div className="form-group form-group--full">
                <label htmlFor="auth-maNhom">Mã nhóm</label>
                <select
                  id="auth-maNhom"
                  value={maNhom}
                  onChange={(e) => setMaNhom(e.target.value)}
                >
                  {MA_NHOM_LIST.map((group) => (
                    <option key={group} value={group}>
                      Nhóm {group}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="auth-form__actions">
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting
              ? 'Đang xử lý...'
              : mode === 'login'
              ? 'Đăng nhập'
              : 'Đăng ký tài khoản'}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}{' '}
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};
