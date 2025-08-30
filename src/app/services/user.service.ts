import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { User, ApiResponse } from '../models';
import { ApiService, PaginationOptions } from './api.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  // Get current user profile
  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('/users/me').pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        this.toastService.showError('Failed to load user profile');
        throw error;
      })
    );
  }

  // Update user profile
  updateProfile(updates: Partial<User>): Observable<User> {
    return this.apiService.put<User>('/users/profile', updates).pipe(
      tap(updatedUser => {
        this.currentUserSubject.next(updatedUser);
        this.toastService.showSuccess('Profile updated successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to update profile');
        throw error;
      })
    );
  }

  // Get user by ID
  getUserById(userId: string): Observable<User> {
    return this.apiService.get<User>(`/users/${userId}`);
  }

  // Get users list with pagination
  getUsers(options: PaginationOptions = {}): Observable<{ items: User[]; meta: any }> {
    return this.apiService.getPaginated<User>('/users', options);
  }

  // Search users
  searchUsers(query: string, options: PaginationOptions = {}): Observable<{ items: User[]; meta: any }> {
    return this.apiService.getPaginated<User>('/users/search', {
      ...options,
      search: query
    });
  }

  // Update user avatar
  updateAvatar(file: File): Observable<User> {
    return this.apiService.uploadFile<User>('/users/avatar', file, 'avatar').pipe(
      tap(updatedUser => {
        this.currentUserSubject.next(updatedUser);
        this.toastService.showSuccess('Avatar updated successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to update avatar');
        throw error;
      })
    );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.apiService.post('/users/change-password', {
      currentPassword,
      newPassword
    }).pipe(
      tap(() => {
        this.toastService.showSuccess('Password changed successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to change password');
        throw error;
      })
    );
  }

  // Delete user account
  deleteAccount(): Observable<any> {
    return this.apiService.delete('/users/me').pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.toastService.showSuccess('Account deleted successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to delete account');
        throw error;
      })
    );
  }

  // Admin methods
  createUser(userData: Partial<User>): Observable<User> {
    return this.apiService.post<User>('/admin/users', userData).pipe(
      tap(() => {
        this.toastService.showSuccess('User created successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to create user');
        throw error;
      })
    );
  }

  updateUser(userId: string, updates: Partial<User>): Observable<User> {
    return this.apiService.put<User>(`/admin/users/${userId}`, updates).pipe(
      tap(() => {
        this.toastService.showSuccess('User updated successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to update user');
        throw error;
      })
    );
  }

  deleteUser(userId: string): Observable<any> {
    return this.apiService.delete(`/admin/users/${userId}`).pipe(
      tap(() => {
        this.toastService.showSuccess('User deleted successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to delete user');
        throw error;
      })
    );
  }

  // Get user statistics
  getUserStats(): Observable<any> {
    return this.apiService.get('/admin/users/stats');
  }

  // Export users data
  exportUsers(format: 'csv' | 'json' = 'csv'): Observable<Blob> {
    return this.apiService.get(`/admin/users/export?format=${format}`, {
      headers: {
        'Accept': format === 'json' ? 'application/json' : 'text/csv'
      }
    });
  }

  // Batch operations
  batchUpdateUsers(updates: Array<{ id: string; data: Partial<User> }>): Observable<any> {
    return this.apiService.post('/admin/users/batch-update', { updates }).pipe(
      tap(() => {
        this.toastService.showSuccess('Users updated successfully');
      }),
      catchError(error => {
        this.toastService.showError('Failed to update users');
        throw error;
      })
    );
  }

  // Get current user from cache
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Clear current user
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user ? user.role === role : false;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUserValue();
    return user ? roles.includes(user.role) : false;
  }

  // Get user full name
  getUserFullName(user?: User): string {
    const targetUser = user || this.getCurrentUserValue();
    if (!targetUser) return 'Unknown User';

    return `${targetUser.firstName} ${targetUser.lastName}`.trim();
  }

  // Get user initials
  getUserInitials(user?: User): string {
    const targetUser = user || this.getCurrentUserValue();
    if (!targetUser) return 'U';

    return `${targetUser.firstName.charAt(0)}${targetUser.lastName.charAt(0)}`.toUpperCase();
  }
}