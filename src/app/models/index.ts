// Common API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

// User Model
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Role Enum
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

// Authentication Models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Pagination Model
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Generic List Response
export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Form Validation Error
export interface ValidationError {
  field: string;
  message: string;
}

// Theme Mode
export type ThemeMode = 'light' | 'dark' | 'auto';

// Platform Info
export interface PlatformInfo {
  platform: string;
  version: string;
  model: string;
  manufacturer: string;
  isVirtual: boolean;
}

// Location Model
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: number;
}

// File Upload Model
export interface FileUpload {
  file: File;
  name: string;
  type: string;
  size: number;
}

// Notification Model
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}