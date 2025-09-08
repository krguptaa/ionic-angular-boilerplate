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
        this.toastService.showError('Access denied. You do not have permission to perform this action.');
        break;
      case HTTP_STATUS.NOT_FOUND:
        this.toastService.showError('The requested resource was not found.');
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        this.toastService.showError('Server error. Please try again later.');
        break;
      case 0:
        // Network error
        this.toastService.showError('Network connection failed. Please check your internet connection.');
        break;
      default:
        // Generic error handling
        if (error.status >= 400 && error.status < 500) {
          this.toastService.showError('Request failed. Please check your input and try again.');
        } else if (error.status >= 500) {
          this.toastService.showError('Server error. Please try again later.');
        }
    }

    return throwError(() => error);
  }
}