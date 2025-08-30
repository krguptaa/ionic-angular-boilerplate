import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

import { PlatformUtils } from '../utilities';
import { PlatformInfo } from '../models';
import { AppStateService } from './state/app-state.service';
import { NetworkStateService } from './state/network-state.service';

export interface PlatformCapabilities {
  isNative: boolean;
  platform: string;
  supportsCamera: boolean;
  supportsLocation: boolean;
  supportsPushNotifications: boolean;
  supportsBiometric: boolean;
  supportsHaptics: boolean;
  supportsSplashScreen: boolean;
  supportsStatusBar: boolean;
  supportsKeyboard: boolean;
}

export interface DeviceInfo extends PlatformInfo {
  capabilities: PlatformCapabilities;
  networkStatus: {
    connected: boolean;
    connectionType: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private deviceInfo: DeviceInfo | null = null;
  private isInitialized = false;

  constructor(
    private platform: Platform,
    private platformUtils: PlatformUtils,
    private appStateService: AppStateService,
    private networkStateService: NetworkStateService
  ) {
    this.initialize();
  }

  /**
   * Initialize platform services
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.platform.ready();

      // Initialize device info
      await this.loadDeviceInfo();

      // Initialize network monitoring
      await this.initializeNetworkMonitoring();

      // Initialize app event listeners
      await this.initializeAppListeners();

      // Initialize platform-specific features
      await this.initializePlatformFeatures();

      this.isInitialized = true;
      console.log('[PlatformService] Initialized successfully');
    } catch (error) {
      console.error('[PlatformService] Initialization failed:', error);
    }
  }

  /**
   * Load comprehensive device information
   */
  private async loadDeviceInfo(): Promise<void> {
    try {
      const [deviceInfo, networkStatus] = await Promise.all([
        Device.getInfo(),
        Network.getStatus()
      ]);

      const capabilities = await this.getPlatformCapabilities();

      this.deviceInfo = {
        platform: deviceInfo.platform,
        version: deviceInfo.osVersion,
        model: deviceInfo.model,
        manufacturer: deviceInfo.manufacturer,
        isVirtual: deviceInfo.isVirtual,
        capabilities,
        networkStatus: {
          connected: networkStatus.connected,
          connectionType: networkStatus.connectionType
        }
      };

      console.log('[PlatformService] Device info loaded:', this.deviceInfo);
    } catch (error) {
      console.error('[PlatformService] Failed to load device info:', error);
    }
  }

  /**
   * Get platform capabilities
   */
  private async getPlatformCapabilities(): Promise<PlatformCapabilities> {
    const capabilities: PlatformCapabilities = {
      isNative: this.platformUtils.isNative(),
      platform: this.platformUtils.getPlatform(),
      supportsCamera: false,
      supportsLocation: false,
      supportsPushNotifications: false,
      supportsBiometric: false,
      supportsHaptics: false,
      supportsSplashScreen: false,
      supportsStatusBar: false,
      supportsKeyboard: false
    };

    // Check Capacitor plugin availability
    capabilities.supportsCamera = Capacitor.isPluginAvailable('Camera');
    capabilities.supportsLocation = Capacitor.isPluginAvailable('Geolocation');
    capabilities.supportsPushNotifications = Capacitor.isPluginAvailable('PushNotifications');
    capabilities.supportsHaptics = Capacitor.isPluginAvailable('Haptics');
    capabilities.supportsSplashScreen = Capacitor.isPluginAvailable('SplashScreen');
    capabilities.supportsStatusBar = Capacitor.isPluginAvailable('StatusBar');
    capabilities.supportsKeyboard = Capacitor.isPluginAvailable('Keyboard');

    // Biometric support detection
    if (this.platformUtils.isNative()) {
      try {
        // This would require a biometric plugin
        capabilities.supportsBiometric = true;
      } catch {
        capabilities.supportsBiometric = false;
      }
    }

    return capabilities;
  }

  /**
   * Initialize network monitoring
   */
  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        console.log('[PlatformService] Network status changed:', status);

        // Update device info
        if (this.deviceInfo) {
          this.deviceInfo.networkStatus = {
            connected: status.connected,
            connectionType: status.connectionType
          };
        }
      });

      // Note: NetworkStateService handles its own network monitoring
    } catch (error) {
      console.error('[PlatformService] Failed to initialize network monitoring:', error);
    }
  }

  /**
   * Initialize app event listeners
   */
  private async initializeAppListeners(): Promise<void> {
    try {
      // App state change listeners
      App.addListener('appStateChange', (state) => {
        console.log('[PlatformService] App state changed:', state);

        if (state.isActive) {
          // App became active
          this.handleAppActive();
        } else {
          // App became inactive
          this.handleAppInactive();
        }
      });

      // App URL open listener (for deep linking)
      App.addListener('appUrlOpen', (event) => {
        console.log('[PlatformService] App URL opened:', event);
        this.handleDeepLink(event.url);
      });

      // App restore result listener
      App.addListener('appRestoredResult', (event) => {
        console.log('[PlatformService] App restored result:', event);
        this.handleAppRestore(event);
      });

    } catch (error) {
      console.error('[PlatformService] Failed to initialize app listeners:', error);
    }
  }

  /**
   * Initialize platform-specific features
   */
  private async initializePlatformFeatures(): Promise<void> {
    try {
      // Status bar configuration
      if (this.deviceInfo?.capabilities.supportsStatusBar) {
        await this.configureStatusBar();
      }

      // Keyboard configuration
      if (this.deviceInfo?.capabilities.supportsKeyboard) {
        await this.configureKeyboard();
      }

      // Splash screen - handled by Capacitor automatically

    } catch (error) {
      console.error('[PlatformService] Failed to initialize platform features:', error);
    }
  }

  /**
   * Configure status bar
   */
  private async configureStatusBar(): Promise<void> {
    try {
      const theme = this.appStateService.getState().ui.theme;
      const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light
      });

      await StatusBar.setBackgroundColor({
        color: isDark ? '#1e1e1e' : '#ffffff'
      });

      // Note: Theme changes are handled by the AppStateService
      // Status bar will be updated when theme changes occur

    } catch (error) {
      console.error('[PlatformService] Failed to configure status bar:', error);
    }
  }

  /**
   * Configure keyboard
   */
  private async configureKeyboard(): Promise<void> {
    try {
      // Configure keyboard behavior
      await Keyboard.setAccessoryBarVisible({ isVisible: true });

      // Listen for keyboard events
      Keyboard.addListener('keyboardWillShow', (info) => {
        console.log('[PlatformService] Keyboard will show:', info);
        this.handleKeyboardShow(info);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        console.log('[PlatformService] Keyboard will hide');
        this.handleKeyboardHide();
      });

    } catch (error) {
      console.error('[PlatformService] Failed to configure keyboard:', error);
    }
  }

  /**
   * Splash screen is handled automatically by Capacitor
   */

  /**
   * Handle app becoming active
   */
  private handleAppActive(): void {
    console.log('[PlatformService] App became active');
    // Perform any necessary actions when app becomes active
    // e.g., refresh data, check for updates, etc.
  }

  /**
   * Handle app becoming inactive
   */
  private handleAppInactive(): void {
    console.log('[PlatformService] App became inactive');
    // Perform any cleanup or background tasks
  }

  /**
   * Handle deep link
   */
  private handleDeepLink(url: string): void {
    console.log('[PlatformService] Handling deep link:', url);
    // Implement deep link handling logic
    // e.g., navigate to specific routes, handle OAuth callbacks, etc.
  }

  /**
   * Handle app restore
   */
  private handleAppRestore(event: any): void {
    console.log('[PlatformService] Handling app restore:', event);
    // Handle app restore scenarios
  }

  /**
   * Handle keyboard show
   */
  private handleKeyboardShow(info: any): void {
    // Adjust UI for keyboard
    // e.g., scroll content, adjust layouts, etc.
  }

  /**
   * Handle keyboard hide
   */
  private handleKeyboardHide(): void {
    // Reset UI after keyboard hides
  }

  /**
   * Get device information
   */
  public getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * Get platform capabilities
   */
  public getCapabilities(): PlatformCapabilities | null {
    return this.deviceInfo?.capabilities || null;
  }

  /**
   * Check if running on specific platform
   */
  public isPlatform(platform: 'ios' | 'android' | 'ipad' | 'iphone' | 'phablet' | 'tablet' | 'cordova' | 'capacitor' | 'electron' | 'pwa' | 'mobile' | 'mobileweb' | 'desktop' | 'hybrid'): boolean {
    return this.platform.is(platform);
  }

  /**
   * Check if running in specific mode
   */
  public isMode(mode: 'ios' | 'android' | 'mobile' | 'tablet' | 'desktop' | 'phablet'): boolean {
    return this.platform.is(mode);
  }

  /**
   * Vibrate device (haptic feedback)
   */
  public async vibrate(duration: number = 100): Promise<void> {
    try {
      if (this.deviceInfo?.capabilities.supportsHaptics) {
        await Haptics.vibrate({ duration });
      } else {
        // Fallback for devices without haptics
        navigator.vibrate(duration);
      }
    } catch (error) {
      console.error('[PlatformService] Vibration failed:', error);
    }
  }

  /**
   * Trigger haptic feedback
   */
  public async hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): Promise<void> {
    try {
      if (!this.deviceInfo?.capabilities.supportsHaptics) {
        return;
      }

      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } catch (error) {
      console.error('[PlatformService] Haptic feedback failed:', error);
    }
  }

  /**
   * Minimize app (send to background)
   */
  public async minimizeApp(): Promise<void> {
    try {
      if (this.platformUtils.isNative()) {
        await App.minimizeApp();
      }
    } catch (error) {
      console.error('[PlatformService] Failed to minimize app:', error);
    }
  }

  /**
   * Exit app
   */
  public async exitApp(): Promise<void> {
    try {
      if (this.platformUtils.isNative()) {
        await App.exitApp();
      }
    } catch (error) {
      console.error('[PlatformService] Failed to exit app:', error);
    }
  }

  /**
   * Get app info
   */
  public async getAppInfo(): Promise<any> {
    try {
      return await App.getInfo();
    } catch (error) {
      console.error('[PlatformService] Failed to get app info:', error);
      return null;
    }
  }

  /**
   * Open app settings
   */
  public async openAppSettings(): Promise<void> {
    try {
      // This would require a specific plugin or native implementation
      console.log('[PlatformService] Open app settings not implemented');
    } catch (error) {
      console.error('[PlatformService] Failed to open app settings:', error);
    }
  }

  /**
   * Check if app can open URL
   */
  public async canOpenUrl(url: string): Promise<boolean> {
    try {
      // This would require a specific plugin
      console.log('[PlatformService] URL availability check not implemented');
      return false;
    } catch (error) {
      console.error('[PlatformService] Failed to check URL availability:', error);
      return false;
    }
  }

  /**
   * Open URL in external browser
   */
  public async openUrl(url: string): Promise<void> {
    try {
      window.open(url, '_system');
    } catch (error) {
      console.error('[PlatformService] Failed to open URL:', error);
    }
  }

  /**
   * Share content
   */
  public async share(content: { title?: string; text?: string; url?: string }): Promise<void> {
    try {
      if (navigator.share) {
        await navigator.share(content);
      } else {
        // Fallback sharing logic
        console.log('[PlatformService] Web Share API not available');
      }
    } catch (error) {
      console.error('[PlatformService] Failed to share content:', error);
    }
  }

  /**
   * Copy to clipboard
   */
  public async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('[PlatformService] Failed to copy to clipboard:', error);
    }
  }

  /**
   * Get clipboard content
   */
  public async getClipboardContent(): Promise<string> {
    try {
      if (navigator.clipboard) {
        return await navigator.clipboard.readText();
      }
      return '';
    } catch (error) {
      console.error('[PlatformService] Failed to get clipboard content:', error);
      return '';
    }
  }

  /**
   * Check if device has notch/dynamic island
   */
  public hasNotch(): boolean {
    // Check for iPhone X series or Android devices with notch
    const userAgent = navigator.userAgent.toLowerCase();
    const hasNotch = /iphone.*(x|11|12|13|14|15)/.test(userAgent) ||
                    /android.*(?:pixel.*3|pixel.*4|pixel.*5|pixel.*6|pixel.*7|pixel.*8)/.test(userAgent);

    return hasNotch && window.innerHeight > 800;
  }

  /**
   * Get safe area insets
   */
  public getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    if (typeof CSS !== 'undefined' && CSS.supports('padding-top: env(safe-area-inset-top)')) {
      const testEl = document.createElement('div');
      testEl.style.cssText = `
        position: fixed;
        top: env(safe-area-inset-top);
        bottom: env(safe-area-inset-bottom);
        left: env(safe-area-inset-left);
        right: env(safe-area-inset-right);
        visibility: hidden;
      `;
      document.body.appendChild(testEl);

      const style = getComputedStyle(testEl);
      const insets = {
        top: parseInt(style.top || '0'),
        bottom: parseInt(style.bottom || '0'),
        left: parseInt(style.left || '0'),
        right: parseInt(style.right || '0')
      };

      document.body.removeChild(testEl);
      return insets;
    }

    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  /**
   * Clean up resources
   */
  public async destroy(): Promise<void> {
    try {
      // Remove all listeners
      Network.removeAllListeners();
      App.removeAllListeners();
      Keyboard.removeAllListeners();

      this.deviceInfo = null;
      this.isInitialized = false;

      console.log('[PlatformService] Cleaned up successfully');
    } catch (error) {
      console.error('[PlatformService] Cleanup failed:', error);
    }
  }
}