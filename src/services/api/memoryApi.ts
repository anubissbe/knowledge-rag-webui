import { apiClient } from './baseApi';
import type { Memory } from '../../types';

export interface CreateMemoryInput {
  title: string;
  content: string;
  tags?: string[];
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMemoryInput {
  title?: string;
  content?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface MemoriesResponse {
  memories: Memory[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MemoryFilters {
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  search?: string;
}

class MemoryApi {
  async getMemories(
    page = 1,
    pageSize = 20,
    filters?: MemoryFilters
  ): Promise<MemoriesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters) {
      if (filters.tags?.length) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      if (filters.userId) {
        params.append('userId', filters.userId);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
    }

    return apiClient.get<MemoriesResponse>(`/api/memories?${params}`);
  }

  async getMemory(id: string): Promise<Memory> {
    return apiClient.get<Memory>(`/api/memories/${id}`);
  }

  async createMemory(input: CreateMemoryInput): Promise<Memory> {
    return apiClient.post<Memory>('/api/memories', input);
  }

  async updateMemory(id: string, input: UpdateMemoryInput): Promise<Memory> {
    return apiClient.put<Memory>(`/api/memories/${id}`, input);
  }

  async deleteMemory(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/memories/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return apiClient.post<void>('/api/memories/bulk-delete', { ids });
  }

  async getRelatedMemories(id: string, limit = 5): Promise<Memory[]> {
    const response = await apiClient.get<{ memories: Memory[] }>(
      `/api/memories/${id}/related?limit=${limit}`
    );
    return response.memories;
  }

  async addTags(id: string, tags: string[]): Promise<Memory> {
    return apiClient.post<Memory>(`/api/memories/${id}/tags`, { tags });
  }

  async removeTags(id: string, tags: string[]): Promise<Memory> {
    return apiClient.delete<Memory>(`/api/memories/${id}/tags`, {
      body: JSON.stringify({ tags }),
    });
  }

  async bulkAddTags(ids: string[], tags: string[]): Promise<void> {
    return apiClient.post<void>('/api/memories/bulk-tags', { ids, tags });
  }

  async moveToCollection(id: string, collectionId: string): Promise<Memory> {
    return apiClient.post<Memory>(`/api/memories/${id}/collection`, { collectionId });
  }

  async bulkMoveToCollection(ids: string[], collectionId: string): Promise<void> {
    return apiClient.post<void>('/api/memories/bulk-collection', { ids, collectionId });
  }
}

export const memoryApi = new MemoryApi();