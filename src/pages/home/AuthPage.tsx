import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, Code2, Sparkles } from 'lucide-react';
import { AuthForm } from '../../components/AuthForm';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isRegister =
    location.pathname.includes('dang-ky') || location.pathname.includes('dangky');

  return (
    <div className="auth-page">
      <div className="container auth-page__grid">
        <div className="auth-page__pitch">
          <div className="hero-badge">
            <Sparkles size={15} />
            <span>Học Viện Đào Tạo Lập Trình Cybersoft</span>
          </div>
          <h1>Khởi Đầu Hành Trình Trở Thành Kỹ Sư Phần Mềm Toàn Diện</h1>
          <p>
            Đăng nhập hoặc tạo tài khoản học viên để ghi danh vào các khóa học thực
            chiến, quản lý hồ sơ học tập và trải nghiệm hệ thống E-Learning hiện đại.
          </p>

          <ul className="auth-pitch-list">
            <li>
              <CheckCircle2 size={18} />
              <span>Hệ thống API thực tế từ Cybersoft E-Learning (Đăng ký, Đăng nhập, JWT Token)</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>Hỗ trợ 1-Click đăng nhập nhanh tài khoản Giáo vụ (GV) và Học viên (HV)</span>
            </li>
            <li>
              <Award size={18} />
              <span>Quản lý khóa học đã ghi danh, tìm kiếm và hủy ghi danh dễ dàng</span>
            </li>
          </ul>

          <div className="auth-pitch-footer">
            <Code2 size={20} />
            <span>Clean Code • Material & Modern UI/UX • Responsive Multi-Device</span>
          </div>
        </div>

        <div className="auth-page__form-wrap">
          <AuthForm
            key={isRegister ? 'register' : 'login'}
            initialMode={isRegister ? 'register' : 'login'}
            onSuccess={() => navigate('/')}
            onSwitchMode={(nextMode) =>
              navigate(nextMode === 'login' ? '/dang-nhap' : '/dang-ky')
            }
          />
        </div>
      </div>
    </div>
  );
};
