import { Injectable, computed } from '@angular/core';
import { BaseStateService } from './base-state.service';

export interface AppState {
  isOnline: boolean;
  isLoading: boolean;
  currentRoute: string;
  previousRoute: string | null;
  appVersion: string;
  buildNumber: string;
  lastUpdateCheck: Date | null;
  updateAvailable: boolean;
  settings: {
    autoUpdate: boolean;
    analytics: boolean;
    crashReporting: boolean;
    notifications: boolean;
  };
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  cache: {
    lastCleared: Date | null;
    size: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService extends BaseStateService<AppState> {
  // Computed signals
  public readonly isOffline = computed(() => !this.state().isOnline);
  public readonly hasUpdate = computed(() => this.state().updateAvailable);
  public readonly currentTheme = computed(() => this.state().ui.theme);
  public readonly sidebarState = computed(() => this.state().ui.sidebarOpen);

  constructor() {
    super({
      persist: true,
      storageKey: 'app_state'
    });

    this.initializeNetworkListener();
  }

  protected getInitialState(): AppState {
    return {
      isOnline: navigator.onLine,
      isLoading: false,
      currentRoute: '/',
      previousRoute: null,
      appVersion: '1.0.0',
      buildNumber: '1',
      lastUpdateCheck: null,
      updateAvailable: false,
      settings: {
        autoUpdate: true,
        analytics: true,
        crashReporting: true,
        notifications: true
      },
      ui: {
        sidebarOpen: false,
        theme: 'auto',
        language: 'en'
      },
      cache: {
        lastCleared: null,
        size: 0
      }
    };
  }

  /**
   * Initialize network status listener
   */
  private initializeNetworkListener(): void {
    window.addEventListener('online', () => {
      this.setOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.setOnlineStatus(false);
    });
  }

  /**
   * Set online/offline status
   */
  public setOnlineStatus(isOnline: boolean): void {
    this.updateState({ isOnline });
  }

  /**
   * Set global loading state
   */
  public override setLoading(loading: boolean): void {
    this.updateState({ isLoading: loading });
  }

  /**
   * Update current route
   */
  public setCurrentRoute(route: string): void {
    const currentState = this.state();
    this.updateState({
      currentRoute: route,
      previousRoute: currentState.currentRoute
    });
  }

  /**
   * Update app version info
   */
  public setAppVersion(version: string, buildNumber: string): void {
    this.updateState({
      appVersion: version,
      buildNumber
    });
  }

  /**
   * Update settings
   */
  public updateSettings(settings: Partial<AppState['settings']>): void {
    this.updateStateFn(current => ({
      ...current,
      settings: { ...current.settings, ...settings }
    }));
  }

  /**
   * Update UI state
   */
  public updateUI(ui: Partial<AppState['ui']>): void {
    this.updateStateFn(current => ({
      ...current,
      ui: { ...current.ui, ...ui }
    }));
  }

  /**
   * Toggle sidebar
   */
  public toggleSidebar(): void {
    const current = this.state().ui.sidebarOpen;
    this.updateUI({ sidebarOpen: !current });
  }

  /**
   * Set sidebar state
   */
  public setSidebarState(open: boolean): void {
    this.updateUI({ sidebarOpen: open });
  }

  /**
   * Set theme
   */
  public setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.updateUI({ theme });
  }

  /**
   * Set language
   */
  public setLanguage(language: string): void {
    this.updateUI({ language });
  }

  /**
   * Check for updates
   */
  public async checkForUpdates(): Promise<boolean> {
    try {
      // Simulate update check - replace with actual implementation
      const hasUpdate = Math.random() > 0.8; // 20% chance of update

      this.updateState({
        lastUpdateCheck: new Date(),
        updateAvailable: hasUpdate
      });

      return hasUpdate;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  /**
   * Mark update as seen
   */
  public markUpdateAsSeen(): void {
    this.updateState({ updateAvailable: false });
  }

  /**
   * Update cache info
   */
  public updateCacheInfo(size: number): void {
    this.updateStateFn(current => ({
      ...current,
      cache: {
        ...current.cache,
        size
      }
    }));
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.updateStateFn(current => ({
      ...current,
      cache: {
        lastCleared: new Date(),
        size: 0
      }
    }));
  }

  /**
   * Get app info
   */
  public getAppInfo(): {
    version: string;
    buildNumber: string;
    isOnline: boolean;
    lastUpdateCheck: Date | null;
    updateAvailable: boolean;
  } {
    const state = this.state();
    return {
      version: state.appVersion,
      buildNumber: state.buildNumber,
      isOnline: state.isOnline,
      lastUpdateCheck: state.lastUpdateCheck,
      updateAvailable: state.updateAvailable
    };
  }

  /**
   * Get navigation history
   */
  public getNavigationHistory(): {
    current: string;
    previous: string | null;
  } {
    const state = this.state();
    return {
      current: state.currentRoute,
      previous: state.previousRoute
    };
  }

  /**
   * Reset UI state
   */
  public resetUIState(): void {
    this.updateStateFn(current => ({
      ...current,
      ui: {
        sidebarOpen: false,
        theme: 'auto',
        language: 'en'
      }
    }));
  }

  /**
   * Export app state for debugging
   */
  public exportAppState(): Partial<AppState> {
    const state = this.state();
    return {
      isOnline: state.isOnline,
      currentRoute: state.currentRoute,
      appVersion: state.appVersion,
      settings: state.settings,
      ui: state.ui
    };
  }

  /**
   * Check if app is in production
   */
  public isProduction(): boolean {
    return !location.hostname.includes('localhost') && !location.hostname.includes('127.0.0.1');
  }

  /**
   * Get environment info
   */
  public getEnvironmentInfo(): {
    isProduction: boolean;
    hostname: string;
    protocol: string;
    userAgent: string;
    platform: string;
  } {
    return {
      isProduction: this.isProduction(),
      hostname: location.hostname,
      protocol: location.protocol,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  }
}