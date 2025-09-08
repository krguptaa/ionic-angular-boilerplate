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