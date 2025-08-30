// Application Constants
export const APP_CONSTANTS = {
  APP_NAME: 'Ionic Boilerplate',
  VERSION: '1.0.0',
  API_BASE_URL: 'https://api.example.com',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME_MODE: 'theme_mode',
    LANGUAGE: 'language'
  },
  TIMEOUTS: {
    HTTP_REQUEST: 30000,
    CACHE_EXPIRY: 3600000 // 1 hour
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  }
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Platform Types
export const PLATFORM_TYPES = {
  WEB: 'web',
  ANDROID: 'android',
  IOS: 'ios'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.'
};