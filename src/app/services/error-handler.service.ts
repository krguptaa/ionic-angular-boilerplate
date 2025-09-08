import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { HTTP_STATUS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private toastService!: ToastService;
  private authService!: AuthService;
  private router!: Router;

  constructor(private injector: Injector) {
    // Use injector to avoid circular dependencies
    setTimeout(() => {
      try {
        this.toastService = this.injector.get(ToastService);
        this.authService = this.injector.get(AuthService);
        this.router = this.injector.get(Router);
      } catch (error) {
        console.warn('Services not available in error handler:', error);
      }
    });
  }

  handleError(error: any): void {
    console.error('Global Error Handler:', error);

    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else if (error instanceof Error) {
      this.handleClientError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    console.error('HTTP Error:', error.status, error.message);

    switch (error.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        this.handleUnauthorizedError();
        break;
      case HTTP_STATUS.FORBIDDEN:
        this.showError('Access denied. You do not have permission to perform this action.');
        break;
      case HTTP_STATUS.NOT_FOUND:
        this.showError('The requested resource was not found.');
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        this.showError('Server error. Please try again later.');
        break;
      case 0:
        this.handleNetworkError();
        break;
      default:
        this.handleGenericHttpError(error);
    }
  }

  private handleUnauthorizedError(): void {
    this.showError('Your session has expired. Please log in again.');
    // Clear authentication and redirect to login
    if (this.authService) {
      this.authService.logout();
    }
    if (this.router) {
      this.router.navigate(['/auth/login']);
    }
  }

  private handleNetworkError(): void {
    this.showError('Network connection failed. Please check your internet connection and try again.');
  }

  private handleGenericHttpError(error: HttpErrorResponse): void {
    let message = 'An error occurred while processing your request.';

    if (error.error && typeof error.error === 'object') {
      if (error.error.message) {
        message = error.error.message;
      } else if (error.error.error) {
        message = error.error.error;
      }
    }

    this.showError(message);
  }

  private handleClientError(error: Error): void {
    console.error('Client Error:', error.message);

    // For client-side errors, we typically don't show user-facing messages
    // unless it's a critical error that affects user experience
    if (error.message.includes('Loading chunk')) {
      this.showError('The application needs to be refreshed. Please reload the page.');
    }
  }

  private handleUnknownError(error: any): void {
    console.error('Unknown error:', error);
    this.showError('An unexpected error occurred. Please try again.');
  }

  private showError(message: string): void {
    if (this.toastService) {
      this.toastService.showError(message);
    } else {
      // Fallback if toast service is not available
      console.error('Error (Toast not available):', message);
    }
  }

  // Additional utility methods for specific error scenarios

  /**
   * Handle validation errors from forms
   */
  handleValidationError(errors: Record<string, string>): void {
    const messages = Object.values(errors);
    if (messages.length > 0) {
      this.showError(messages[0]); // Show first error
    }
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(message?: string): void {
    const defaultMessage = 'Authentication failed. Please check your credentials.';
    this.showError(message || defaultMessage);
  }

  /**
   * Handle server errors with retry option
   */
  handleServerError(retryCallback?: () => void): void {
    const message = 'Server error occurred. Please try again.';
    this.showError(message);

    if (retryCallback) {
      // Could implement retry logic here
      setTimeout(() => retryCallback(), 2000);
    }
  }
}