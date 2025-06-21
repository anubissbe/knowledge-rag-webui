import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
    trend: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    icon: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
    trend: 'text-green-600 dark:text-green-400'
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20',
    trend: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    icon: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20',
    trend: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    icon: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
    trend: 'text-red-600 dark:text-red-400'
  }
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend = 'stable',
  trendValue,
  color = 'blue'
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trendValue && (
            <div className={`flex items-center mt-2 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].icon}`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}