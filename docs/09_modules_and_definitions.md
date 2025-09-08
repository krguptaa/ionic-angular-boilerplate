# Modules and Definitions Guide

**Estimated time: 10 minutes**

## Overview

This guide provides a comprehensive overview of the application's code structure, modules, services, models, and key definitions. Understanding these components is essential for effective development and maintenance.

## 📋 Prerequisites Checklist

Before exploring the codebase:

- [ ] **Project Setup**: Complete [02_install_ionic_frontend.md](02_install_ionic_frontend.md)
- [ ] **Development Environment**: Running development server
- [ ] **IDE**: Visual Studio Code with Angular extensions
- [ ] **TypeScript**: Basic understanding of TypeScript concepts

### Code Organization Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Modularity** | Code divided into logical modules | Feature modules, shared modules |
| **Separation of Concerns** | Each component has single responsibility | Services for business logic, components for UI |
| **Dependency Injection** | Services injected rather than instantiated | Angular DI system |
| **Type Safety** | TypeScript interfaces and types | Strongly typed models and APIs |

## 🏗️ Application Architecture

### Core Structure

```
src/
├── app/
│   ├── core/              # Core functionality (singletons)
│   ├── shared/            # Shared components and utilities
│   ├── features/          # Feature-specific modules
│   ├── layouts/           # Layout components
│   └── services/          # Application services
├── assets/                # Static assets
├── environments/          # Environment configurations
└── styles/               # Global styles
```

### Module Organization

```
app/
├── app.module.ts         # Root application module
├── app-routing.module.ts # Main routing configuration
├── core/
│   ├── authentication/   # Auth guards and interceptors
│   ├── http/            # HTTP interceptors and handlers
│   └── state/           # Global state management
├── shared/
│   ├── components/      # Reusable UI components
│   ├── directives/      # Custom directives
│   ├── pipes/          # Custom pipes
│   └── utilities/      # Helper functions
└── features/
    ├── auth/           # Authentication feature
    ├── dashboard/      # Dashboard feature
    └── settings/       # Settings feature
```

## 🔧 Core Modules

### App Module

**File**: `src/app/app.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Core modules
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    CoreModule,
    SharedModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Core Module

**File**: `src/app/core/core.module.ts`

```typescript
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

// Services
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

    // Guards
    AuthGuard,
    GuestGuard,

    // Core Services
    AuthService,
    ApiService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
```

### Shared Module

**File**: `src/app/shared/shared.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

// Directives
import { AutofocusDirective } from './directives/autofocus.directive';

// Pipes
import { TruncatePipe } from './pipes/truncate.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    AutofocusDirective,
    TruncatePipe,
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    AutofocusDirective,
    TruncatePipe,
    TimeAgoPipe
  ]
})
export class SharedModule {}
```

## 📊 Models and Interfaces

### User Model

**File**: `src/app/models/user.model.ts`

```typescript
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export interface UserProfile extends User {
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
}
```

### API Response Models

**File**: `src/app/models/api.model.ts`

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  statusCode: number;
  timestamp: Date;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp: Date;
}
```

### Authentication Models

**File**: `src/app/models/auth.model.ts`

```typescript
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface RegisterResponse extends LoginResponse {}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

## 🔧 Services Architecture

### API Service

**File**: `src/app/services/api.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse, ListResponse, PaginationMeta } from '../models';
import { APP_CONSTANTS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = APP_CONSTANTS.API_BASE_URL;

  constructor(private http: HttpClient) {}

  // Generic CRUD operations
  get<T>(endpoint: string, params?: Record<string, any>): Observable<ApiResponse<T>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data);
  }

  patch<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`);
  }

  // Specialized methods
  getList<T>(endpoint: string, pagination?: PaginationMeta): Observable<ListResponse<T>> {
    const params = pagination ? this.buildPaginationParams(pagination) : {};
    return this.get<ListResponse<T>>(endpoint, params);
  }

  uploadFile(endpoint: string, file: File, fieldName = 'file'): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}${endpoint}`, formData);
  }

  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  private buildPaginationParams(pagination: PaginationMeta): Record<string, any> {
    return {
      page: pagination.page,
      limit: pagination.limit,
      sort: pagination.sort,
      order: pagination.order
    };
  }
}
```

### Authentication Service

**File**: `src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User, LoginRequest, LoginResponse } from '../models';
import { APP_CONSTANTS } from '../constants';

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
    private storage: Storage
  ) {
    this.initializeAuth();
  }

  async initializeAuth(): Promise<void> {
    const token = await this.storage.get(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    const user = await this.storage.get(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);

    if (token && user && !this.jwtHelper.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${APP_CONSTANTS.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(async (response) => {
          await this.handleLoginSuccess(response);
        }),
        catchError(error => throwError(() => error))
      );
  }

  async logout(): Promise<void> {
    const refreshToken = await this.storage.get(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      await this.http.post(`${APP_CONSTANTS.API_BASE_URL}/auth/logout`, { refreshToken }).toPromise();
    }

    await this.clearStoredData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await this.storage.get(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return null;

      const response = await this.http.post<{ accessToken: string }>(
        `${APP_CONSTANTS.API_BASE_URL}/auth/refresh`,
        { refreshToken }
      ).toPromise();

      if (response) {
        await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
        return response.accessToken;
      }
    } catch (error) {
      await this.logout();
    }
    return null;
  }

  private async handleLoginSuccess(response: LoginResponse): Promise<void> {
    await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
    await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    await this.storage.set(APP_CONSTANTS.STORAGE_KEYS.USER_DATA, response.user);

    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private async clearStoredData(): Promise<void> {
    await this.storage.remove(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    await this.storage.remove(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    await this.storage.remove(APP_CONSTANTS.STORAGE_KEYS.USER_DATA);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
}
```

## 🛡️ Guards and Interceptors

### Authentication Guard

**File**: `src/app/core/guards/auth.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }

    this.toastService.showError('Please login to access this page');
    this.router.navigate(['/auth/login']);
    return false;
  }
}
```

### Guest Guard

**File**: `src/app/core/guards/guest.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
```

### HTTP Interceptor

**File**: `src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add authorization header if user is logged in
    if (this.authService.isLoggedIn()) {
      const token = this.authService.getAccessToken();
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error.status === 401) {
          // Token expired, try to refresh
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = this.authService.getAccessToken();
              const newRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next.handle(newRequest);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
```

## 🎨 Components Structure

### Page Component

**File**: `src/app/pages/dashboard/dashboard.page.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from '../../models';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser$: Observable<User | null>;
  dashboardData: any;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.apiService.get('/dashboard')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dashboardData = response.data;
        },
        error: (error) => {
          console.error('Failed to load dashboard data:', error);
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
```

## 📋 Constants and Configuration

### Application Constants

**File**: `src/app/constants/index.ts`

```typescript
export const APP_CONSTANTS = {
  APP_NAME: 'Ionic App',
  VERSION: '1.0.0',
  API_BASE_URL: environment.apiUrl,

  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME_MODE: 'theme_mode',
    LANGUAGE: 'language'
  },

  TIMEOUTS: {
    HTTP_REQUEST: 30000,
    CACHE_EXPIRY: 3600000
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },

  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh'
    },
    USER: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile'
    }
  }
};
```

## 🔧 Utilities and Helpers

### HTTP Utilities

**File**: `src/app/utilities/http.utils.ts`

```typescript
import { HttpParams, HttpHeaders } from '@angular/common/http';

