import { FileText, Clock, Calendar, TrendingUp } from 'lucide-react';

interface UsageStats {
  averageMemoryLength: number;
  memoriesThisWeek: number;
  totalWords: number;
  readingTime: number;
}

interface UsageMetricsProps {
  stats: UsageStats;
}

export default function UsageMetrics({ stats }: UsageMetricsProps) {
  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const metrics = [
    {
      title: 'Avg Memory Length',
      value: `${Math.round(stats.averageMemoryLength / 5)} words`,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'This Week',
      value: `${stats.memoriesThisWeek} memories`,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Total Content',
      value: `${Math.round(stats.totalWords / 1000)}k words`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Reading Time',
      value: formatReadingTime(stats.readingTime),
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
        Usage Metrics
      </h3>
      
      <div className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${metric.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.title}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicators */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Weekly Goal</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {stats.memoriesThisWeek}/5
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((stats.memoriesThisWeek / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Content Growth</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {Math.round((stats.totalWords / 10000) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((stats.totalWords / 10000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}