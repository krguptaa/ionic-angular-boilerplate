import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models';
import { APP_CONSTANTS } from '../constants';
import { ToastService } from './toast.service';
import { PlatformUtils } from '../utilities';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private toastService: ToastService,
    private platformUtils: PlatformUtils
  ) {
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Create storage instance
      await this.storage.create();
      // Now initialize auth
      await this.initializeAuth();
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  private async initializeAuth(): Promise<void> {
    try {
      await this.platformUtils.ready();

      // Check for stored tokens and user data
      const accessToken = await this.storage.get(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
      const userData = await this.storage.get(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);

      if (accessToken && userData) {
        // Check if token is expired
        if (!this.jwtHelper.isTokenExpired(accessToken)) {
          this.currentUserSubject.next(userData);
          this.isAuthenticatedSubject.next(true);
        } else {
          // Token expired, try to refresh
          await this.handleTokenExpiration();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${APP_CONSTANTS.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(async (response) => {
          await this.handleLoginSuccess(response);
        }),
        catchError(error => {
          this.toastService.showError('Login failed. Please check your credentials.');
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${APP_CONSTANTS.API_BASE_URL}/auth/register`, userData)
      .pipe(
        tap(async (response) => {
          await this.handleLoginSuccess(response);
        }),
        catchError(error => {
          this.toastService.showError('Registration failed. Please try again.');
          return throwError(() => error);
        })
      );
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if needed
      const refreshToken = await this.storage.get(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await this.http.post(`${APP_CONSTANTS.API_BASE_URL}/auth/logout`, { refreshToken }).toPromise();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      await this.clearStoredAuthData();

      // Update subjects
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);

      this.toastService.showInfo('Logged out successfully');
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await this.storage.get(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.http.post<{ accessToken: string; refreshToken: string }>(
        `${APP_CONSTANTS.API_BASE_URL}/auth/refresh`,
        { refreshToken }
      ).toPromise();

      if (response) {
        await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
        await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        return response.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getAccessToken(): Promise<string | null> {
    return this.storage.get(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
  }

  async isTokenExpired(token?: string): Promise<boolean> {
    try {
      const tokenToCheck = token || await this.getAccessToken();
      return tokenToCheck ? this.jwtHelper.isTokenExpired(tokenToCheck) : true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  async getTokenExpirationDate(): Promise<Date | null> {
    try {
      const token = await this.getAccessToken();
      return token ? this.jwtHelper.getTokenExpirationDate(token) : null;
    } catch (error) {
      console.error('Error getting token expiration date:', error);
      return null;
    }
  }

  async decodeToken(token?: string): Promise<any> {
    try {
      const tokenToDecode = token || await this.getAccessToken();
      return tokenToDecode ? this.jwtHelper.decodeToken(tokenToDecode) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private async handleLoginSuccess(response: LoginResponse | RegisterResponse): Promise<void> {
    try {
      // Store tokens securely
      await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
      await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.USER_DATA, response.user);

      // Update subjects
      this.currentUserSubject.next(response.user);
      this.isAuthenticatedSubject.next(true);

      this.toastService.showSuccess('Login successful!');
    } catch (error) {
      console.error('Error handling login success:', error);
      throw error;
    }
  }

  private async handleTokenExpiration(): Promise<void> {
    try {
      const newToken = await this.refreshToken();
      if (!newToken) {
        await this.logout();
      }
    } catch (error) {
      console.error('Error handling token expiration:', error);
      await this.logout();
    }
  }

  private async clearStoredAuthData(): Promise<void> {
    await this.storage.remove(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    await this.storage.remove(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    await this.storage.remove(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);
  }

  // Method to check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  // Method to check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  // Method to update user profile
  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${APP_CONSTANTS.API_BASE_URL}/users/profile`, updates)
      .pipe(
        tap(async (updatedUser) => {
          await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.USER_DATA, updatedUser);
          this.currentUserSubject.next(updatedUser);
          this.toastService.showSuccess('Profile updated successfully');
        }),
        catchError(error => {
          this.toastService.showError('Failed to update profile');
          return throwError(() => error);
        })
      );
  }

  // Method to change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${APP_CONSTANTS.API_BASE_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      tap(() => {
        this.toastService.showSuccess('Password changed successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to change password');
        return throwError(() => error);
      })
    );
  }

  // Method for forgot password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${APP_CONSTANTS.API_BASE_URL}/auth/forgot-password`, { email })
      .pipe(
        tap(() => {
          this.toastService.showSuccess('Password reset email sent');
        }),
        catchError(error => {
          this.toastService.showError('Failed to send reset email');
          return throwError(() => error);
        })
      );
  }

  // Method to reset password with token
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${APP_CONSTANTS.API_BASE_URL}/auth/reset-password`, {
      token,
      newPassword
    }).pipe(
      tap(() => {
        this.toastService.showSuccess('Password reset successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to reset password');
        return throwError(() => error);
      })
    );
  }
}