export class HttpUtils {
  static buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return httpParams;
  }

  static buildHeaders(headers: Record<string, string>): HttpHeaders {
    return new HttpHeaders(headers);
  }

  static handleError(error: any): Error {
    if (error.error?.message) {
      return new Error(error.error.message);
    }
    return new Error('An unexpected error occurred');
  }
}
```

### Validation Utilities

**File**: `src/app/utilities/validation.utils.ts`

```typescript
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}
```

## 📋 Module Definitions Checklist

- [ ] Core module properly configured with singleton services
- [ ] Shared module contains reusable components and utilities
- [ ] Feature modules implement lazy loading
- [ ] Models and interfaces properly typed
- [ ] Services follow single responsibility principle
- [ ] Guards and interceptors handle authentication correctly
- [ ] Components implement proper lifecycle management
- [ ] Constants centralized and environment-aware
- [ ] Utilities provide reusable helper functions

## 🎯 Success Criteria

✅ **Modular Architecture**: Code organized into logical, reusable modules
✅ **Type Safety**: All models and APIs properly typed with TypeScript
✅ **Dependency Injection**: Services properly injected and managed
✅ **Error Handling**: Comprehensive error handling throughout the application
✅ **Performance**: Lazy loading and efficient resource management
✅ **Maintainability**: Clean, well-documented, and testable code structure

## 🔧 Common Module Issues

### Issue 1: Circular Dependencies
**Problem**: Modules importing each other causing circular dependency errors
**Fix**:
- Restructure imports to avoid circular references
- Use dependency injection for cross-module communication
- Create shared interfaces in a common location

### Issue 2: Service Instantiation Issues
**Problem**: Services not properly injected or instantiated
**Fix**:
- Ensure services are provided in the correct module
- Use `providedIn: 'root'` for singleton services
- Check module import order

### Issue 3: Memory Leaks
**Problem**: Components not properly cleaning up subscriptions
**Fix**:
- Use `takeUntil` pattern with destroy subjects
- Unsubscribe from observables in `ngOnDestroy`
- Use async pipe in templates where possible

### Issue 4: Type Errors
**Problem**: TypeScript compilation errors
**Fix**:
- Ensure all models and interfaces are properly defined
- Use strict type checking
- Implement proper error handling types

### Issue 5: Bundle Size Issues
**Problem**: Large bundle sizes affecting performance
**Fix**:
- Implement lazy loading for feature modules
- Use tree shaking to remove unused code
- Optimize imports and dependencies

## 📚 Key Concepts Summary

| Concept | Purpose | Implementation |
|---------|---------|----------------|
| **Modules** | Organize code into logical units | `@NgModule` decorators |
| **Services** | Business logic and data management | Injectable classes with `@Injectable()` |
| **Components** | UI building blocks | Classes with `@Component()` decorator |
| **Models** | Data structure definitions | TypeScript interfaces and classes |
| **Guards** | Route protection | Classes implementing `CanActivate` |
| **Interceptors** | HTTP request/response handling | Classes implementing `HttpInterceptor` |
| **Pipes** | Data transformation in templates | Classes with `@Pipe()` decorator |
| **Directives** | DOM manipulation | Classes with `@Directive()` decorator |

## 🔄 Next Steps

After understanding the module structure:

1. **Explore Specific Features**: Dive into individual feature modules
2. **Review Service Implementations**: Understand business logic flow
3. **Examine Component Interactions**: Learn component communication patterns
4. **Study State Management**: Review how application state is managed
5. **Analyze Performance**: Identify optimization opportunities
6. **Plan New Features**: Use the existing structure as a template

## 📞 Support Resources

- **Angular Architecture**: [angular.io/guide/architecture](https://angular.io/guide/architecture)
- **Ionic Components**: [ionicframework.com/docs/components](https://ionicframework.com/docs/components)
- **TypeScript Handbook**: [typescriptlang.org/docs](https://typescriptlang.org/docs)
- **RxJS Documentation**: [rxjs.dev](https://rxjs.dev)