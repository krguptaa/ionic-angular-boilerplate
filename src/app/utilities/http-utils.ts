// HTTP Utilities
export class HttpUtils {
  static buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, String(item)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    }

    return queryParams.toString();
  }

  static parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(queryString);

    // Use forEach for better browser compatibility
    urlParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  static buildUrl(baseUrl: string, path: string = '', params?: Record<string, any>): string {
    const url = new URL(path, baseUrl);

    if (params) {
      const queryString = this.buildQueryString(params);
      if (queryString) {
        url.search = queryString;
      }
    }

    return url.toString();
  }

  static getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
      'json': 'application/json',
      'xml': 'application/xml',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'csv': 'text/csv'
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  static isSuccessStatus(status: number): boolean {
    return status >= 200 && status < 300;
  }

  static isClientError(status: number): boolean {
    return status >= 400 && status < 500;
  }

  static isServerError(status: number): boolean {
    return status >= 500;
  }

  static createHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    };
  }

  static parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('text/')) {
      return response.text() as Promise<T>;
    }

    return response.blob() as Promise<T>;
  }

  static handleHttpError(response: Response): never {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).response = response;
    throw error;
  }

  static createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, String(item)));
        } else if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    }

    return formData;
  }
}