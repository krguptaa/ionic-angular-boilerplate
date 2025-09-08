import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';
import { ToastService } from '../services/toast.service';
import { User } from '../models';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, SharedModule],
})
export class DashboardPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  isLoading = false;
  apiTestResult: any = null;

  // Demo data
  testEndpoints = [
    { name: 'GET /users/me', method: 'GET', endpoint: '/users/me', description: 'Get current user profile' },
    { name: 'GET /dashboard', method: 'GET', endpoint: '/dashboard', description: 'Get dashboard data' },
    { name: 'POST /test', method: 'POST', endpoint: '/test', description: 'Test POST request' },
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Subscribe to authentication state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Load user profile on init
    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadUserProfile(): Promise<void> {
    try {
      this.isLoading = true;
      await this.userService.getCurrentUser().toPromise();
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async testApiCall(endpoint: any): Promise<void> {
    try {
      this.isLoading = true;
      this.apiTestResult = null;

      let result: any;

      switch (endpoint.method) {
        case 'GET':
          result = await this.apiService.get(endpoint.endpoint, {
            showLoader: true,
            cache: true,
            cacheTime: 30000 // 30 seconds
          }).toPromise();
          break;
        case 'POST':
          result = await this.apiService.post(endpoint.endpoint, {
            test: true,
            timestamp: new Date().toISOString()
          }, {
            showLoader: true
          }).toPromise();
          break;
        default:
          throw new Error(`Unsupported method: ${endpoint.method}`);
      }

      this.apiTestResult = {
        endpoint: endpoint.name,
        success: true,
        data: result,
        timestamp: new Date()
      };

      this.toastService.showSuccess(`API call to ${endpoint.name} successful!`);

    } catch (error: any) {
      this.apiTestResult = {
        endpoint: endpoint.name,
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date()
      };

      console.error(`API call to ${endpoint.name} failed:`, error);
    } finally {
      this.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshUserProfile(): Promise<void> {
    await this.loadUserProfile();
    this.toastService.showInfo('Profile refreshed');
  }

  // Utility methods
  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`.toUpperCase();
  }

  getUserFullName(): string {
    if (!this.currentUser) return 'Unknown User';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
