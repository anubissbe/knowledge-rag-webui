import { useState, useEffect } from 'react';
import {
  BarChart3, Brain, Search, Tag,
  FileText, Zap
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import MemoryChart from '../components/dashboard/MemoryChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import TopTags from '../components/dashboard/TopTags';
import SearchInsights from '../components/dashboard/SearchInsights';
import UsageMetrics from '../components/dashboard/UsageMetrics';
import { analyticsApi } from '../services/api';
import { useToast } from '../hooks/useToast';

interface DashboardStats {
  totalMemories: number;
  totalCollections: number;
  totalTags: number;
  memoriesThisWeek: number;
  memoriesThisMonth: number;
  averageMemoryLength: number;
  searchCount: number;
  recentActivity: Array<{
    id: string;
    type: 'created' | 'updated' | 'searched' | 'exported';
    title: string;
    timestamp: string;
  }>;
  memoryGrowth: Array<{
    date: string;
    count: number;
  }>;
  topTags: Array<{
    name: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  searchPatterns: Array<{
    query: string;
    count: number;
    lastUsed: string;
  }>;
}

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Fetch all analytics data in parallel
        const [statsData, recentActivity, searchPatterns, memoryGrowth, tagDistribution] = await Promise.all([
          analyticsApi.getDashboardStats(),
          analyticsApi.getRecentActivity(10),
          analyticsApi.getSearchPatterns(7),
          analyticsApi.getMemoryGrowth(30),
          analyticsApi.getTagDistribution(10)
        ]);

        // Transform data to match component expectations
        const topTags = tagDistribution.map(tag => ({
          name: tag.tag,
          count: tag.count,
          trend: 'stable' as const // API should provide trend data
        }));

        // Calculate additional stats from the data
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Count memories from growth data
        const memoriesThisWeek = memoryGrowth
          .filter(item => new Date(item.date) > weekAgo)
          .reduce((sum, item) => sum + item.count, 0);

        const memoriesThisMonth = memoryGrowth
          .filter(item => new Date(item.date) > monthAgo)
          .reduce((sum, item) => sum + item.count, 0);

        // Use averageMemoryLength from API response
        const averageMemoryLength = statsData.averageMemoryLength;

        setStats({
          totalMemories: statsData.totalMemories,
          totalCollections: statsData.totalCollections,
          totalTags: statsData.totalTags,
          memoriesThisWeek,
          memoriesThisMonth,
          averageMemoryLength,
          searchCount: statsData.searchCount,
          recentActivity: recentActivity.map(activity => ({
            id: activity.timestamp, // Use timestamp as ID if not provided
            type: activity.type === 'memory_created' ? 'created' :
                  activity.type === 'memory_updated' ? 'updated' :
                  activity.type === 'search' ? 'searched' : 'exported',
            title: activity.title,
            timestamp: activity.timestamp
          })),
          memoryGrowth,
          topTags,
          searchPatterns: searchPatterns.map(pattern => ({
            query: pattern.query,
            count: pattern.count,
            lastUsed: pattern.lastSearched
          }))
        });
      } catch (error) {
        toast.error('Failed to load analytics', 'Please try refreshing the page');
        // Set some default values to prevent empty state
        setStats({
          totalMemories: 0,
          totalCollections: 0,
          totalTags: 0,
          memoriesThisWeek: 0,
          memoriesThisMonth: 0,
          averageMemoryLength: 0,
          searchCount: 0,
          recentActivity: [],
          memoryGrowth: [],
          topTags: [],
          searchPatterns: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
              Dashboard
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Overview of your knowledge management analytics
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              aria-label="Select time range for analytics"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Memories"
            value={stats.totalMemories}
            icon={Brain}
            trend={stats.memoriesThisMonth > 0 ? 'up' : 'stable'}
            trendValue={`+${stats.memoriesThisMonth} this month`}
            color="blue"
          />
          <StatsCard
            title="Collections"
            value={stats.totalCollections}
            icon={FileText}
            trend="stable"
            trendValue="Organized"
            color="green"
          />
          <StatsCard
            title="Unique Tags"
            value={stats.totalTags}
            icon={Tag}
            trend="up"
            trendValue="Growing taxonomy"
            color="purple"
          />
          <StatsCard
            title="Searches"
            value={stats.searchCount}
            icon={Search}
            trend="up"
            trendValue="+23% vs last month"
            color="orange"
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Memory Growth Chart */}
          <div className="lg:col-span-2">
            <MemoryChart 
              data={stats.memoryGrowth}
              timeRange={timeRange}
            />
          </div>

          {/* Usage Metrics */}
          <UsageMetrics
            stats={{
              averageMemoryLength: stats.averageMemoryLength,
              memoriesThisWeek: stats.memoriesThisWeek,
              totalWords: Math.floor(stats.averageMemoryLength * stats.totalMemories / 5),
              readingTime: Math.floor(stats.averageMemoryLength * stats.totalMemories / 250)
            }}
          />
        </div>

        {/* Secondary Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Top Tags */}
          <TopTags tags={stats.topTags} />

          {/* Recent Activity */}
          <ActivityFeed activities={stats.recentActivity} />

          {/* Search Insights */}
          <SearchInsights patterns={stats.searchPatterns} />
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.memoriesThisWeek}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Memories created this week
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(stats.averageMemoryLength / 5)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average words per memory
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.topTags.length > 0 ? Math.round(stats.totalMemories / stats.topTags.length) : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Memories per tag average
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}