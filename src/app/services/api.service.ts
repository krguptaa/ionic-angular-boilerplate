/**
 * Angular API Service
 *
 * A comprehensive HTTP client service for making API calls with built-in features:
 * - Request/response intercepting
 * - Error handling with user-friendly messages
 * - Loading state management
 * - Response caching
 * - CSRF token handling
 * - File upload support
 * - Pagination helpers
 *
 * @author Ionic Boilerplate Team
 * @version 1.0.0
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, retry, timeout, tap } from 'rxjs/operators';

import { ApiResponse, ListResponse, PaginationMeta } from '../models';
import { APP_CONSTANTS, HTTP_STATUS, API_RESPONSE_CODES } from '../constants';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { ErrorUtils } from '../utilities';

/**
 * Configuration options for API requests
 */
export interface ApiOptions {
  /** Custom headers to include in the request */
  headers?: HttpHeaders | { [header: string]: string | string[] };
  /** Query parameters for the request */
  params?: HttpParams | { [param: string]: string | string[] };
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts for failed requests */
  retryAttempts?: number;
  /** Whether to show loading indicator during request */
  showLoader?: boolean;
  /** Whether to show error toast on request failure */
  showErrorToast?: boolean;
  /** Whether to cache GET request responses */
  cache?: boolean;
  /** Cache expiry time in milliseconds */
  cacheTime?: number;
}

/**
 * Configuration options for paginated requests
 */
export interface PaginationOptions {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Sort field */
  sort?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
  /** Search query */
  search?: string;
  /** Filter criteria */
  filters?: Record<string, any>;
}

/**
 * CSRF token data structure
 */
interface CsrfTokenData {
  token: string;
  timestamp: number;
}

/**
 * Cached response data structure
 */
interface CachedResponse {
  data: any;
  timestamp: number;
  expiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // =====================================
  // PROPERTIES
  // =====================================

  /** Loading state observable for UI feedback */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();

  /** Response cache storage */
  private cache = new Map<string, CachedResponse>();

  /** CSRF token storage */
  private csrfTokens = new Map<string, CsrfTokenData>();

  // =====================================
  // CONSTRUCTOR
  // =====================================

  /**
   * Initialize the API service
   * @param http Angular HTTP client
   * @param toastService Toast notification service
   * @param authService Authentication service
   */
  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  // =====================================
  // BASIC HTTP METHODS
  // =====================================

  /**
   * Perform a GET request
   * @param endpoint API endpoint (relative to base URL)
   * @param options Request configuration options
   * @returns Observable of the response
   *
   * @example
   * ```typescript
   * this.apiService.get('/users').subscribe(users => {
   *   console.log('Users:', users);
   * });
   * ```
   */
  get<T = any>(endpoint: string, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('GET', endpoint, null, options);
  }

