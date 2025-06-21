import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api/authApi';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      showEmail: boolean;
      showActivity: boolean;
    };
    search?: {
      filters: {
        tags: string[];
        entities: string[];
        collections: string[];
        dateRange: string;
        contentType: string;
        sortBy: 'relevance' | 'date' | 'title';
      };
      savedAt: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authApi.getCurrentUser(storedToken);
            setUser(currentUser);
            logger.info('Auth initialized with stored credentials');
          } catch (error) {
            // Token is invalid, clear stored data
            logger.warn('Stored token is invalid, clearing auth data');
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        logger.error('Failed to initialize auth');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      setUser(response.user);
      setToken(response.token);
      
      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      logger.info(`User logged in successfully: ${response.user.username}`);
    } catch (error) {
      logger.error(`Login failed for ${credentials.email}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(credentials);
      
      setUser(response.user);
      setToken(response.token);
      
      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      logger.info(`User registered successfully: ${response.user.username}`);
    } catch (error) {
      logger.error(`Registration failed for ${credentials.email}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    logger.info('User logged out');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}