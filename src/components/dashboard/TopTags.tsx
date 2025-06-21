import { Tag, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TagData {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopTagsProps {
  tags: TagData[];
}

export default function TopTags({ tags }: TopTagsProps) {
  const getTrendIcon = (trend: TagData['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="w-3 h-3 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTrendColor = (trend: TagData['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
      'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
      'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
      'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
      'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Tag className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
        Top Tags
      </h3>
      
      {tags.length === 0 ? (
        <div className="text-center py-8">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No tags yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tags.map((tag, index) => (
            <div key={tag.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTagColor(index)}`}>
                    #{tag.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {tag.count} {tag.count === 1 ? 'memory' : 'memories'}
                  </span>
                </div>
              </div>
              <div className={`flex items-center ${getTrendColor(tag.trend)}`}>
                {getTrendIcon(tag.trend)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {tags.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View all tags
          </button>
        </div>
      )}
    </div>
  );
}