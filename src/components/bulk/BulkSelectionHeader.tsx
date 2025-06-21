import { CheckSquare, Square, Minus, MoreHorizontal } from 'lucide-react';

interface BulkSelectionHeaderProps {
  totalCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleAll: () => void;
  onToggleBulkMode: () => void;
  isBulkMode: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export default function BulkSelectionHeader({
  totalCount,
  selectedCount,
  isAllSelected,
  isIndeterminate,
  onToggleAll,
  onToggleBulkMode,
  isBulkMode,
  onSelectAll,
  onClearSelection
}: BulkSelectionHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Selection Controls */}
      <div className="flex items-center space-x-4">
        {isBulkMode ? (
          <>
            {/* Select All Checkbox */}
            <button
              onClick={onToggleAll}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                       hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
            >
              {isIndeterminate ? (
                <Minus className="w-5 h-5 text-blue-600" />
              ) : isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span>
                {isAllSelected 
                  ? 'Deselect all' 
                  : isIndeterminate 
                    ? `${selectedCount} of ${totalCount} selected`
                    : 'Select all'
                }
              </span>
            </button>

            {/* Quick Actions */}
            {selectedCount > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>•</span>
                <button
                  onClick={onSelectAll}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Select all {totalCount}
                </button>
                <span>•</span>
                <button
                  onClick={onClearSelection}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Clear selection
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalCount} {totalCount === 1 ? 'memory' : 'memories'}
          </div>
        )}
      </div>

      {/* Bulk Mode Toggle */}
      <div className="flex items-center space-x-2">
        {!isBulkMode && (
          <button
            onClick={onToggleBulkMode}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 
                     dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 
                     dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Select
          </button>
        )}

        {isBulkMode && (
          <button
            onClick={onToggleBulkMode}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 
                     dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 
                     dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
        )}

        {/* More Options */}
        <button
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 
                   dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 
                   dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}