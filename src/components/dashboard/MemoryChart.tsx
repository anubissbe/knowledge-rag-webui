import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MemoryChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  timeRange: '7d' | '30d' | '90d' | '1y';
}

export default function MemoryChart({ data, timeRange }: MemoryChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeRange === '30d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  const growth = data.length > 1 ? data[data.length - 1].count - data[0].count : 0;
  const growthPercent = data.length > 1 && data[0].count > 0 
    ? Math.round((growth / data[0].count) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Memory Growth
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total memories over time
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              +{growth} ({growthPercent > 0 ? '+' : ''}{growthPercent}%)
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            vs previous period
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-200 dark:stroke-gray-700" 
            />
            <XAxis 
              dataKey="date"
              tickFormatter={formatDate}
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(label).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {payload[0].value} memories
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#memoryGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}