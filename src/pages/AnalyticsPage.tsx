import { useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  FileText, 
  Hash, 
  Calendar,
  Activity,
  PieChart,
  Database,
  HardDrive,
  Zap
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { useMemoryStore } from '../stores/memoryStore';
import { useCollectionStore } from '../stores/collectionStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';


const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function AnalyticsPage() {
  const { memories } = useMemoryStore();
  const { collections } = useCollectionStore();
  const { stats, loading, timeRange, fetchStats, setTimeRange, calculateLocalStats } = useAnalyticsStore();

  useEffect(() => {
    // Initial fetch
    fetchStats();
  }, []);

  useEffect(() => {
    // Update local stats when data changes
    if (memories.length > 0 || collections.length > 0) {
      calculateLocalStats(memories, collections);
    }
  }, [timeRange, memories, collections, calculateLocalStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Analytics Dashboard
        </h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'week' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'month' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'year' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Memories</p>
              <p className="text-2xl font-bold">{stats.totalMemories}</p>
              <p className="text-xs text-green-600">+{stats.memoriesThisWeek} this week</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Collections</p>
              <p className="text-2xl font-bold">{stats.totalCollections}</p>
              <p className="text-xs text-gray-600">Organized memories</p>
            </div>
            <Database className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tags</p>
              <p className="text-2xl font-bold">{stats.totalTags}</p>
              <p className="text-xs text-gray-600">Unique tags</p>
            </div>
            <Hash className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Entities</p>
              <p className="text-2xl font-bold">{stats.totalEntities}</p>
              <p className="text-xs text-gray-600">Extracted entities</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Growth Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Memory Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.memoryGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Collection Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Collection Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={stats.collectionDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.collectionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Tags */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Most Used Tags</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.mostUsedTags}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Entity Types */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Entity Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.entityTypes} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="type" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Memories this month</span>
              <span className="font-semibold">{stats.memoriesThisMonth}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Average memory length</span>
              <span className="font-semibold">{stats.averageMemoryLength} chars</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Most active day</span>
              <span className="font-semibold">Tuesday</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Peak hour</span>
              <span className="font-semibold">2:00 PM</span>
            </div>
          </div>
        </Card>

        {/* Popular Searches */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
          <div className="space-y-2">
            {stats.searchQueries.map((query, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm">{query.query}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{query.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Memory Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">With images</span>
              <span className="font-semibold">23%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">With links</span>
              <span className="font-semibold">45%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">With code</span>
              <span className="font-semibold">18%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Shared</span>
              <span className="font-semibold">12%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Storage and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Usage */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Used Space</span>
                <span>{formatBytes(stats.storageUsage.used)} / {formatBytes(stats.storageUsage.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.storageUsage.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.storageUsage.percentage}% used</p>
            </div>
            
            <div className="space-y-2 pt-2">
              {stats.memoryTypes.map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{type.type}</span>
                  </div>
                  <span className="text-sm text-gray-600">{type.count} ({type.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">98%</p>
                <p className="text-xs text-gray-600">Search Success Rate</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">87ms</p>
                <p className="text-xs text-gray-600">Avg Response Time</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">API Calls Today</span>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Cache Hit Rate</span>
                <span className="font-semibold">76%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Active Sessions</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Uptime</span>
                <span className="font-semibold">99.9%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}