import { apiClient } from './baseApi';
import type { LoginCredentials, RegisterCredentials, User } from '../../contexts/AuthContext';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

class AuthApi {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/v1/auth/login', credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/v1/auth/register', credentials);
  }

  async getCurrentUser(token: string): Promise<User> {
    return await apiClient.get<User>('/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    return await apiClient.post<{ token: string }>('/v1/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (error) {
      // Logout can fail silently if server is unavailable
      console.warn('Logout request failed, proceeding with local logout');
    }
  }
}

export const authApi = new AuthApi();