import { Tag, Hash, Calendar } from 'lucide-react';

interface SearchStatsProps {
  facets: {
    tags: Record<string, number>;
    entities: Record<string, number>;
    collections: Record<string, number>;
    dateRanges: Record<string, number>;
  };
  totalCount: number;
  filters: {
    tags: string[];
    entities: string[];
    collections: string[];
    dateRange: string;
    contentType: string;
    sortBy: 'relevance' | 'date' | 'title';
  };
  onFilterChange: (key: string, value: string | string[]) => void;
}

export default function SearchStats({ facets, totalCount, filters, onFilterChange }: SearchStatsProps) {
  // Get top tags
  const topTags = Object.entries(facets.tags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Transform entities from facets if available
  const entities = facets.entities 
    ? Object.entries(facets.entities)
        .map(([name, count]) => ({
          name,
          type: 'concept',
          count: count as number,
          icon: Hash
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Search Summary
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Results</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{totalCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Unique Tags</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Object.keys(facets.tags).length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Collections</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Object.keys(facets.collections).length || 3}
            </span>
          </div>
        </div>
      </div>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Tag className="w-5 h-5 mr-2" />
            Top Tags
          </h3>
          
          <div className="space-y-2">
            {topTags.map(([tag, count]) => {
              const isActive = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onFilterChange('tags', tag)}
                  className={`
                    w-full flex items-center justify-between p-2 rounded-lg
                    transition-colors text-left
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-sm font-medium">{tag}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Entities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <Hash className="w-5 h-5 mr-2" />
          Related Entities
        </h3>
        
        <div className="space-y-2">
          {entities.map((entity) => {
            const Icon = entity.icon;
            return (
              <div
                key={entity.name}
                className="flex items-center justify-between p-2 rounded-lg
                         hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {entity.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {entity.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <Calendar className="w-5 h-5 mr-2" />
          Date Distribution
        </h3>
        
        <div className="space-y-2">
          {Object.entries(facets.dateRanges).map(([range, count]) => (
            <div key={range} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{range}</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}