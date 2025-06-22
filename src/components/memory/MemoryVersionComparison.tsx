import { X, Plus, Minus, Edit3, ArrowRight } from 'lucide-react';
import { type MemoryVersionComparison, type VersionDiff } from '../../services/api/memoryVersionsApi';

interface MemoryVersionComparisonProps {
  comparison: MemoryVersionComparison;
  onClose: () => void;
}

export default function MemoryVersionComparison({ comparison, onClose }: MemoryVersionComparisonProps) {
  const getDiffIcon = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'removed':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'modified':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getDiffBgColor = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'removed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'modified':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    }
  };

  const getDiffTextColor = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return 'text-green-700 dark:text-green-300';
      case 'removed':
        return 'text-red-700 dark:text-red-300';
      case 'modified':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const renderDiffValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">(empty)</span>;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'string' && value.length > 100) {
      return (
        <div className="space-y-2">
          <div className="max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{value}</pre>
          </div>
        </div>
      );
    }
    return String(value);
  };

  const groupedDiffs = comparison.differences.reduce((acc, diff) => {
    if (!acc[diff.field]) {
      acc[diff.field] = [];
    }
    acc[diff.field].push(diff);
    return acc;
  }, {} as Record<string, VersionDiff[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Version Comparison
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Version {comparison.fromVersion}
              </span>
              <ArrowRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Version {comparison.toVersion}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {comparison.summary.totalChanges}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Changes</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {comparison.summary.addedContent}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Added</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {comparison.summary.removedContent}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Removed</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {comparison.summary.fieldsChanged.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Fields Changed</div>
            </div>
          </div>
          
          {comparison.summary.fieldsChanged.length > 0 && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Changed fields:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {comparison.summary.fieldsChanged.map((field) => (
                  <span
                    key={field}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Differences */}
        <div className="flex-1 overflow-y-auto p-6">
          {comparison.differences.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No differences found between these versions
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedDiffs).map(([field, diffs]) => (
                <div key={field} className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {field}
                  </h4>
                  
                  {diffs.map((diff, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${getDiffBgColor(diff.changeType)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getDiffIcon(diff.changeType)}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${getDiffTextColor(diff.changeType)} capitalize`}>
                            {diff.changeType} {field}
                          </div>
                          
                          {diff.changeType === 'modified' ? (
                            <div className="mt-2 space-y-2">
                              <div>
                                <span className="text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wide">
                                  From (Version {comparison.fromVersion}):
                                </span>
                                <div className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
                                  {renderDiffValue(diff.oldValue)}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                                  To (Version {comparison.toVersion}):
                                </span>
                                <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                                  {renderDiffValue(diff.newValue)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">
                                {renderDiffValue(diff.changeType === 'added' ? diff.newValue : diff.oldValue)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}