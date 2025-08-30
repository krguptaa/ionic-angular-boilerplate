import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, retry, timeout, tap } from 'rxjs/operators';

import { ApiResponse, ListResponse, PaginationMeta } from '../models';
import { APP_CONSTANTS, HTTP_STATUS } from '../constants';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { ErrorUtils } from '../utilities';

export interface ApiOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  timeout?: number;
  retryAttempts?: number;
  showLoader?: boolean;
  showErrorToast?: boolean;
  cache?: boolean;
  cacheTime?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private cache = new Map<string, { data: any; timestamp: number; expiry: number }>();

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  // Generic CRUD Operations
  get<T = any>(endpoint: string, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('GET', endpoint, null, options);
  }

  post<T = any>(endpoint: string, data: any = null, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  put<T = any>(endpoint: string, data: any = null, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  patch<T = any>(endpoint: string, data: any = null, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  delete<T = any>(endpoint: string, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('DELETE', endpoint, null, options);
  }

  // Specialized Methods
  getList<T>(
    endpoint: string,
    paginationOptions: PaginationOptions = {},
    options: ApiOptions = {}
  ): Observable<ListResponse<T>> {
    const params = this.buildPaginationParams(paginationOptions);
    return this.get<ListResponse<T>>(endpoint, { ...options, params });
  }

  getPaginated<T>(
    endpoint: string,
    paginationOptions: PaginationOptions = {},
    options: ApiOptions = {}
  ): Observable<{ items: T[]; meta: PaginationMeta }> {
    const params = this.buildPaginationParams(paginationOptions);
    return this.get<{ items: T[]; meta: PaginationMeta }>(endpoint, { ...options, params });
  }

  uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, any>,
    options: ApiOptions = {}
  ): Observable<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const uploadOptions = { ...options };
    // Remove Content-Type header for FormData - let browser set it
    if (uploadOptions.headers && typeof uploadOptions.headers === 'object') {
      delete (uploadOptions.headers as any)['Content-Type'];
    }

    return this.post<T>(endpoint, formData, uploadOptions);
  }

  // Core Request Method
  private request<T>(
    method: string,
    endpoint: string,
    data: any = null,
    options: ApiOptions = {}
  ): Observable<T> {
    const {
      headers = {},
      params = {},
      timeout: requestTimeout = APP_CONSTANTS.TIMEOUTS.HTTP_REQUEST,
      retryAttempts = 1,
      showLoader = false,
      showErrorToast = true,
      cache = false,
      cacheTime = APP_CONSTANTS.TIMEOUTS.CACHE_EXPIRY
    } = options;

    // Show loading indicator if requested
    if (showLoader) {
      this.loadingSubject.next(true);
    }

    // Build full URL
    const url = this.buildUrl(endpoint);

    // Check cache first
    if (method === 'GET' && cache) {
      const cachedResponse = this.getCachedResponse(url, params);
      if (cachedResponse) {
        if (showLoader) {
          this.loadingSubject.next(false);
        }
        return cachedResponse as Observable<T>;
      }
    }

    // Prepare request options
    const requestOptions: any = {
      headers: this.buildHeaders(headers),
      params: this.buildParams(params)
    };

    // Add body for non-GET requests
    if (data !== null && method !== 'GET') {
      requestOptions.body = data;
    }

    // Make the request
    return this.http.request<T>(method, url, requestOptions).pipe(
      timeout(requestTimeout),
      retry(retryAttempts),
      map(response => this.handleSuccess(response)),
      tap(response => {
        // Cache successful GET responses
        if (method === 'GET' && cache) {
          this.setCachedResponse(url, params, response, cacheTime);
        }
      }),
      catchError(error => this.handleError(error, showErrorToast)),
      tap({
        next: () => {
          if (showLoader) {
            this.loadingSubject.next(false);
          }
        },
        error: () => {
          if (showLoader) {
            this.loadingSubject.next(false);
          }
        }
      })
    );
  }

  // URL Building
  private buildUrl(endpoint: string): string {
    const baseUrl = APP_CONSTANTS.API_BASE_URL;
    return endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  }

  // Header Building
  private buildHeaders(customHeaders: any): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Add custom headers
    if (customHeaders) {
      Object.keys(customHeaders).forEach(key => {
        const value = customHeaders[key];
        if (Array.isArray(value)) {
          headers = headers.set(key, value.join(', '));
        } else {
          headers = headers.set(key, value);
        }
      });
    }

    return headers;
  }

  // Parameter Building
  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, String(item));
            });
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      });
    }

    return httpParams;
  }

  // Pagination Parameter Building
  private buildPaginationParams(options: PaginationOptions): Record<string, string> {
    const params: Record<string, string> = {};

    if (options.page !== undefined) {
      params['page'] = options.page.toString();
    }
    if (options.limit !== undefined) {
      params['limit'] = options.limit.toString();
    }
    if (options.sort) {
      params['sort'] = options.sort;
    }
    if (options.order) {
      params['order'] = options.order;
    }
    if (options.search) {
      params['search'] = options.search;
    }
    if (options.filters) {
      Object.keys(options.filters).forEach(key => {
        const value = options.filters![key];
        if (value !== null && value !== undefined) {
          params[`filter[${key}]`] = String(value);
        }
      });
    }

    return params;
  }

  // Response Handling
  private handleSuccess(response: any): any {
    // If it's already an ApiResponse, return as is
    if (response && typeof response === 'object' && 'success' in response) {
      return response;
    }

    // Wrap raw response in ApiResponse format
    return {
      success: true,
      data: response,
      statusCode: HTTP_STATUS.OK
    };
  }

  // Error Handling
  private handleError(error: HttpErrorResponse, showToast: boolean): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 0;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      statusCode = error.status;
      errorMessage = this.getErrorMessage(error);
    }

    // Log error for debugging
    ErrorUtils.logError(error, 'API Service');

    // Handle specific error types
    switch (statusCode) {
      case HTTP_STATUS.UNAUTHORIZED:
        // Token expired or invalid - handled by AuthInterceptor
        break;
      case HTTP_STATUS.FORBIDDEN:
        if (showToast) {
          this.toastService.showError('You do not have permission to perform this action');
        }
        break;
      case HTTP_STATUS.NOT_FOUND:
        if (showToast) {
          this.toastService.showError('The requested resource was not found');
        }
        break;
      case HTTP_STATUS.CONFLICT:
        if (showToast) {
          this.toastService.showError('This action conflicts with the current state');
        }
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        if (showToast) {
          this.toastService.showError('Server error. Please try again later');
        }
        break;
      default:
        if (showToast) {
          this.toastService.showError(errorMessage);
        }
    }

    return throwError(() => ({
      message: errorMessage,
      statusCode,
      originalError: error
    }));
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error === 'object') {
      // API returned structured error
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.error) {
        return error.error.error;
      }
    }

    // Use HTTP status text as fallback
    return error.statusText || 'Unknown error occurred';
  }

  // Caching Methods
  private getCacheKey(url: string, params: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}${paramString}`;
  }

  private getCachedResponse(url: string, params: any): Observable<any> | null {
    const key = this.getCacheKey(url, params);
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.timestamp + cached.expiry) {
      return new Observable(subscriber => {
        subscriber.next(cached.data);
        subscriber.complete();
      });
    }

    // Remove expired cache entry
    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  private setCachedResponse(url: string, params: any, data: any, expiry: number): void {
    const key = this.getCacheKey(url, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  // Cache Management
  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForEndpoint(endpoint: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(endpoint)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Utility Methods
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Batch Operations
  batchGet<T>(endpoints: string[], options: ApiOptions = {}): Observable<T[]> {
    const requests = endpoints.map(endpoint => this.get<T>(endpoint, options));
    return new Observable(subscriber => {
      const results: T[] = [];
      let completed = 0;

      requests.forEach((request, index) => {
        request.subscribe({
          next: (result) => {
            results[index] = result;
            completed++;
            if (completed === requests.length) {
              subscriber.next(results);
              subscriber.complete();
            }
          },
          error: (error) => {
            subscriber.error(error);
          }
        });
      });
    });
  }

  // WebSocket/SSE Support (placeholder for future implementation)
  connectWebSocket(endpoint: string): Observable<any> {
    // Placeholder for WebSocket implementation
    return new Observable();
  }

  connectSSE(endpoint: string): Observable<any> {
    // Placeholder for Server-Sent Events implementation
    return new Observable();
  }
}