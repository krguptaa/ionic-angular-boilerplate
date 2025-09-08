// Storage Utilities
export class StorageUtils {
  static generateKey(prefix: string, id?: string): string {
    return id ? `${prefix}_${id}` : `${prefix}_${Date.now()}`;
  }

  static isExpired(timestamp: number, expiryMs: number): boolean {
    return Date.now() - timestamp > expiryMs;
  }
}