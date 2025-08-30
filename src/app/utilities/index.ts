import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

// Date Utilities
export class DateUtils {
  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }

  static formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  static formatDateTime(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  static isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return this.formatDate(date);
  }
}

// Validation Utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  static isValidPostalCode(postalCode: string, country: string = 'US'): boolean {
    const patterns: Record<string, RegExp> = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
      'UK': /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/,
      'AU': /^\d{4}$/
    };

    const pattern = patterns[country.toUpperCase()];
    return pattern ? pattern.test(postalCode) : false;
  }

  static isValidSSN(ssn: string): boolean {
    const cleaned = ssn.replace(/\D/g, '');
    return cleaned.length === 9 && /^\d{9}$/.test(cleaned);
  }

  static isValidIPv4(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);

    if (!match) return false;

    return match.slice(1).every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  static isValidIPv6(ip: string): boolean {
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Regex.test(ip);
  }

  static isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isValidJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  static isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  static isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  static isValidFileSize(size: number, maxSizeInBytes: number): boolean {
    return size <= maxSizeInBytes;
  }

  static isValidAge(birthDate: Date, minAge: number = 0, maxAge: number = 150): boolean {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age;

    return adjustedAge >= minAge && adjustedAge <= maxAge;
  }
}

// Platform Utilities
@Injectable({
  providedIn: 'root'
})
export class PlatformUtils {
  constructor(private platform: Platform) {}

  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  isAndroid(): boolean {
    return this.platform.is('android');
  }

  isIOS(): boolean {
    return this.platform.is('ios');
  }

  isWeb(): boolean {
    return !this.isNative();
  }

  getPlatform(): string {
    if (this.isAndroid()) return 'android';
    if (this.isIOS()) return 'ios';
    return 'web';
  }

  async ready(): Promise<void> {
    await this.platform.ready();
  }
}

// Storage Utilities
export class StorageUtils {
  static generateKey(prefix: string, id?: string): string {
    return id ? `${prefix}_${id}` : `${prefix}_${Date.now()}`;
  }

  static isExpired(timestamp: number, expiryMs: number): boolean {
    return Date.now() - timestamp > expiryMs;
  }
}

// String Utilities
export class StringUtils {
  static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static toTitleCase(str: string): string {
    return str.split(' ')
      .map(word => this.capitalizeFirst(word))
      .join(' ');
  }

  static truncate(str: string, maxLength: number): string {
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  }

  static toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
      .replace(/\s+/g, '');
  }

  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return str.replace(/[&<>"'\/]/g, char => htmlEscapes[char]);
  }

  static unescapeHtml(str: string): string {
    const htmlUnescapes: Record<string, string> = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      '&#x27;': "'",
      '&#x2F;': '/'
    };

    return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, match => htmlUnescapes[match]);
  }

  static removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  static countWords(str: string): number {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  static extractEmails(str: string): string[] {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return str.match(emailRegex) || [];
  }

  static extractUrls(str: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return str.match(urlRegex) || [];
  }

  static extractNumbers(str: string): number[] {
    const numberRegex = /\d+\.?\d*/g;
    return (str.match(numberRegex) || []).map(Number);
  }

  static padLeft(str: string, length: number, char: string = ' '): string {
    return str.padStart(length, char);
  }

  static padRight(str: string, length: number, char: string = ' '): string {
    return str.padEnd(length, char);
  }

  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  static isPalindrome(str: string): boolean {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === this.reverse(cleaned);
  }

  static countOccurrences(str: string, substring: string): number {
    if (substring.length === 0) return 0;
    let count = 0;
    let index = 0;

    while ((index = str.indexOf(substring, index)) !== -1) {
      count++;
      index += substring.length;
    }

    return count;
  }

  static insertAt(str: string, index: number, insertion: string): string {
    return str.slice(0, index) + insertion + str.slice(index);
  }

  static removeAt(str: string, start: number, length: number = 1): string {
    return str.slice(0, start) + str.slice(start + length);
  }
}

// Error Utilities
export class ErrorUtils {
  static createError(message: string, code?: string, statusCode?: number): Error {
    const error = new Error(message);
    if (code) (error as any).code = code;
    if (statusCode) (error as any).statusCode = statusCode;
    return error;
  }

  static createValidationError(message: string, field?: string): Error {
    const error = this.createError(message, 'VALIDATION_ERROR', 400);
    if (field) (error as any).field = field;
    return error;
  }

  static createAuthenticationError(message: string = 'Authentication required'): Error {
    return this.createError(message, 'AUTHENTICATION_ERROR', 401);
  }

