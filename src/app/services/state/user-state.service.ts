import { Injectable, computed } from '@angular/core';
import { User } from '../../models';
import { BaseStateService } from './base-state.service';

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastLoginAt: Date | null;
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  session: {
    token: string | null;
    refreshToken: string | null;
    expiresAt: Date | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserStateService extends BaseStateService<UserState> {
  // Computed signals for common user state
  public readonly isLoggedIn = computed(() => this.state().isAuthenticated);
  public readonly currentUser = computed(() => this.state().currentUser);
  public readonly userPreferences = computed(() => this.state().preferences);
  public readonly hasValidSession = computed(() => {
    const session = this.state().session;
    return !!(session.token && session.expiresAt && session.expiresAt > new Date());
  });

  constructor() {
    super({
      persist: true,
      storageKey: 'user_state',
      debounceMs: 300
    });
  }

  protected getInitialState(): UserState {
    return {
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      lastLoginAt: null,
      preferences: {
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: true,
        theme: 'auto'
      },
      session: {
        token: null,
        refreshToken: null,
        expiresAt: null
      }
    };
  }

  /**
   * Set current user and authentication status
   */
  public setUser(user: User | null, token?: string, refreshToken?: string, expiresAt?: Date): void {
    this.updateState({
      currentUser: user,
      isAuthenticated: !!user,
      lastLoginAt: user ? new Date() : null,
      session: {
        token: token || null,
        refreshToken: refreshToken || null,
        expiresAt: expiresAt || null
      }
    });
  }

  /**
   * Update user profile
   */
  public updateUser(updates: Partial<User>): void {
    const currentUser = this.state().currentUser;
    if (currentUser) {
      this.updateState({
        currentUser: { ...currentUser, ...updates }
      });
    }
  }

  /**
   * Update user preferences
   */
  public updatePreferences(preferences: Partial<UserState['preferences']>): void {
    this.updateStateFn(current => ({
      ...current,
      preferences: { ...current.preferences, ...preferences }
    }));
  }

  /**
   * Set language preference
   */
  public setLanguage(language: string): void {
    this.updatePreferences({ language });
  }

  /**
   * Set theme preference
   */
  public setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.updatePreferences({ theme });
  }

  /**
   * Toggle notifications
   */
  public toggleNotifications(): void {
    const current = this.state().preferences.notifications;
    this.updatePreferences({ notifications: !current });
  }

  /**
   * Update session tokens
   */
  public updateSession(token: string, refreshToken?: string, expiresAt?: Date): void {
    this.updateStateFn(current => ({
      ...current,
      session: {
        ...current.session,
        token,
        refreshToken: refreshToken || current.session.refreshToken,
        expiresAt: expiresAt || current.session.expiresAt
      }
    }));
  }

  /**
   * Clear session (logout)
   */
  public clearSession(): void {
    this.updateState({
      currentUser: null,
      isAuthenticated: false,
      session: {
        token: null,
        refreshToken: null,
        expiresAt: null
      }
    });
  }

  /**
   * Set loading state
   */
  public override setLoading(loading: boolean): void {
    this.updateState({ isLoading: loading });
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    const user = this.state().currentUser;
    return user ? user.role === role : false;
  }

  /**
   * Check if user has any of the specified roles
   */
  public hasAnyRole(roles: string[]): boolean {
    const user = this.state().currentUser;
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Get user display name
   */
  public getDisplayName(): string {
    const user = this.state().currentUser;
    if (!user) return 'Guest';

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return user.email.split('@')[0];
  }

  /**
   * Get user avatar URL
   */
  public getAvatarUrl(): string | null {
    const user = this.state().currentUser;
    return user?.avatar || null;
  }

  /**
   * Check if session is expired
   */
  public isSessionExpired(): boolean {
    const expiresAt = this.state().session.expiresAt;
    return !expiresAt || expiresAt <= new Date();
  }

  /**
   * Get time until session expires (in milliseconds)
   */
  public getTimeUntilExpiry(): number {
    const expiresAt = this.state().session.expiresAt;
    if (!expiresAt) return 0;

    return Math.max(0, expiresAt.getTime() - Date.now());
  }

  /**
   * Get user full profile
   */
  public getUserProfile(): User | null {
    return this.state().currentUser;
  }

  /**
   * Check if user profile is complete
   */
  public isProfileComplete(): boolean {
    const user = this.state().currentUser;
    if (!user) return false;

    return !!(user.firstName && user.lastName && user.avatar);
  }

  /**
   * Export user data for backup
   */
  public exportUserData(): {
    profile: User | null;
    preferences: UserState['preferences'];
    lastLoginAt: Date | null;
  } {
    const state = this.state();
    return {
      profile: state.currentUser,
      preferences: state.preferences,
      lastLoginAt: state.lastLoginAt
    };
  }
}