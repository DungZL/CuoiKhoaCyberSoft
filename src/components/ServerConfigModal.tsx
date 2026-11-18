import React, { useState } from 'react';
import { Globe, Key, Layers, RotateCcw, Save, Sliders, X } from 'lucide-react';
import {
  DEFAULT_SERVER_CONFIG,
  MA_NHOM_LIST,
  PRESET_SERVERS,
} from '../config/apiConfig';
import { useApp } from '../context/AppContext';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ isOpen, onClose }) => {
  const { serverConfig, updateServerConfig } = useApp();

  const [baseUrl, setBaseUrl] = useState(serverConfig.baseUrl);
  const [maNhom, setMaNhom] = useState(serverConfig.maNhom);
  const [tokenCybersoft, setTokenCybersoft] = useState(serverConfig.tokenCybersoft);
  const [hideGibberishCourses, setHideGibberishCourses] = useState(
    serverConfig.hideGibberishCourses
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateServerConfig({
      baseUrl: baseUrl.trim().replace(/\/+$/, ''),
      maNhom,
      tokenCybersoft: tokenCybersoft.trim(),
      hideGibberishCourses,
    });
    onClose();
  };

  const handleReset = () => {
    setBaseUrl(DEFAULT_SERVER_CONFIG.baseUrl);
    setMaNhom(DEFAULT_SERVER_CONFIG.maNhom);
    setTokenCybersoft(DEFAULT_SERVER_CONFIG.tokenCybersoft);
    setHideGibberishCourses(DEFAULT_SERVER_CONFIG.hideGibberishCourses);
    updateServerConfig(DEFAULT_SERVER_CONFIG);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog--md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title">
            <Sliders size={20} />
            <h3>Cấu hình Domain Server & Nhóm Dữ Liệu</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <div className="form-group">
            <label>Chọn nhanh Server Cybersoft</label>
            <div className="server-preset-list">
              {PRESET_SERVERS.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  className={`server-preset-btn ${baseUrl === srv.url ? 'active' : ''}`}
                  onClick={() => setBaseUrl(srv.url)}
                >
                  <Globe size={16} />
                  <div>
                    <strong>{srv.url}</strong>
                    <span>{srv.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="cfg-baseUrl">Địa chỉ Domain API Server</label>
              <div className="input-with-icon">
                <Globe size={16} />
                <input
                  id="cfg-baseUrl"
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://elearning0706.cybersoft.edu.vn"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cfg-maNhom">Mã Nhóm (GP01 → GP15)</label>
              <div className="input-with-icon">
                <Layers size={16} />
                <select
                  id="cfg-maNhom"
                  value={maNhom}
                  onChange={(e) => setMaNhom(e.target.value)}
                >
                  {MA_NHOM_LIST.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cfg-token">Header TokenCybersoft (dùng cho elearningnew)</label>
            <div className="input-with-icon">
              <Key size={16} />
              <input
                id="cfg-token"
                type="text"
                value={tokenCybersoft}
                onChange={(e) => setTokenCybersoft(e.target.value)}
                placeholder="Nhập TokenCybersoft..."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={hideGibberishCourses}
                onChange={(e) => setHideGibberishCourses(e.target.checked)}
              />
              <span>
                Lọc thông minh các khóa học spam/test ký tự vô nghĩa trên Server công cộng (bỏ chọn
                để hiển thị 100% dữ liệu thô)
              </span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              <RotateCcw size={16} /> Mặc định
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
