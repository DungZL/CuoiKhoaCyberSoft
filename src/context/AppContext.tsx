import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { elearningApi } from '../api/elearningApi';
import {
  getServerConfig,
  saveServerConfig,
  ServerConfig,
  STORAGE_KEYS,
} from '../config/apiConfig';
import { DanhMucKhoaHoc, UserSession } from '../types/elearning';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface AppContextValue {
  user: UserSession | null;
  categories: DanhMucKhoaHoc[];
  serverConfig: ServerConfig;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
  bookmarks: string[];
  authModalMode: 'login' | 'register' | null;
  setSessionUser: (session: UserSession | null) => void;
  logout: () => void;
  updateServerConfig: (partial: Partial<ServerConfig>) => void;
  toggleTheme: () => void;
  notify: (type: ToastType, title: string, description?: string) => void;
  dismissToast: (id: string) => void;
  toggleBookmark: (maKhoaHoc: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  closeAuthModal: () => void;
  refreshCategories: () => Promise<void>;
}

const DEFAULT_CATEGORIES: DanhMucKhoaHoc[] = [
  { maDanhMuc: 'BackEnd', tenDanhMuc: 'Lập trình Backend' },
  { maDanhMuc: 'Design', tenDanhMuc: 'Thiết kế Web' },
  { maDanhMuc: 'DiDong', tenDanhMuc: 'Lập trình di động' },
  { maDanhMuc: 'FrontEnd', tenDanhMuc: 'Lập trình Front end' },
  { maDanhMuc: 'FullStack', tenDanhMuc: 'Lập trình Full Stack' },
  { maDanhMuc: 'TuDuy', tenDanhMuc: 'Tư duy lập trình' },
];

const AppContext = createContext<AppContextValue | undefined>(undefined);

function loadStoredUser(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

function loadStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => loadStoredUser());
  const [categories, setCategories] = useState<DanhMucKhoaHoc[]>(DEFAULT_CATEGORIES);
  const [serverConfig, setServerConfig] = useState<ServerConfig>(() => getServerConfig());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadStoredBookmarks());
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast]
  );

  const setSessionUser = useCallback((session: UserSession | null) => {
    setUser(session);
    if (session) {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
      if (session.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  }, []);

  const logout = useCallback(() => {
    setSessionUser(null);
    notify('info', 'Đã đăng xuất', 'Hẹn gặp lại bạn tại Cybersoft E-Learning!');
  }, [notify, setSessionUser]);

  const updateServerConfig = useCallback(
    (partial: Partial<ServerConfig>) => {
      const updated = saveServerConfig(partial);
      setServerConfig(updated);
      notify('success', 'Đã cập nhật cấu hình hệ thống', `Nhóm: ${updated.maNhom}`);
    },
    [notify]
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleBookmark = useCallback(
    (maKhoaHoc: string) => {
      setBookmarks((prev) => {
        const exists = prev.includes(maKhoaHoc);
        const next = exists ? prev.filter((item) => item !== maKhoaHoc) : [...prev, maKhoaHoc];
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(next));
        notify(
          'info',
          exists ? 'Đã bỏ lưu khóa học' : 'Đã lưu khóa học yêu thích',
          `Mã khóa học: ${maKhoaHoc}`
        );
        return next;
      });
    },
    [notify]
  );

  const openAuthModal = useCallback((mode: 'login' | 'register') => {
    setAuthModalMode(mode);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalMode(null);
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await elearningApi.layDanhMucKhoaHoc();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch {
      // Keep default categories fallback
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories, serverConfig.baseUrl]);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      categories,
      serverConfig,
      theme,
      toasts,
      bookmarks,
      authModalMode,
      setSessionUser,
      logout,
      updateServerConfig,
      toggleTheme,
      notify,
      dismissToast,
      toggleBookmark,
      openAuthModal,
      closeAuthModal,
      refreshCategories,
    }),
    [
      user,
      categories,
      serverConfig,
      theme,
      toasts,
      bookmarks,
      authModalMode,
      setSessionUser,
      logout,
      updateServerConfig,
      toggleTheme,
      notify,
      dismissToast,
      toggleBookmark,
      openAuthModal,
      closeAuthModal,
      refreshCategories,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
