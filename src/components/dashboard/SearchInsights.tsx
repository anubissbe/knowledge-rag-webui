import { Search } from 'lucide-react';

interface SearchPattern {
  query: string;
  count: number;
  lastUsed: string;
}

interface SearchInsightsProps {
  patterns: SearchPattern[];
}

export default function SearchInsights({ patterns }: SearchInsightsProps) {
  const formatLastUsed = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPopularityColor = (count: number, maxCount: number) => {
    const percentage = count / maxCount;
    if (percentage > 0.8) return 'bg-green-500';
    if (percentage > 0.6) return 'bg-blue-500';
    if (percentage > 0.4) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const maxCount = Math.max(...patterns.map(p => p.count), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
        Search Insights
      </h3>
      
      {patterns.length === 0 ? (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No search history yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <div key={pattern.query} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white truncate">
                    {pattern.query}
                  </code>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {pattern.count} searches
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatLastUsed(pattern.lastUsed)}
                </span>
              </div>
              
              {/* Popularity bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${getPopularityColor(pattern.count, maxCount)}`}
                  style={{ width: `${(pattern.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {patterns.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total searches: {patterns.reduce((sum, p) => sum + p.count, 0)}
            </span>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View search analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}