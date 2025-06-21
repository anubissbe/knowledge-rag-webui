import { useState } from 'react';
import { 
  X, Download, Trash2, FolderPlus, Move, 
  Check, AlertTriangle
} from 'lucide-react';
import type { Memory } from '../../types';

interface BulkSelectionToolbarProps {
  selectedCount: number;
  selectedMemories: Memory[];
  onClearSelection: () => void;
  onBulkDelete: (memoryIds: string[]) => Promise<void>;
  onBulkExport: (memoryIds: string[], format: 'json' | 'markdown' | 'csv') => void;
  onBulkMoveToCollection: (memoryIds: string[], collectionId: string) => Promise<void>;
  onBulkAddTags: (memoryIds: string[], tags: string[]) => Promise<void>;
  className?: string;
}

export default function BulkSelectionToolbar({
  selectedCount,
  selectedMemories,
  onClearSelection,
  onBulkDelete,
  onBulkExport,
  onBulkMoveToCollection,
  onBulkAddTags,
  className = ''
}: BulkSelectionToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTags, setNewTags] = useState('');

  const selectedIds = selectedMemories.map(m => m.id);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onBulkDelete(selectedIds);
      onClearSelection();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete memories:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = (format: 'json' | 'markdown' | 'csv') => {
    onBulkExport(selectedIds, format);
    setShowExportMenu(false);
  };

  const handleMoveToCollection = (collectionId: string) => {
    onBulkMoveToCollection(selectedIds, collectionId);
    setShowCollectionMenu(false);
  };

  const handleAddTags = () => {
    if (!newTags.trim()) return;
    
    const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
    onBulkAddTags(selectedIds, tags);
    setNewTags('');
    setShowTagsMenu(false);
  };

  // Mock collections for demo
  const mockCollections = [
    { id: 'personal', name: 'Personal', color: '#3B82F6' },
    { id: 'work', name: 'Work', color: '#10B981' },
    { id: 'research', name: 'Research', color: '#8B5CF6' },
  ];

  return (
    <div className={`
      bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
      rounded-lg p-4 flex items-center justify-between shadow-sm
      ${className}
    `}>
      {/* Selection Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} {selectedCount === 1 ? 'memory' : 'memories'} selected
          </span>
        </div>
        
        <button
          onClick={onClearSelection}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 
                   transition-colors"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 
                     dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-300 
                     dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg 
                          shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExport('json')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                           hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                           hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as Markdown
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                           hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as CSV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Move to Collection Menu */}
        <div className="relative">
          <button
            onClick={() => setShowCollectionMenu(!showCollectionMenu)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 
                     dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-300 
                     dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Add to Collection
          </button>
          
          {showCollectionMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg 
                          shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                {mockCollections.map(collection => (
                  <button
                    key={collection.id}
                    onClick={() => handleMoveToCollection(collection.id)}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                             hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: collection.color }}
                      />
                      {collection.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Tags Menu */}
        <div className="relative">
          <button
            onClick={() => setShowTagsMenu(!showTagsMenu)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 
                     dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-300 
                     dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Move className="w-4 h-4 mr-2" />
            Add Tags
          </button>
          
          {showTagsMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg 
                          shadow-lg border border-gray-200 dark:border-gray-700 z-10 p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add tags (comma-separated)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTags()}
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  onClick={() => setShowTagsMenu(false)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 
                           hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTags}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded 
                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Tags
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 
                   dark:text-red-300 bg-white dark:bg-gray-800 border border-red-300 
                   dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                   focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Memories
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete {selectedCount} {selectedCount === 1 ? 'memory' : 'memories'}? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                         bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 
                         dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                         focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg 
                         hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
                         disabled:opacity-50 flex items-center"
              >
                {isDeleting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}