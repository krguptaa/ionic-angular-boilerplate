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