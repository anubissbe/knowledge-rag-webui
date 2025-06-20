import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { mcpAdapter } from '../services/api/mcp-adapter';
import { Memory } from '../types';

interface AnalyticsStats {
  totalMemories: number;
  totalCollections: number;
  totalTags: number;
  totalEntities: number;
  memoriesThisWeek: number;
  memoriesThisMonth: number;
  averageMemoryLength: number;
  mostUsedTags: { name: string; count: number }[];
  collectionDistribution: { name: string; value: number }[];
  memoryGrowth: { date: string; count: number }[];
  entityTypes: { type: string; count: number }[];
  searchQueries: { query: string; count: number }[];
  activityHeatmap: { hour: number; day: string; count: number }[];
  memoryTypes: { type: string; count: number; percentage: number }[];
  storageUsage: { used: number; total: number; percentage: number };
}

interface AnalyticsState {
  stats: AnalyticsStats | null;
  loading: boolean;
  error: string | null;
  timeRange: 'week' | 'month' | 'year';
  
  // Actions
  fetchStats: () => Promise<void>;
  setTimeRange: (range: 'week' | 'month' | 'year') => void;
  calculateLocalStats: (memories: Memory[], collections: any[]) => void;
  reset: () => void;
}

const initialState = {
  stats: null,
  loading: false,
  error: null,
  timeRange: 'month' as const,
};

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchStats: async () => {
        set({ loading: true, error: null });
        
        try {
          // In a real implementation, this would fetch from the server
          // For now, we'll use the calculateLocalStats method
          const mockStats: AnalyticsStats = {
            totalMemories: 0,
            totalCollections: 0,
            totalTags: 0,
            totalEntities: 0,
            memoriesThisWeek: 0,
            memoriesThisMonth: 0,
            averageMemoryLength: 0,
            mostUsedTags: [],
            collectionDistribution: [],
            memoryGrowth: [],
            entityTypes: [
              { type: 'Person', count: 45 },
              { type: 'Organization', count: 23 },
              { type: 'Location', count: 34 },
              { type: 'Project', count: 12 },
              { type: 'Concept', count: 67 }
            ],
            searchQueries: [
              { query: 'project updates', count: 23 },
              { query: 'meeting notes', count: 19 },
              { query: 'todo items', count: 15 },
              { query: 'ideas', count: 12 },
              { query: 'research', count: 10 }
            ],
            activityHeatmap: [],
            memoryTypes: [
              { type: 'Note', count: 145, percentage: 45 },
              { type: 'Document', count: 78, percentage: 24 },
              { type: 'Link', count: 56, percentage: 17 },
              { type: 'Image', count: 45, percentage: 14 }
            ],
            storageUsage: {
              used: 245 * 1024 * 1024, // 245MB
              total: 1024 * 1024 * 1024, // 1GB
              percentage: 24
            }
          };
          
          set({ stats: mockStats, loading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch analytics',
            loading: false 
          });
        }
      },

      setTimeRange: (range) => {
        set({ timeRange: range });
        get().fetchStats();
      },

      calculateLocalStats: (memories, collections) => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Calculate tag statistics
        const tagCounts = new Map<string, number>();
        let totalLength = 0;
        
        memories.forEach(memory => {
          memory.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
          totalLength += memory.content.length;
        });
        
        const mostUsedTags = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count }));
        
        // Calculate time-based stats
        const memoriesThisWeek = memories.filter(m => 
          new Date(m.created_at) > weekAgo
        ).length;
        
        const memoriesThisMonth = memories.filter(m => 
          new Date(m.created_at) > monthAgo
        ).length;
        
        // Calculate collection distribution
        const collectionDistribution = collections.map(c => ({
          name: c.name,
          value: memories.filter(m => m.collection === c.id).length
        }));
        
        // Calculate memory growth
        const memoryGrowth = calculateMemoryGrowthData(memories, get().timeRange);
        
        // Calculate activity heatmap
        const activityHeatmap = generateActivityHeatmapData(memories);
        
        // Get existing stats for data we can't calculate locally
        const existingStats = get().stats;
        
        const stats: AnalyticsStats = {
          totalMemories: memories.length,
          totalCollections: collections.length,
          totalTags: tagCounts.size,
          totalEntities: existingStats?.totalEntities || 0,
          memoriesThisWeek,
          memoriesThisMonth,
          averageMemoryLength: memories.length > 0 ? Math.round(totalLength / memories.length) : 0,
          mostUsedTags,
          collectionDistribution,
          memoryGrowth,
          entityTypes: existingStats?.entityTypes || [],
          searchQueries: existingStats?.searchQueries || [],
          activityHeatmap,
          memoryTypes: existingStats?.memoryTypes || [],
          storageUsage: existingStats?.storageUsage || { used: 0, total: 0, percentage: 0 }
        };
        
        set({ stats });
      },

      reset: () => set(initialState),
    }),
    { name: 'AnalyticsStore' }
  )
);

// Helper functions
function calculateMemoryGrowthData(memories: Memory[], range: string) {
  const now = new Date();
  const data: { [key: string]: number } = {};
  
  memories.forEach(memory => {
    const date = new Date(memory.created_at);
    let key: string;
    
    if (range === 'week') {
      // Group by day for last 7 days
      if (now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000) {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
        data[key] = (data[key] || 0) + 1;
      }
    } else if (range === 'month') {
      // Group by week for last month
      if (now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000) {
        const weekNum = Math.floor((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
        key = `Week ${4 - weekNum}`;
        data[key] = (data[key] || 0) + 1;
      }
    } else {
      // Group by month for last year
      if (now.getTime() - date.getTime() <= 365 * 24 * 60 * 60 * 1000) {
        key = date.toLocaleDateString('en-US', { month: 'short' });
        data[key] = (data[key] || 0) + 1;
      }
    }
  });
  
  return Object.entries(data).map(([date, count]) => ({ date, count }));
}

function generateActivityHeatmapData(memories: Memory[]) {
  const heatmap: { [key: string]: number } = {};
  
  memories.forEach(memory => {
    const date = new Date(memory.created_at);
    const hour = date.getHours();
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const key = `${day}-${hour}`;
    heatmap[key] = (heatmap[key] || 0) + 1;
  });
  
  const result = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let hour = 0; hour < 24; hour++) {
    for (const day of days) {
      const key = `${day}-${hour}`;
      result.push({
        hour,
        day,
        count: heatmap[key] || 0
      });
    }
  }
  
  return result;
}