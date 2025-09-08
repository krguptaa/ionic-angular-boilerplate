// Application Constants
import { environment } from '../../environments/environment';

export const APP_CONSTANTS = {
  APP_NAME: 'Ionic Boilerplate',
  VERSION: '1.0.0',
  API_BASE_URL: environment.apiUrl,
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

// Re-export API URLs for easy access
export * from './api-urls';

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

// API Methods configuration
export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  TEXT: 'text/plain',
  XML: 'application/xml'
} as const;

// Request timeout configurations
export const REQUEST_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 120000, // 2 minutes for file uploads
  DOWNLOAD: 60000  // 1 minute for downloads
} as const;

// API Response status codes
export const API_RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SESSION_EXPIRED: 7000,
  TOKEN_EXPIRED: 7001,
  ACCOUNT_DEACTIVATED: 9111
} as const;

// Export types for better TypeScript support
export type ApiMethod = typeof API_METHODS[keyof typeof API_METHODS];
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
export type ApiResponseCode = typeof API_RESPONSE_CODES[keyof typeof API_RESPONSE_CODES];