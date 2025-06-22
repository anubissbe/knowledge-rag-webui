import { apiClient } from './baseApi';

export interface MemoryVersion {
  id: string;
  memoryId: string;
  version: number;
  title: string;
  content: string;
  contentType: 'text' | 'markdown' | 'code' | 'link';
  summary?: string;
  tags: string[];
  metadata: MemoryVersionMetadata;
  changeType: 'created' | 'updated' | 'restored';
  changeDescription?: string;
  userId: string;
  createdAt: string;
  createdBy: string;
}

export interface MemoryVersionMetadata {
  source?: string;
  author?: string;
  url?: string;
  wordCount: number;
  readingTime: number;
  language: string;
  changedFields: string[];
  previousVersion?: number;
  [key: string]: any;
}

export interface MemoryVersionSummary {
  id: string;
  version: number;
  changeType: 'created' | 'updated' | 'restored';
  changeDescription?: string;
  createdAt: string;
  createdBy: string;
  changedFields: string[];
}

export interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

export interface MemoryVersionComparison {
  memoryId: string;
  fromVersion: number;
  toVersion: number;
  differences: VersionDiff[];
  summary: {
    totalChanges: number;
    fieldsChanged: string[];
    addedContent: number;
    removedContent: number;
  };
}

export interface VersionsResponse {
  versions: MemoryVersionSummary[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface RestoreResponse {
  message: string;
  memory: any;
  restoredFromVersion: number;
}

export const memoryVersionsApi = {
  // Get memory version history
  async getMemoryVersions(memoryId: string, options?: { limit?: number; offset?: number }): Promise<VersionsResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    return await apiClient.get<VersionsResponse>(`/memories/${memoryId}/versions?${params}`);
  },

  // Get specific memory version
  async getMemoryVersion(memoryId: string, version: number): Promise<MemoryVersion> {
    return await apiClient.get<MemoryVersion>(`/memories/${memoryId}/versions/${version}`);
  },

  // Compare two memory versions
  async compareVersions(memoryId: string, fromVersion: number, toVersion: number): Promise<MemoryVersionComparison> {
    return await apiClient.get<MemoryVersionComparison>(
      `/memories/${memoryId}/versions/${fromVersion}/compare/${toVersion}`
    );
  },

  // Restore memory to specific version
  async restoreVersion(memoryId: string, version: number, changeDescription?: string): Promise<RestoreResponse> {
    return await apiClient.post<RestoreResponse>(
      `/memories/${memoryId}/versions/${version}/restore`,
      { changeDescription }
    );
  },
};