import { apiClient } from './baseApi';
import type { Memory } from '../../types';

export interface SearchResult {
  memories: Memory[];
  facets: {
    tags: Array<{ value: string; count: number }>;
    dates: Array<{ value: string; count: number }>;
    entities: Array<{ value: string; count: number; type: string }>;
  };
  total: number;
  page: number;
  pageSize: number;
  query: string;
  processingTime: number;
}

export interface SearchFilters {
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  entities?: string[];
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

class SearchApi {
  async search(
    query: string,
    page = 1,
    pageSize = 20,
    filters?: SearchFilters
  ): Promise<SearchResult> {
    const params = new URLSearchParams({
      q: query,
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
      if (filters.entities?.length) {
        params.append('entities', filters.entities.join(','));
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
    }

    return apiClient.get<SearchResult>(`/api/search?${params}`);
  }

  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await apiClient.get<{ suggestions: string[] }>(
      `/api/search/suggestions?${params}`
    );
    return response.suggestions;
  }

  async getSearchHistory(limit = 10): Promise<SearchHistoryItem[]> {
    const response = await apiClient.get<{ history: SearchHistoryItem[] }>(
      `/api/search/history?limit=${limit}`
    );
    return response.history;
  }

  async clearSearchHistory(): Promise<void> {
    return apiClient.delete<void>('/api/search/history');
  }

  async getPopularSearches(limit = 10): Promise<Array<{ query: string; count: number }>> {
    const response = await apiClient.get<{ searches: Array<{ query: string; count: number }> }>(
      `/api/search/popular?limit=${limit}`
    );
    return response.searches;
  }
}

export const searchApi = new SearchApi();