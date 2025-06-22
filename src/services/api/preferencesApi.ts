import { apiClient } from './baseApi';

export interface SearchFilters {
  tags: string[];
  entities: string[];
  collections: string[];
  dateRange: string;
  contentType: string;
  sortBy: 'relevance' | 'date' | 'title';
}

export interface SearchPreferences {
  filters: SearchFilters;
  savedAt: string;
}

export interface PreferencesResponse {
  preferences: SearchPreferences | null;
}

export const preferencesApi = {
  // Get search preferences
  async getSearchPreferences(): Promise<SearchPreferences | null> {
    const response = await apiClient.get<PreferencesResponse>('/preferences/search');
    return response.preferences;
  },

  // Save search preferences
  async saveSearchPreferences(filters: SearchFilters): Promise<SearchPreferences> {
    const response = await apiClient.put<{ preferences: SearchPreferences }>('/preferences/search', {
      filters
    });
    return response.preferences;
  }
};