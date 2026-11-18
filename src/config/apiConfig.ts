export interface ServerConfig {
  baseUrl: string;
  maNhom: string;
  tokenCybersoft: string;
  hideGibberishCourses: boolean;
}

export const STORAGE_KEYS = {
  USER_SESSION: 'cybersoft_elearning_user',
  ACCESS_TOKEN: 'cybersoft_elearning_token',
  SERVER_CONFIG: 'cybersoft_elearning_server_config',
  SYLLABUS_STORE: 'cybersoft_elearning_syllabus',
  LESSON_PROGRESS: 'cybersoft_elearning_lesson_progress',
  BOOKMARKS: 'cybersoft_elearning_bookmarks',
  THEME: 'cybersoft_elearning_theme',
} as const;

export const DEFAULT_TOKEN_CYBERSOFT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCA3MCIsIkhldEhhblN0cmluZyI6IjA4LzAyLzIwMjciLCJIZXRIYW5UaW1lIjoiMTc3MDUwODgwMDAwMCIsIm5iZiI6MTcxMDY5NDgwMCwiZXhwIjoxNzcwNjU2NDAwfQ.demo_token_cybersoft';

export const PRESET_SERVERS = [
  {
    id: 'elearning0706',
    label: 'Cybersoft Live Server (elearning0706 - Không giới hạn Token)',
    url: 'https://elearning0706.cybersoft.edu.vn',
  },
  {
    id: 'elearningnew',
    label: 'Cybersoft New Server (elearningnew - Yêu cầu TokenCybersoft)',
    url: 'https://elearningnew.cybersoft.edu.vn',
  },
] as const;

export const MA_NHOM_LIST = [
  'GP01',
  'GP02',
  'GP03',
  'GP04',
  'GP05',
  'GP06',
  'GP07',
  'GP08',
  'GP09',
  'GP10',
  'GP11',
  'GP12',
  'GP13',
  'GP14',
  'GP15',
] as const;

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  baseUrl: 'https://elearning0706.cybersoft.edu.vn',
  maNhom: 'GP01',
  tokenCybersoft: DEFAULT_TOKEN_CYBERSOFT,
  hideGibberishCourses: true,
};

export function getServerConfig(): ServerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVER_CONFIG);
    if (!raw) return DEFAULT_SERVER_CONFIG;
    const parsed = JSON.parse(raw) as Partial<ServerConfig>;
    return {
      baseUrl: parsed.baseUrl || DEFAULT_SERVER_CONFIG.baseUrl,
      maNhom: parsed.maNhom || DEFAULT_SERVER_CONFIG.maNhom,
      tokenCybersoft: parsed.tokenCybersoft ?? DEFAULT_SERVER_CONFIG.tokenCybersoft,
      hideGibberishCourses:
        typeof parsed.hideGibberishCourses === 'boolean'
          ? parsed.hideGibberishCourses
          : DEFAULT_SERVER_CONFIG.hideGibberishCourses,
    };
  } catch {
    return DEFAULT_SERVER_CONFIG;
  }
}

export function saveServerConfig(config: Partial<ServerConfig>): ServerConfig {
  const updated: ServerConfig = {
    ...getServerConfig(),
    ...config,
  };
  localStorage.setItem(STORAGE_KEYS.SERVER_CONFIG, JSON.stringify(updated));
  return updated;
}
