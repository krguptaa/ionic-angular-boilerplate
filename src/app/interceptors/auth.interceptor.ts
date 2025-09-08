import { Injectable, Injector, Inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, tap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { APP_CONSTANTS, HTTP_STATUS } from '../constants';
import { ErrorUtils } from '../utilities';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    @Inject(Injector) private injector: Injector
  ) {}

  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  private get toastService(): ToastService {
    return this.injector.get(ToastService);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();

    // Skip interceptor for auth endpoints that don't need tokens
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request).pipe(
        tap({
          next: (event) => this.logResponse(request, event, startTime),
          error: (error) => this.logError(request, error, startTime)
        })
      );
    }

    // Add authorization header with token
    return this.addAuthHeader(request).pipe(
      switchMap(authRequest => next.handle(authRequest)),
      tap({
        next: (event) => this.logResponse(request, event, startTime),
        error: (error) => this.logError(request, error, startTime)
      }),
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          return this.handleHttpError(error, request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<any>): Observable<HttpRequest<any>> {
    return new Observable(observer => {
      this.authService.getAccessToken().then(token => {
        let authRequest = request;

        if (token) {
          authRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        observer.next(authRequest);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return new Observable<HttpRequest<any>>(observer => {
        this.authService.refreshToken().then(newToken => {
          this.isRefreshing = false;

          if (newToken) {
            this.refreshTokenSubject.next(newToken);
            // Retry the original request with new token
            const retryRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            observer.next(retryRequest);
          } else {
            // Refresh failed, logout user
            this.authService.logout();
            observer.error(new HttpErrorResponse({
              status: HTTP_STATUS.UNAUTHORIZED,
              statusText: 'Token refresh failed'
            }));
          }
          observer.complete();
        }).catch(error => {
          this.isRefreshing = false;
          this.authService.logout();
          observer.error(error);
        });
      }).pipe(
        switchMap(req => next.handle(req))
      );
    } else {
      // If refresh is in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          const retryRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(retryRequest);
        })
      );
    }
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      `${APP_CONSTANTS.API_BASE_URL}/auth/login`,
      `${APP_CONSTANTS.API_BASE_URL}/auth/register`,
      `${APP_CONSTANTS.API_BASE_URL}/auth/refresh`,
      `${APP_CONSTANTS.API_BASE_URL}/auth/forgot-password`,
      `${APP_CONSTANTS.API_BASE_URL}/auth/reset-password`
    ];

    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private logResponse(request: HttpRequest<any>, event: any, startTime: number): void {
    const duration = Date.now() - startTime;
    if (event.type === 4) { // HttpResponse
      console.log(`API Response: ${request.method} ${request.url} - ${event.status} (${duration}ms)`);
    }
  }

  private logError(request: HttpRequest<any>, error: any, startTime: number): void {
    const duration = Date.now() - startTime;
    console.error(`API Error: ${request.method} ${request.url} - ${error.status || 'Unknown'} (${duration}ms)`, error);
  }

  private handleHttpError(error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Log the error
    ErrorUtils.logError(error, 'HTTP Interceptor');

    // Handle specific error types
    switch (error.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return this.handle401Error(request, next);
      case HTTP_STATUS.FORBIDDEN:
        this.handleForbiddenError(error);
        break;
      case HTTP_STATUS.NOT_FOUND:
        this.handleNotFoundError(error);
        break;
      case HTTP_STATUS.BAD_REQUEST:
        this.handleBadRequestError(error);
        break;
      case HTTP_STATUS.CONFLICT:
        this.handleConflictError(error);
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        this.handleServerError(error);
        break;
      case 0:
        this.handleNetworkError();
        break;
      default:
        this.handleGenericError(error);
    }

    return throwError(() => error);
  }

  private handleForbiddenError(error: HttpErrorResponse): void {
    let message = 'Access denied. You do not have permission to perform this action.';
    if (error.error?.message) {
      message = error.error.message;
    }
    this.toastService.showError(message);
  }

  private handleNotFoundError(error: HttpErrorResponse): void {
    let message = 'The requested resource was not found.';
    if (error.error?.message) {
      message = error.error.message;
    }
    this.toastService.showError(message);
  }

  private handleBadRequestError(error: HttpErrorResponse): void {
    let message = 'Invalid request. Please check your input.';

    // Handle validation errors
    if (error.error?.errors) {
      const validationErrors = error.error.errors;
      if (typeof validationErrors === 'object') {
        const firstError = Object.values(validationErrors)[0];
        if (typeof firstError === 'string') {
          message = firstError;
        }
      }
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.toastService.showError(message);
  }

  private handleConflictError(error: HttpErrorResponse): void {
    let message = 'This action conflicts with the current state.';
    if (error.error?.message) {
      message = error.error.message;
    }
    this.toastService.showError(message);
  }

  private handleServerError(error: HttpErrorResponse): void {
    let message = 'Server error. Please try again later.';
    if (error.error?.message) {
      message = error.error.message;
    }
    this.toastService.showError(message);
  }

  private handleNetworkError(): void {
    this.toastService.showError('Network connection failed. Please check your internet connection and try again.');
  }

  private handleGenericError(error: HttpErrorResponse): void {
    let message = 'An error occurred while processing your request.';

    if (error.error && typeof error.error === 'object') {
      if (error.error.message) {
        message = error.error.message;
      } else if (error.error.error) {
        message = error.error.error;
      }
    }

    // Handle different status code ranges
    if (error.status >= 400 && error.status < 500) {
      if (!message.includes('Invalid') && !message.includes('check')) {
        message = 'Request failed. Please check your input and try again.';
      }
    } else if (error.status >= 500) {
      if (!message.includes('Server')) {
        message = 'Server error. Please try again later.';
      }
    }

    this.toastService.showError(message);
  }
}