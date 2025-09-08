// API URL Configuration
// Centralized API endpoint management

export const API_URLS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },

  // User management
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    GET_CURRENT_USER: '/users/me',
    UPDATE_AVATAR: '/users/avatar',
    USER_LIST: '/users',
    USER_BY_ID: (id: string) => `/users/${id}`,
    USER_STATUS: (id: string) => `/users/${id}/status`
  },

  // Dashboard and Analytics
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/activity',
    CHARTS: '/dashboard/charts'
  },

  // File management
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id: string) => `/files/download/${id}`,
    DELETE: (id: string) => `/files/${id}`,
    LIST: '/files',
    GET_BY_ID: (id: string) => `/files/${id}`
  },

  // Settings and Configuration
  SETTINGS: {
    USER_PREFERENCES: '/settings/preferences',
    APP_CONFIG: '/settings/config',
    NOTIFICATIONS: '/settings/notifications'
  },

  // System endpoints
  SYSTEM: {
    HEALTH_CHECK: '/health',
    VERSION: '/version',
    LOGS: '/logs'
  },

  // CSRF Token
  CSRF: {
    GET_CSRF_CODE: '/csrf/token'
  }
};