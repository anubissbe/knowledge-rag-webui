import { Tag, Calendar, FileText, Folder } from 'lucide-react';

interface SearchFilters {
  tags: string[];
  entities: string[];
  collections: string[];
  dateRange: string;
  contentType: string;
  sortBy: 'relevance' | 'date' | 'title';
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  facets: {
    tags: Record<string, number>;
    entities: Record<string, number>;
    collections: Record<string, number>;
    dateRanges: Record<string, number>;
  };
}

export default function SearchFilters({ filters, onFiltersChange, facets }: SearchFiltersProps) {
  const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange('tags', newTags);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Tags Filter */}
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-3">
              <Tag className="w-4 h-4 mr-2" />
              Tags
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(facets.tags).map(([tag, count]) => (
                <label key={tag} className="flex items-center cursor-pointer py-1 touch-manipulation">
                  <input
                    type="checkbox"
                    checked={filters.tags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 touch-manipulation"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {tag}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </h3>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       min-h-[44px] touch-manipulation"
            >
              <option value="">All time</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="3months">Last 3 months</option>
              <option value="1year">Last year</option>
            </select>
          </div>

          {/* Content Type Filter */}
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-3">
              <FileText className="w-4 h-4 mr-2" />
              Content Type
            </h3>
            <select
              value={filters.contentType}
              onChange={(e) => handleFilterChange('contentType', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       min-h-[44px] touch-manipulation"
            >
              <option value="">All types</option>
              <option value="text">Text</option>
              <option value="markdown">Markdown</option>
              <option value="code">Code</option>
            </select>
          </div>

          {/* Collections Filter */}
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-3">
              <Folder className="w-4 h-4 mr-2" />
              Collections
            </h3>
            <select
              value={filters.collections[0] || ''}
              onChange={(e) => handleFilterChange('collections', e.target.value ? [e.target.value] : [])}
              className="w-full px-3 py-3 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 
                       rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       min-h-[44px] touch-manipulation"
            >
              <option value="">All collections</option>
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="research">Research</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}