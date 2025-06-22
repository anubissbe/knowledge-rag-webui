export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showActivity: boolean;
  };
  dataRetention: {
    autoDelete: boolean;
    retentionDays: number;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  permissions: string[];
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'markdown';
  includeMetadata: boolean;
  includeAttachments: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  contentType: 'text' | 'markdown' | 'code';
  summary?: string;
  userId: string;
  collectionId?: string;
  tags: string[];
  entities: Entity[];
  metadata: {
    source?: string;
    url?: string;
    author?: string;
    wordCount: number;
    readingTime: number;
    language: string;
    [key: string]: unknown;
  };
  embedding?: number[];
  score?: number;
  relatedMemories?: string[];
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string;
  name: string;
  type: 'person' | 'place' | 'organization' | 'concept' | 'event' | 'other';
  description?: string;
  aliases: string[];
  properties: Record<string, unknown>;
  memoryIds: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  userId: string;
  memoryCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  memories: Memory[];
  facets: {
    tags: Record<string, number>;
    entities: Record<string, number>;
    collections: Record<string, number>;
    dateRanges: Record<string, number>;
  };
  totalCount: number;
  page: number;
  pageSize: number;
}