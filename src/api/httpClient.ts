import axios, { AxiosError } from 'axios';
import { getServerConfig, STORAGE_KEYS } from '../config/apiConfig';

export const httpClient = axios.create({
  timeout: 20000,
});

httpClient.interceptors.request.use((config) => {
  const serverConfig = getServerConfig();
  config.baseURL = serverConfig.baseUrl;

  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (serverConfig.tokenCybersoft) {
    config.headers.TokenCybersoft = serverConfig.tokenCybersoft;
  }

  return config;
});

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError< unknown >;
    const data = axiosErr.response?.data;
    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.content === 'string') return record.content;
      if (typeof record.message === 'string') return record.message;
      if (typeof record.title === 'string') return record.title;
    }
    if (axiosErr.message) return axiosErr.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
}
