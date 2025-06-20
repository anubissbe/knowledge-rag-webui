import { type FC, useState } from 'react';
import { 
  Trash2, 
  Tag, 
  FolderPlus, 
  Download, 
  X, 
  CheckSquare
} from 'lucide-react';
import { useBulkOperationsStore } from '../../stores/bulkOperationsStore';
import { useCollectionStore } from '../../stores/collectionStore';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '@/lib/utils';

interface BulkOperationsToolbarProps {
  totalItems: number;
  onBulkDelete: (ids: string[]) => void;
  onBulkTag: (ids: string[], tags: string[]) => void;
  onBulkMove: (ids: string[], collectionId: string) => void;
  onBulkExport: (ids: string[], format: 'json' | 'csv' | 'markdown') => void;
}

export const BulkOperationsToolbar: FC<BulkOperationsToolbarProps> = ({
  totalItems,
  onBulkDelete,
  onBulkTag,
  onBulkMove,
  onBulkExport
}) => {
  const { 
    isSelectionMode, 
    toggleSelectionMode, 
    clearSelection, 
    getSelectedCount, 
    getSelectedIds
  } = useBulkOperationsStore();
  const { collections } = useCollectionStore();
  const { addNotification } = useUIStore();
  
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showCollectionSelect, setShowCollectionSelect] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const selectedCount = getSelectedCount();
  const selectedIds = getSelectedIds();

  const handleBulkDelete = () => {
    if (selectedCount === 0) {
      addNotification({
        title: 'No items selected',
        message: 'Please select items to delete',
        type: 'warning'
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedCount} items?`)) {
      onBulkDelete(selectedIds);
      clearSelection();
      addNotification({
        title: 'Items deleted',
        message: `${selectedCount} items have been deleted`,
        type: 'success'
      });
    }
  };

  const handleBulkTag = () => {
    if (selectedCount === 0) {
      addNotification({
        title: 'No items selected',
        message: 'Please select items to tag',
        type: 'warning'
      });
      return;
    }

    if (!tagInput.trim()) {
      addNotification({
        title: 'No tags entered',
        message: 'Please enter tags separated by commas',
        type: 'warning'
      });
      return;
    }

    const tags = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
    onBulkTag(selectedIds, tags);
    setTagInput('');
    setShowTagInput(false);
    clearSelection();
    addNotification({
      title: 'Tags added',
      message: `Added ${tags.length} tags to ${selectedCount} items`,
      type: 'success'
    });
  };

  const handleBulkMove = (collectionId: string) => {
    if (selectedCount === 0) {
      addNotification({
        title: 'No items selected',
        message: 'Please select items to move',
        type: 'warning'
      });
      return;
    }

    onBulkMove(selectedIds, collectionId);
    setShowCollectionSelect(false);
    clearSelection();
    const collection = collections.find(c => c.id === collectionId);
    addNotification({
      title: 'Items moved',
      message: `Moved ${selectedCount} items to ${collection?.name || 'collection'}`,
      type: 'success'
    });
  };

  const handleBulkExport = (format: 'json' | 'csv' | 'markdown') => {
    if (selectedCount === 0) {
      addNotification({
        title: 'No items selected',
        message: 'Please select items to export',
        type: 'warning'
      });
      return;
    }

    onBulkExport(selectedIds, format);
    setShowExportMenu(false);
    clearSelection();
    addNotification({
      title: 'Export started',
      message: `Exporting ${selectedCount} items as ${format.toUpperCase()}`,
      type: 'success'
    });
  };

  const handleSelectAll = () => {
    // This would need to get all current item IDs from the parent component
    // For now, we'll just show the UI
    addNotification({
      title: 'Select all',
      message: 'This feature requires integration with the parent component',
      type: 'info'
    });
  };

  if (!isSelectionMode) {
    return (
      <button
        onClick={toggleSelectionMode}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
        data-testid="enable-bulk-operations"
      >
        <CheckSquare size={18} />
        <span>Select Items</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={clearSelection}
          className="p-2 hover:bg-background rounded transition-colors"
          aria-label="Cancel selection"
          data-testid="cancel-selection"
        >
          <X size={18} />
        </button>
        
        <span className="text-sm font-medium">
          {selectedCount > 0 ? (
            `${selectedCount} of ${totalItems} selected`
          ) : (
            'No items selected'
          )}
        </span>

        <button
          onClick={handleSelectAll}
          className="text-sm text-primary hover:underline ml-2"
          data-testid="select-all"
        >
          Select all
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Delete */}
        <button
          onClick={handleBulkDelete}
          disabled={selectedCount === 0}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
            selectedCount > 0
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          data-testid="bulk-delete"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>

        {/* Tag */}
        <div className="relative">
          {showTagInput ? (
            <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-background border rounded-lg shadow-lg z-10">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tags, separated by commas"
                className="w-full px-3 py-2 border rounded-md mb-2"
                onKeyDown={(e) => e.key === 'Enter' && handleBulkTag()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleBulkTag}
                  className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add Tags
                </button>
                <button
                  onClick={() => {
                    setShowTagInput(false);
                    setTagInput('');
                  }}
                  className="px-3 py-1.5 border rounded-md hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              disabled={selectedCount === 0}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
                selectedCount > 0
                  ? "bg-background border hover:bg-muted"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              data-testid="bulk-tag"
            >
              <Tag size={16} />
              <span>Tag</span>
            </button>
          )}
        </div>

        {/* Move to Collection */}
        <div className="relative">
          {showCollectionSelect && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-10">
              <div className="p-1">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleBulkMove(collection.id)}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                  >
                    {collection.name}
                  </button>
                ))}
                <button
                  onClick={() => setShowCollectionSelect(false)}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors border-t"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowCollectionSelect(!showCollectionSelect)}
            disabled={selectedCount === 0}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
              selectedCount > 0
                ? "bg-background border hover:bg-muted"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            data-testid="bulk-move"
          >
            <FolderPlus size={16} />
            <span>Move</span>
          </button>
        </div>

        {/* Export */}
        <div className="relative">
          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-background border rounded-lg shadow-lg z-10">
              <div className="p-1">
                <button
                  onClick={() => handleBulkExport('json')}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleBulkExport('csv')}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleBulkExport('markdown')}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                >
                  Export as Markdown
                </button>
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors border-t"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={selectedCount === 0}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
              selectedCount > 0
                ? "bg-background border hover:bg-muted"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            data-testid="bulk-export"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};