  /**
   * Perform a POST request
   * @param endpoint API endpoint (relative to base URL)
   * @param data Request payload
   * @param options Request configuration options
   * @returns Observable of the response
   *
   * @example
   * ```typescript
   * this.apiService.post('/users', { name: 'John' }).subscribe(user => {
   *   console.log('Created user:', user);
   * });
   * ```
   */
  post<T = any>(endpoint: string, data: any = null, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Perform a PUT request
   * @param endpoint API endpoint (relative to base URL)
   * @param data Request payload
   * @param options Request configuration options
   * @returns Observable of the response
   */
  put<T = any>(endpoint: string, data: any = null, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Perform a PATCH request
   * @param endpoint API endpoint (relative to base URL)
   * @param data Request payload
   * @param options Request configuration options
   * @returns Observable of the response
   */
  patch<T = any>(endpoint: string, data: any = null, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Perform a DELETE request
   * @param endpoint API endpoint (relative to base URL)
   * @param options Request configuration options
   * @returns Observable of the response
   */
  delete<T = any>(endpoint: string, options: ApiOptions = {}): Observable<T> {
    return this.request<T>('DELETE', endpoint, null, options);
  }

  // =====================================
  // SPECIALIZED METHODS
  // =====================================

  /**
   * Get a paginated list of items
   * @param endpoint API endpoint
   * @param paginationOptions Pagination configuration
   * @param options Additional request options
   * @returns Observable of paginated list response
   *
   * @example
   * ```typescript
   * this.apiService.getList('/users', { page: 1, limit: 10 })
   *   .subscribe(response => {
   *     console.log('Items:', response.items);
   *     console.log('Total:', response.total);
   *   });
   * ```
   */
  getList<T>(
    endpoint: string,
    paginationOptions: PaginationOptions = {},
    options: ApiOptions = {}
  ): Observable<ListResponse<T>> {
    const params = this.buildPaginationParams(paginationOptions);
    return this.get<ListResponse<T>>(endpoint, { ...options, params });
  }

  /**
   * Get paginated data with metadata
   * @param endpoint API endpoint
   * @param paginationOptions Pagination configuration
   * @param options Additional request options
   * @returns Observable with items and pagination metadata
   */
  getPaginated<T>(
    endpoint: string,
    paginationOptions: PaginationOptions = {},
    options: ApiOptions = {}
  ): Observable<{ items: T[]; meta: PaginationMeta }> {
    const params = this.buildPaginationParams(paginationOptions);
    return this.get<{ items: T[]; meta: PaginationMeta }>(endpoint, { ...options, params });
  }

  // =====================================
  // FILE UPLOAD METHODS
  // =====================================

  /**
   * Upload a file using FormData
   * @param endpoint API endpoint for file upload
   * @param file File to upload
   * @param fieldName Form field name for the file (default: 'file')
   * @param additionalData Additional form data to include
   * @param options Request configuration options
   * @returns Observable of the upload response
   *
   * @example
   * ```typescript
   * const file = event.target.files[0];
   * this.apiService.uploadFile('/upload', file, 'avatar', { userId: 123 })
   *   .subscribe(response => {
   *     console.log('Upload successful:', response);
   *   });
   * ```
   */
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

  /**
   * Upload a file as base64 string
   * @param endpoint API endpoint for file upload
   * @param file File to upload
   * @param additionalData Additional data to include in the payload
   * @param fileKey Key name for the base64 file data (default: 'file')
   * @returns Observable of the upload response
   *
   * @example
   * ```typescript
   * const file = event.target.files[0];
   * this.apiService.uploadFileAsBase64('/upload', file, { userId: 123 })
   *   .subscribe(response => {
   *     console.log('Upload successful:', response);
   *   });
   * ```
   */
  uploadFileAsBase64<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    fileKey: string = 'file'
  ): Observable<T> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        // Convert file to base64 string
        const base64String = (reader.result as string).split(',')[1]; // Extract the base64 part
        const payload = {
          ...additionalData,
          [fileKey]: base64String,
          fileName: file.name,
          fileType: file.type
        };

        // Send the POST request with base64 data as JSON
        this.post<T>(endpoint, payload).subscribe(
          response => observer.next(response),
          error => observer.error(error),
          () => observer.complete()
        );
      };
      reader.onerror = (error) => {
        observer.error(error);
      };

      // Start reading the file as Data URL (base64)
      reader.readAsDataURL(file);
    });
  }

  // =====================================
  // CSRF TOKEN MANAGEMENT
  // =====================================

  /**
   * Get CSRF token for a specific form
   * @param formName Name of the form requesting CSRF protection
   * @returns Promise resolving to CSRF token data
   *
   * @example
   * ```typescript
   * this.apiService.getCsrfToken('loginForm').then(token => {
   *   console.log('CSRF token:', token);
   * });
   * ```
   */
  getCsrfToken(formName: string): Promise<{ csrf_token: string; timestamp: number }> {
    return this.get<{ csrf_token: string; timestamp: number }>(`/csrf/token?formName=${formName}`)
      .toPromise()
      .then(response => {
        if (response) {
          // Store the token for future use
          this.csrfTokens.set(formName, {
            token: response.csrf_token,
            timestamp: response.timestamp
          });
          return response;
        }
        throw new Error('Failed to get CSRF token');
      });
  }

  /**
   * Add CSRF token to request data (internal method)
   * @param data Request payload to modify
   * @param formName Name of the form
   * @private
   */
  private addCsrfToken(data: any, formName?: string): void {
    if (formName && this.csrfTokens.has(formName)) {
      const csrfData = this.csrfTokens.get(formName);
      if (csrfData) {
        data.csrfCode = csrfData.token;
        data.timestamp = csrfData.timestamp;
      }
    }
  }

  // =====================================
  // CORE REQUEST HANDLING
  // =====================================

  /**
   * Core method for making HTTP requests with comprehensive features
   * @param method HTTP method (GET, POST, PUT, PATCH, DELETE)
   * @param endpoint API endpoint (relative to base URL)
   * @param data Request payload (for POST, PUT, PATCH)
   * @param options Request configuration options
   * @returns Observable of the response
   * @private
   */
  private request<T>(
    method: string,
    endpoint: string,
    data: any = null,
    options: ApiOptions = {}
  ): Observable<T> {
    // Extract options with defaults
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

    // Check cache first for GET requests
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

    // Make the HTTP request with comprehensive error handling
    return this.http.request<T>(method, url, requestOptions).pipe(
      // Timeout handling
      timeout(requestTimeout),

      // Retry logic
      retry(retryAttempts),

      // Response transformation
      map(response => this.handleSuccess(response)),

      // Cache successful GET responses
      tap(response => {
        if (method === 'GET' && cache) {
          this.setCachedResponse(url, params, response, cacheTime);
        }
      }),

      // Error handling
      catchError(error => this.handleError(error, showErrorToast)),

      // Loading state management
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

  // =====================================
  // UTILITY METHODS
  // =====================================

  /**
   * Build complete URL from endpoint
   * @param endpoint API endpoint (relative or absolute)
   * @returns Complete URL string
   * @private
   */
  private buildUrl(endpoint: string): string {
    const baseUrl = APP_CONSTANTS.API_BASE_URL;
    return endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  }

  /**
   * Build HTTP headers for request
   * @param customHeaders Custom headers to include
   * @returns HttpHeaders object
   * @private
   */
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

  /**
   * Build HTTP parameters for request
   * @param params Query parameters
   * @returns HttpParams object
   * @private
   */
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

  /**
   * Build pagination parameters for API requests
   * @param options Pagination configuration
   * @returns Object with pagination parameters
   * @private
   */
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

  /**
   * Handle successful API responses
   * @param response Raw response from API
   * @returns Processed response
   * @private
   */
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

  // =====================================
  // ERROR HANDLING
  // =====================================

  /**
   * Handle API errors with user-friendly messages
   * @param error HTTP error response
   * @param showToast Whether to show error toast
   * @returns Observable that throws the error
   * @private
   */
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
        // Check for validation errors and show modal popup
        if (error.error?.errors?.validationErrorMsg) {
          this.showValidationErrorModal(error.error.errors.validationErrorMsg);
        } else if (showToast) {
          this.toastService.showError(errorMessage);
        }
    }

    return throwError(() => ({
      message: errorMessage,
      statusCode,
      originalError: error
    }));
  }

  /**
   * Show validation errors in a modal popup
   * @param validationErrors Object containing field validation errors
   * @private
   */
  private showValidationErrorModal(validationErrors: Record<string, string>): void {
    const formattedErrors = Object.entries(validationErrors)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    const modalContent = `
      <div style="text-align: left; font-size: 14px; line-height: 1.6;">
        <ul style="margin: 0; padding-left: 20px;">${formattedErrors}</ul>
      </div>
    `;

    // For now, show as toast. In a real implementation, you'd show a modal
    this.toastService.showError('Please check the form for validation errors');
    console.log('Validation Errors:', validationErrors);
  }

  /**
   * Extract error message from HTTP error response
   * @param error HTTP error response
   * @returns Error message string
   * @private
   */
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

  // =====================================
  // CACHING SYSTEM
  // =====================================

  /**
   * Generate cache key from URL and parameters
   * @param url Request URL
   * @param params Request parameters
   * @returns Cache key string
   * @private
   */
  private getCacheKey(url: string, params: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}${paramString}`;
  }

  /**
   * Get cached response if available and not expired
   * @param url Request URL
   * @param params Request parameters
   * @returns Observable with cached data or null
   * @private
   */
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

  /**
   * Store response in cache
   * @param url Request URL
   * @param params Request parameters
   * @param data Response data to cache
   * @param expiry Cache expiry time in milliseconds
   * @private
   */
  private setCachedResponse(url: string, params: any, data: any, expiry: number): void {
    const key = this.getCacheKey(url, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  /**
   * Clear all cached responses
   *
   * @example
   * ```typescript
   * this.apiService.clearCache();
   * ```
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific endpoint
   * @param endpoint API endpoint to clear cache for
   *
   * @example
   * ```typescript
   * this.apiService.clearCacheForEndpoint('/users');
   * ```
   */
  clearCacheForEndpoint(endpoint: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(endpoint)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  /**
   * Check if any API request is currently loading
   * @returns True if any request is in progress
   *
   * @example
   * ```typescript
   * if (this.apiService.isLoading()) {
   *   console.log('Request in progress...');
   * }
   * ```
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // =====================================
  // BATCH OPERATIONS
  // =====================================

  /**
   * Execute multiple GET requests in parallel
   * @param endpoints Array of API endpoints
   * @param options Request configuration options
   * @returns Observable with array of responses
   *
   * @example
   * ```typescript
   * this.apiService.batchGet(['/users/1', '/users/2', '/users/3'])
   *   .subscribe(responses => {
   *     console.log('All users:', responses);
   *   });
   * ```
   */
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

  // =====================================
  // REAL-TIME COMMUNICATION (FUTURE)
  // =====================================

  /**
   * Connect to WebSocket endpoint (placeholder for future implementation)
   * @param endpoint WebSocket endpoint
   * @returns Observable for WebSocket messages
   */
  connectWebSocket(endpoint: string): Observable<any> {
    // Placeholder for WebSocket implementation
    return new Observable();
  }

  /**
   * Connect to Server-Sent Events endpoint (placeholder for future implementation)
   * @param endpoint SSE endpoint
   * @returns Observable for SSE messages
   */
  connectSSE(endpoint: string): Observable<any> {
    // Placeholder for Server-Sent Events implementation
    return new Observable();
  }

  // =====================================
  // CONVENIENCE METHODS (PROMISE-BASED)
  // =====================================

  /**
   * Simplified GET request returning Promise
   * @param url API endpoint
   * @param params Query parameters
   * @param options Request configuration
   * @returns Promise resolving to response data
   *
   * @example
   * ```typescript
   * const users = await this.apiService.callGetAPI('/users', { page: 1 });
   * ```
   */
  callGetAPI<T = any>(
    url: string,
    params: Record<string, any> = {},
    options: ApiOptions = {}
  ): Promise<T> {
    return this.get<T>(url, { ...options, params }).toPromise() as Promise<T>;
  }

  /**
   * Simplified POST request returning Promise
   * @param url API endpoint
   * @param data Request payload
   * @param options Request configuration
   * @returns Promise resolving to response data
   */
  callPostAPI<T = any>(
    url: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<T> {
    return this.post<T>(url, data, options).toPromise() as Promise<T>;
  }

  /**
   * Simplified PUT request returning Promise
   * @param url API endpoint
   * @param data Request payload
   * @param options Request configuration
   * @returns Promise resolving to response data
   */
  callPutApi<T = any>(
    url: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<T> {
    return this.put<T>(url, data, options).toPromise() as Promise<T>;
  }

  /**
   * Simplified PATCH request returning Promise
   * @param url API endpoint
   * @param data Request payload
   * @param options Request configuration
   * @returns Promise resolving to response data
   */
  callPatchApi<T = any>(
    url: string,
    data: any,
    options: ApiOptions = {}
  ): Promise<T> {
    return this.patch<T>(url, data, options).toPromise() as Promise<T>;
  }

  /**
   * Simplified DELETE request returning Promise
   * @param url API endpoint
   * @param options Request configuration
   * @returns Promise resolving to response data
   */
  callDeleteApi<T = any>(
    url: string,
    options: ApiOptions = {}
  ): Promise<T> {
    return this.delete<T>(url, options).toPromise() as Promise<T>;
  }

  /**
   * Download file with automatic handling
   * @param url API endpoint for file download
   * @param params Query parameters
   * @param fileName Optional filename for download
   * @returns Promise that resolves when download is initiated
   *
   * @example
   * ```typescript
   * await this.apiService.downloadFile('/files/123', {}, 'document.pdf');
   * ```
   */
  downloadFile(
    url: string,
    params: Record<string, any> = {},
    fileName?: string
  ): Promise<void> {
    return this.get(url, {
      params,
      headers: { 'Accept': 'application/octet-stream' }
    }).toPromise().then(blob => {
      if (blob) {
        const downloadUrl = window.URL.createObjectURL(blob as Blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }
    }) as Promise<void>;
  }
}