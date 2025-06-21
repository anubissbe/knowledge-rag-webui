import { apiClient } from './baseApi';

export interface DashboardStats {
  totalMemories: number;
  totalCollections: number;
  totalTags: number;
  searchCount: number;
  lastUpdated: string;
}

export interface ActivityItem {
  type: 'memory_created' | 'memory_updated' | 'memory_deleted' | 'search' | 'collection_created';
  title: string;
  timestamp: string;
  details?: string;
}

export interface SearchPattern {
  query: string;
  count: number;
  lastSearched: string;
}

export interface MemoryGrowth {
  date: string;
  count: number;
}

export interface TagDistribution {
  tag: string;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  searchPatterns: SearchPattern[];
  memoryGrowth: MemoryGrowth[];
  tagDistribution: TagDistribution[];
}

class AnalyticsApi {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/api/analytics/stats');
  }

  async getRecentActivity(limit = 10): Promise<ActivityItem[]> {
    const response = await apiClient.get<{ activities: ActivityItem[] }>(
      `/api/analytics/activity?limit=${limit}`
    );
    return response.activities;
  }

  async getSearchPatterns(days = 7): Promise<SearchPattern[]> {
    const response = await apiClient.get<{ patterns: SearchPattern[] }>(
      `/api/analytics/search-patterns?days=${days}`
    );
    return response.patterns;
  }

  async getMemoryGrowth(days = 30): Promise<MemoryGrowth[]> {
    const response = await apiClient.get<{ growth: MemoryGrowth[] }>(
      `/api/analytics/memory-growth?days=${days}`
    );
    return response.growth;
  }

  async getTagDistribution(limit = 10): Promise<TagDistribution[]> {
    const response = await apiClient.get<{ distribution: TagDistribution[] }>(
      `/api/analytics/tag-distribution?limit=${limit}`
    );
    return response.distribution;
  }

  async getFullAnalytics(): Promise<AnalyticsData> {
    return apiClient.get<AnalyticsData>('/api/analytics/full');
  }
}

export const analyticsApi = new AnalyticsApi();