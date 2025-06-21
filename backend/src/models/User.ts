export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  passwordHash?: string; // Not sent to client
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
  apiKeys?: ApiKey[]; // Not sent to client
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
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
}

export interface ApiKey {
  id: string;
  name: string;
  key: string; // Hashed version
  lastUsed?: string;
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}