  static createAuthorizationError(message: string = 'Access denied'): Error {
    return this.createError(message, 'AUTHORIZATION_ERROR', 403);
  }

  static createNotFoundError(message: string = 'Resource not found'): Error {
    return this.createError(message, 'NOT_FOUND_ERROR', 404);
  }

  static createConflictError(message: string = 'Resource conflict'): Error {
    return this.createError(message, 'CONFLICT_ERROR', 409);
  }

  static createInternalServerError(message: string = 'Internal server error'): Error {
    return this.createError(message, 'INTERNAL_SERVER_ERROR', 500);
  }

  static parseError(error: any): {
    message: string;
    code?: string;
    statusCode?: number;
    stack?: string;
    details?: any;
  } {
    return {
      message: error?.message || 'Unknown error',
      code: error?.code,
      statusCode: error?.statusCode,
      stack: error?.stack,
      details: error?.details
    };
  }

  static logError(error: any, context?: string): void {
    const parsedError = this.parseError(error);
    const timestamp = new Date().toISOString();

    console.error(`[${timestamp}] Error${context ? ` in ${context}` : ''}:`, {
      message: parsedError.message,
      code: parsedError.code,
      statusCode: parsedError.statusCode,
      stack: parsedError.stack
    });
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' ||
           error?.name === 'NetworkError' ||
           error?.message?.includes('fetch');
  }

  static isTimeoutError(error: any): boolean {
    return error?.code === 'TIMEOUT_ERROR' ||
           error?.name === 'TimeoutError' ||
           error?.message?.includes('timeout');
  }

  static isValidationError(error: any): boolean {
    return error?.code === 'VALIDATION_ERROR' ||
           error?.statusCode === 400;
  }

  static isAuthenticationError(error: any): boolean {
    return error?.code === 'AUTHENTICATION_ERROR' ||
           error?.statusCode === 401;
  }

  static isAuthorizationError(error: any): boolean {
    return error?.code === 'AUTHORIZATION_ERROR' ||
           error?.statusCode === 403;
  }

  static isNotFoundError(error: any): boolean {
    return error?.code === 'NOT_FOUND_ERROR' ||
           error?.statusCode === 404;
  }

  static getErrorMessage(error: any, fallback: string = 'An error occurred'): string {
    return error?.message || fallback;
  }

  static createRetryableError(originalError: any, retryCount: number): Error {
    const error = this.createError(
      `Operation failed after ${retryCount} retries: ${this.getErrorMessage(originalError)}`,
      'RETRY_ERROR'
    );
    (error as any).originalError = originalError;
    (error as any).retryCount = retryCount;
    return error;
  }

  static wrapError(error: any, wrapperMessage: string): Error {
    const wrappedError = this.createError(wrapperMessage);
    (wrappedError as any).originalError = error;
    wrappedError.stack = `${wrappedError.stack}\nCaused by: ${error?.stack || error}`;
    return wrappedError;
  }
}

// File Utilities
export class FileUtils {
  static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  static getFileNameWithoutExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = this.getFileExtension(filename);
    return imageExtensions.includes(extension);
  }

  static isVideoFile(filename: string): boolean {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const extension = this.getFileExtension(filename);
    return videoExtensions.includes(extension);
  }

  static isAudioFile(filename: string): boolean {
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
    const extension = this.getFileExtension(filename);
    return audioExtensions.includes(extension);
  }

  static isDocumentFile(filename: string): boolean {
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const extension = this.getFileExtension(filename);
    return documentExtensions.includes(extension);
  }

  static isSpreadsheetFile(filename: string): boolean {
    const spreadsheetExtensions = ['xls', 'xlsx', 'csv', 'ods'];
    const extension = this.getFileExtension(filename);
    return spreadsheetExtensions.includes(extension);
  }

  static isArchiveFile(filename: string): boolean {
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
    const extension = this.getFileExtension(filename);
    return archiveExtensions.includes(extension);
  }

  static getMimeType(filename: string): string {
    const extension = this.getFileExtension(filename);
    const mimeTypes: Record<string, string> = {
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'zip': 'application/zip',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv'
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  static generateUniqueFileName(originalName: string): string {
    const extension = this.getFileExtension(originalName);
    const nameWithoutExt = this.getFileNameWithoutExtension(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    return extension
      ? `${nameWithoutExt}_${timestamp}_${random}.${extension}`
      : `${nameWithoutExt}_${timestamp}_${random}`;
  }

  static sanitizeFileName(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 255);
  }

  static getFileIcon(filename: string): string {
    if (this.isImageFile(filename)) return 'image';
    if (this.isVideoFile(filename)) return 'video';
    if (this.isAudioFile(filename)) return 'audio';
    if (this.isDocumentFile(filename)) return 'document';
    if (this.isSpreadsheetFile(filename)) return 'spreadsheet';
    if (this.isArchiveFile(filename)) return 'archive';
    return 'file';
  }

  static validateFileSize(fileSize: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  }

  static validateFileType(filename: string, allowedTypes: string[]): boolean {
    const mimeType = this.getMimeType(filename);
    return allowedTypes.includes(mimeType);
  }

  static extractFileMetadata(file: File): {
    name: string;
    size: number;
    type: string;
    extension: string;
    formattedSize: string;
    isImage: boolean;
    isVideo: boolean;
    isAudio: boolean;
  } {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: this.getFileExtension(file.name),
      formattedSize: this.formatFileSize(file.size),
      isImage: this.isImageFile(file.name),
      isVideo: this.isVideoFile(file.name),
      isAudio: this.isAudioFile(file.name)
    };
  }
}

