import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="region" aria-label="Thông báo hệ thống">
      {toasts.map((item) => (
        <div key={item.id} className={`toast-item toast-${item.type}`}>
          <div className="toast-icon">
            {item.type === 'success' && <CheckCircle2 size={20} />}
            {item.type === 'error' && <AlertCircle size={20} />}
            {item.type === 'warning' && <AlertTriangle size={20} />}
            {item.type === 'info' && <Info size={20} />}
          </div>
          <div className="toast-content">
            <div className="toast-title">{item.title}</div>
            {item.description && <div className="toast-desc">{item.description}</div>}
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismissToast(item.id)}
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
