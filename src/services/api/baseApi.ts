import { toast } from '../../stores/notificationStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: 'Network response was not ok',
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.message || errorData.error || error.message;
        error.code = errorData.code;
      } catch {
        // If error response is not JSON, use status text
        error.message = response.statusText || error.message;
      }

      throw error;
    }

    // Handle empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof Error) {
      const apiError = error as ApiError;
      
      // Only show toast for user-facing errors
      if (apiError.status && apiError.status >= 400) {
        if (apiError.status === 401) {
          toast.error('Authentication Required', 'Please log in to continue');
        } else if (apiError.status === 403) {
          toast.error('Access Denied', 'You do not have permission to perform this action');
        } else if (apiError.status === 404) {
          toast.error('Not Found', 'The requested resource was not found');
        } else if (apiError.status >= 500) {
          toast.error('Server Error', 'Something went wrong on our end. Please try again later');
        } else {
          toast.error('Error', apiError.message);
        }
      }
    }
  }
}

// Default API client instance
export const apiClient = new ApiClient();