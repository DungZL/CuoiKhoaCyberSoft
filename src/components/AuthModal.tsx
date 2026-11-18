import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthForm } from './AuthForm';

export const AuthModal: React.FC = () => {
  const { authModalMode, closeAuthModal } = useApp();

  if (!authModalMode) return null;

  return (
    <div className="modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog--auth" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={closeAuthModal}
          aria-label="Đóng cửa sổ"
        >
          <X size={20} />
        </button>
        <AuthForm initialMode={authModalMode} onSuccess={closeAuthModal} />
      </div>
    </div>
  );
};