// Color Utilities
export class ColorUtils {
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  static lightenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.min(100, hsl.l + percent);

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static darkenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, hsl.l - percent);

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static adjustSaturation(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.s = Math.max(0, Math.min(100, hsl.s + percent));

    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  static getContrastColor(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#000000';

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  static generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  static blendColors(color1: string, color2: string, ratio: number = 0.5): string {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

    return this.rgbToHex(r, g, b);
  }

  static getColorBrightness(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  }

  static hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const rgb = this.hexToRgb(hex);
    return rgb ? this.rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  }

  static hslToHex(h: number, s: number, l: number): string {
    const rgb = this.hslToRgb(h, s, l);
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }
}

// Array Utilities
export class ArrayUtils {
  static removeDuplicates<T>(array: T[], key?: keyof T): T[] {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      });
    }
    return [...new Set(array)];
  }

  static groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as { [key: string]: T[] });
  }

  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

// Number Utilities
export class NumberUtils {
  static formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static formatNumber(num: number, decimals: number = 2, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  static formatPercentage(num: number, decimals: number = 2): string {
    return `${this.formatNumber(num * 100, decimals)}%`;
  }

  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  static roundToDecimal(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  static floorToDecimal(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(num * factor) / factor;
  }

  static ceilToDecimal(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.ceil(num * factor) / factor;
  }

  static isBetween(num: number, min: number, max: number, inclusive: boolean = true): boolean {
    return inclusive ? num >= min && num <= max : num > min && num < max;
  }

  static isEven(num: number): boolean {
    return num % 2 === 0;
  }

  static isOdd(num: number): boolean {
    return Math.abs(num % 2) === 1;
  }

  static isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;

    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  static generateRandom(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateRandomFloat(min: number = 0, max: number = 1): number {
    return Math.random() * (max - min) + min;
  }
}

// Object Utilities
export class ObjectUtils {
  static isEmpty(obj: any): boolean {
    return obj == null || Object.keys(obj).length === 0;
  }

  static isObject(value: any): boolean {
    return value != null && typeof value === 'object' && !Array.isArray(value);
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item)) as unknown as T;

    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = this.deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  static merge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = this.deepClone(target);
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        if (sourceValue !== undefined) {
          if (this.isObject(sourceValue) && this.isObject(result[key])) {
            (result as any)[key] = this.merge(result[key], sourceValue);
          } else {
            (result as any)[key] = sourceValue;
          }
        }
      }
    }
    return result;
  }

  static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  }

  static has(obj: any, path: string): boolean {
    return path.split('.').every(key => obj && obj.hasOwnProperty(key) && (obj = obj[key]));
  }

  static get(obj: any, path: string, defaultValue?: any): any {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result == null || !result.hasOwnProperty(key)) {
        return defaultValue;
      }
      result = result[key];
    }
    return result;
  }

  static set(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;

    for (const key of keys) {
      if (!(key in current) || !this.isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }
    current[lastKey] = value;
  }

  static keys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  static values(obj: any): any[] {
    return Object.values(obj || {});
  }

  static entries(obj: any): [string, any][] {
    return Object.entries(obj || {});
  }
}

