// Error Utilities
export class ErrorUtils {
  static createError(message: string, code?: string, statusCode?: number): Error {
    const error = new Error(message);
    if (code) (error as any).code = code;
    if (statusCode) (error as any).statusCode = statusCode;
    return error;
  }

  static createValidationError(message: string, field?: string): Error {
    const error = this.createError(message, 'VALIDATION_ERROR', 400);
    if (field) (error as any).field = field;
    return error;
  }

  static createAuthenticationError(message: string = 'Authentication required'): Error {
    return this.createError(message, 'AUTHENTICATION_ERROR', 401);
  }

  static createAuthorizationError(message: string = 'Access denied'): Error {
    return this.createError(message, 'AUTHORIZATION_ERROR', 403);
  }

  static createNotFoundError(message: string = 'Resource not found'): Error {
    return this.createError(message, 'NOT_FOUND_ERROR', 404);
  }

  static createConflictError(message: string = 'Resource conflict'): Error {
    return this.createError(message, 'CONFLICT_ERROR', 409);
  }

  static createInternalServerError(message: string = 'Internal server error'): Error {
    return this.createError(message, 'INTERNAL_SERVER_ERROR', 500);
  }

  static parseError(error: any): {
    message: string;
    code?: string;
    statusCode?: number;
    stack?: string;
    details?: any;
  } {
    return {
      message: error?.message || 'Unknown error',
      code: error?.code,
      statusCode: error?.statusCode,
      stack: error?.stack,
      details: error?.details
    };
  }

  static logError(error: any, context?: string): void {
    const parsedError = this.parseError(error);
    const timestamp = new Date().toISOString();

    console.error(`[${timestamp}] Error${context ? ` in ${context}` : ''}:`, {
      message: parsedError.message,
      code: parsedError.code,
      statusCode: parsedError.statusCode,
      stack: parsedError.stack
    });
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' ||
           error?.name === 'NetworkError' ||
           error?.message?.includes('fetch');
  }

  static isTimeoutError(error: any): boolean {
    return error?.code === 'TIMEOUT_ERROR' ||
           error?.name === 'TimeoutError' ||
           error?.message?.includes('timeout');
  }

  static isValidationError(error: any): boolean {
    return error?.code === 'VALIDATION_ERROR' ||
           error?.statusCode === 400;
  }

  static isAuthenticationError(error: any): boolean {
    return error?.code === 'AUTHENTICATION_ERROR' ||
           error?.statusCode === 401;
  }

  static isAuthorizationError(error: any): boolean {
    return error?.code === 'AUTHORIZATION_ERROR' ||
           error?.statusCode === 403;
  }

  static isNotFoundError(error: any): boolean {
    return error?.code === 'NOT_FOUND_ERROR' ||
           error?.statusCode === 404;
  }

  static getErrorMessage(error: any, fallback: string = 'An error occurred'): string {
    return error?.message || fallback;
  }

  static createRetryableError(originalError: any, retryCount: number): Error {
    const error = this.createError(
      `Operation failed after ${retryCount} retries: ${this.getErrorMessage(originalError)}`,
      'RETRY_ERROR'
    );
    (error as any).originalError = originalError;
    (error as any).retryCount = retryCount;
    return error;
  }

  static wrapError(error: any, wrapperMessage: string): Error {
    const wrappedError = this.createError(wrapperMessage);
    (wrappedError as any).originalError = error;
    wrappedError.stack = `${wrappedError.stack}\nCaused by: ${error?.stack || error}`;
    return wrappedError;
  }
}