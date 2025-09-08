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