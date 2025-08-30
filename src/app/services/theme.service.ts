import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

export type ThemeType = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<ThemeType>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private prefersDarkSubject = new BehaviorSubject<boolean>(false);
  public prefersDark$ = this.prefersDarkSubject.asObservable();

  constructor(private platform: Platform) {
    this.initializeTheme();
  }

  private async initializeTheme(): Promise<void> {
    // Check if platform is ready
    await this.platform.ready();

    // Get saved theme preference
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine initial theme
    let initialTheme: ThemeType = 'light';
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (systemPrefersDark) {
      initialTheme = 'auto';
    }

    // Apply the theme
    this.setTheme(initialTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.prefersDarkSubject.next(e.matches);
      if (this.currentThemeSubject.value === 'auto') {
        this.applyTheme(e.matches);
      }
    });
  }

  public setTheme(theme: ThemeType): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem('theme', theme);

    const isDark = theme === 'dark' || (theme === 'auto' && this.prefersDarkSubject.value);
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    const documentElement = document.documentElement;

    if (isDark) {
      documentElement.setAttribute('data-theme', 'dark');
    } else {
      documentElement.removeAttribute('data-theme');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1e1e1e' : '#ffffff');
    }
  }

  public getCurrentTheme(): ThemeType {
    return this.currentThemeSubject.value;
  }

  public isDarkMode(): boolean {
    const theme = this.currentThemeSubject.value;
    return theme === 'dark' || (theme === 'auto' && this.prefersDarkSubject.value);
  }

  public toggleTheme(): void {
    const currentTheme = this.currentThemeSubject.value;
    if (currentTheme === 'light') {
      this.setTheme('dark');
    } else if (currentTheme === 'dark') {
      this.setTheme('auto');
    } else {
      this.setTheme('light');
    }
  }

  public getThemeIcon(): string {
    const theme = this.currentThemeSubject.value;
    switch (theme) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'auto':
        return 'contrast';
      default:
        return 'sunny';
    }
  }

  public getThemeLabel(): string {
    const theme = this.currentThemeSubject.value;
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'auto':
        return 'Auto (System)';
      default:
        return 'Light Mode';
    }
  }
}