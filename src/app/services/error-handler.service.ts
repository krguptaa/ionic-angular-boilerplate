import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {

  constructor() {}

  handleError(error: any): void {
    // Simple error logging without service dependencies to avoid circular dependencies
    console.error('Global Error Handler:', error);

    // For now, just log the error without trying to show toasts or navigate
    // This prevents circular dependency issues
    if (error instanceof HttpErrorResponse) {
      console.error('HTTP Error:', error.status, error.message);
    } else if (error instanceof Error) {
      console.error('Client Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }

  // Removed methods that were causing circular dependencies
  // Error handling is now simplified to just logging
}