// Async Utilities
export class AsyncUtils {
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), ms)
      )
    ]);
  }

  static retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    return fn().catch(error => {
      if (maxAttempts <= 1) {
        throw error;
      }
      return this.delay(delayMs).then(() =>
        this.retry(fn, maxAttempts - 1, delayMs)
      );
    });
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: any = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    getKey?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, Promise<any>>();

    return ((...args: Parameters<T>) => {
      const key = getKey ? getKey(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      cache.set(key, result);

      // Clean up cache after promise resolves
      result.finally(() => cache.delete(key));

      return result;
    }) as T;
  }

  static parallelLimit<T>(
    tasks: (() => Promise<T>)[],
    limit: number
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let running = 0;
      let completed = 0;
      let nextIndex = 0;

      const runTask = () => {
        if (nextIndex >= tasks.length) {
          if (completed === tasks.length) {
            resolve(results);
          }
          return;
        }

        const currentIndex = nextIndex++;
        running++;

        tasks[currentIndex]()
          .then(result => {
            results[currentIndex] = result;
            running--;
            completed++;
            runTask();
          })
          .catch(reject);
      };

      // Start initial batch
      for (let i = 0; i < Math.min(limit, tasks.length); i++) {
        runTask();
      }
    });
  }

  static raceWithDefault<T>(
    promises: Promise<T>[],
    defaultValue: T,
    timeoutMs?: number
  ): Promise<T> {
    const racePromises = [...promises];

    if (timeoutMs) {
      racePromises.push(this.delay(timeoutMs).then(() => defaultValue));
    }

    return Promise.race(racePromises).catch(() => defaultValue);
  }
}

// HTTP Utilities
export class HttpUtils {
  static buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, String(item)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    }

    return queryParams.toString();
  }

  static parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(queryString);

    // Use forEach for better browser compatibility
    urlParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  static buildUrl(baseUrl: string, path: string = '', params?: Record<string, any>): string {
    const url = new URL(path, baseUrl);

    if (params) {
      const queryString = this.buildQueryString(params);
      if (queryString) {
        url.search = queryString;
      }
    }

    return url.toString();
  }

  static getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
      'json': 'application/json',
      'xml': 'application/xml',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'csv': 'text/csv'
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  static isSuccessStatus(status: number): boolean {
    return status >= 200 && status < 300;
  }

  static isClientError(status: number): boolean {
    return status >= 400 && status < 500;
  }

  static isServerError(status: number): boolean {
    return status >= 500;
  }

  static createHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    };
  }

  static parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('text/')) {
      return response.text() as Promise<T>;
    }

    return response.blob() as Promise<T>;
  }

  static handleHttpError(response: Response): never {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).response = response;
    throw error;
  }

  static createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, String(item)));
        } else if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    }

    return formData;
  }
}

// Math Utilities
export class MathUtils {
  // Statistical functions
  static sum(numbers: number[]): number {
    return numbers.reduce((acc, num) => acc + num, 0);
  }

  static average(numbers: number[]): number {
    return numbers.length === 0 ? 0 : this.sum(numbers) / numbers.length;
  }

  static median(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static mode(numbers: number[]): number[] {
    if (numbers.length === 0) return [];

    const frequency: Record<number, number> = {};
    let maxFreq = 0;

    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[num]);
    });

    return Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number);
  }

  static standardDeviation(numbers: number[], population: boolean = false): number {
    if (numbers.length === 0) return 0;

    const mean = this.average(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    const variance = this.sum(squaredDiffs) / (population ? numbers.length : numbers.length - 1);

    return Math.sqrt(variance);
  }

  static variance(numbers: number[], population: boolean = false): number {
    if (numbers.length === 0) return 0;

    const mean = this.average(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));

    return this.sum(squaredDiffs) / (population ? numbers.length : numbers.length - 1);
  }

  static min(numbers: number[]): number {
    return Math.min(...numbers);
  }

  static max(numbers: number[]): number {
    return Math.max(...numbers);
  }

  static range(numbers: number[]): number {
    return this.max(numbers) - this.min(numbers);
  }

  // Geometric functions
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  static distance3D(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
  }

  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  static circleArea(radius: number): number {
    return Math.PI * Math.pow(radius, 2);
  }

  static circleCircumference(radius: number): number {
    return 2 * Math.PI * radius;
  }

  static rectangleArea(width: number, height: number): number {
    return width * height;
  }

  static triangleArea(base: number, height: number): number {
    return (base * height) / 2;
  }

  // Utility functions
  static factorial(n: number): number {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  static combinations(n: number, k: number): number {
    if (k > n) return 0;
    return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
  }

  static permutations(n: number, k: number): number {
    if (k > n) return 0;
    return this.factorial(n) / this.factorial(n - k);
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b);
  }

  static isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  static nextPowerOfTwo(n: number): number {
    if (n <= 0) return 1;
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }
}