import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import type { Memory } from '../types';
import MemoryCard from '../components/memory/MemoryCard';
import MemoryListItem from '../components/memory/MemoryListItem';
import MobileFloatingActionButton from '../components/mobile/MobileFloatingActionButton';
import BulkSelectionHeader from '../components/bulk/BulkSelectionHeader';
import BulkSelectionToolbar from '../components/bulk/BulkSelectionToolbar';
import BulkSelectableMemoryCard from '../components/bulk/BulkSelectableMemoryCard';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { usePageKeyboardShortcuts, useGlobalKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import { useKeyboardShortcutsModal } from '../hooks/useKeyboardShortcutsModal';
import KeyboardShortcutIndicator from '../components/KeyboardShortcutIndicator';
import { useRealtimeMemories } from '../hooks/useRealtimeMemories';

// Mock memories for development
const mockMemories: Memory[] = [
  {
    id: '1',
    title: 'Understanding RAG Systems',
    content: 'Retrieval-Augmented Generation (RAG) is a powerful technique...',
    contentType: 'markdown',
    summary: 'An overview of Retrieval-Augmented Generation systems, their components, benefits, and implementation.',
    userId: 'user-1',
    tags: ['AI', 'RAG', 'Machine Learning', 'LLM'],
    entities: [],
    metadata: {
      wordCount: 245,
      readingTime: 2,
      language: 'en'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    id: '2',
    title: 'Vector Databases Explained',
    content: 'Understanding how vector databases work in RAG systems...',
    contentType: 'text',
    summary: 'Deep dive into vector databases and their role in similarity search.',
    userId: 'user-1',
    tags: ['Vector DB', 'Embeddings', 'Search'],
    entities: [],
    metadata: {
      wordCount: 350,
      readingTime: 3,
      language: 'en'
    },
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  },
  {
    id: '3',
    title: 'Implementing Semantic Search',
    content: 'How to build semantic search with embeddings...',
    contentType: 'markdown',
    summary: 'Practical guide to implementing semantic search in your applications.',
    userId: 'user-1',
    tags: ['Search', 'NLP', 'Implementation'],
    entities: [],
    metadata: {
      wordCount: 420,
      readingTime: 4,
      language: 'en'
    },
    createdAt: '2024-01-13T14:30:00Z',
    updatedAt: '2024-01-13T14:30:00Z'
  }
];

export default function Memories() {
  const [memories, setMemories] = useState<Memory[]>(mockMemories);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Real-time updates
  useRealtimeMemories({
    onMemoryCreated: (memory) => {
      setMemories((prev) => [memory, ...prev]);
    },
    onMemoryUpdated: (updatedMemory) => {
      setMemories((prev) =>
        prev.map((m) => (m.id === updatedMemory.id ? updatedMemory : m))
      );
    },
    onMemoryDeleted: ({ id }) => {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    },
  });

  // Get all unique tags
  const allTags = Array.from(
    new Set(memories.flatMap(m => m.tags))
  ).sort();

  // Filter memories based on search and tags
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = searchQuery === '' || 
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (memory.summary && memory.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => memory.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  // Bulk selection functionality
  const {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    selectAll,
    clearSelection,
    hasSelection,
    selectionCount
  } = useBulkSelection(filteredMemories.map(m => m.id));
  
  const selectedMemories = memories.filter(memory => selectedItems.includes(memory.id));
  
  // Bulk operations handlers
  const handleBulkDelete = async (memoryIds: string[]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMemories(prev => prev.filter(memory => !memoryIds.includes(memory.id)));
    console.log('Deleted memories:', memoryIds);
  };
  
  const handleBulkExport = (memoryIds: string[], format: 'json' | 'markdown' | 'csv') => {
    const exportData = memories.filter(memory => memoryIds.includes(memory.id));
    
    let content = '';
    let filename = '';
    
    switch (format) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        filename = 'memories.json';
        break;
      case 'markdown':
        content = exportData.map(memory => 
          `# ${memory.title}\n\n${memory.content}\n\n---\n`
        ).join('\n');
        filename = 'memories.md';
        break;
      case 'csv': {
        const headers = 'Title,Content,Tags,Created';
        const rows = exportData.map(memory => 
          `"${memory.title}","${memory.content.replace(/"/g, '""')}","${memory.tags.join(';')}","${memory.createdAt}"`
        );
        content = [headers, ...rows].join('\n');
        filename = 'memories.csv';
        break;
      }
    }
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Exported memories:', memoryIds, 'as', format);
  };
  
  const handleBulkMoveToCollection = async (memoryIds: string[], collectionId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Moved memories to collection:', memoryIds, collectionId);
    // In real app, update memories with collection assignment
  };
  
  const handleBulkAddTags = async (memoryIds: string[], tags: string[]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setMemories(prev => prev.map(memory => 
      memoryIds.includes(memory.id) 
        ? { ...memory, tags: [...new Set([...memory.tags, ...tags])] }
        : memory
    ));
    console.log('Added tags to memories:', memoryIds, tags);
  };
  
  const handleToggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    if (isBulkMode) {
      clearSelection();
    }
  };

  // Keyboard shortcuts
  const pageShortcuts = usePageKeyboardShortcuts('memories');
  const globalShortcuts = useGlobalKeyboardShortcuts();
  const { isOpen: isShortcutsOpen, close: closeShortcuts } = useKeyboardShortcutsModal();

  // Custom page-specific shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus search with /
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Create new memory with n
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        navigate('/memories/new');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              My Memories
            </h1>
            
            <div className="relative group">
              <Link
                to="/memories/new"
                className="inline-flex items-center justify-center px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-blue-500 transition-colors font-medium text-sm sm:text-base
                         min-h-[44px] touch-manipulation"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="hidden xs:inline">New Memory</span>
                <span className="xs:hidden">New</span>
                <KeyboardShortcutIndicator 
                  shortcut={{ key: 'n' }} 
                  showOnHover 
                  className="ml-2 hidden sm:inline-flex"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Search and View Toggle Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search memories..."
                    ref={searchInputRef}
                    className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base
                             min-h-[44px] touch-manipulation"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center justify-center sm:justify-start">
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`
                        px-3 py-2 text-sm rounded-full transition-colors min-h-[36px] touch-manipulation
                        ${selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Selection Toolbar */}
      {hasSelection && (
        <BulkSelectionToolbar
          selectedCount={selectionCount}
          selectedMemories={selectedMemories}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          onBulkMoveToCollection={handleBulkMoveToCollection}
          onBulkAddTags={handleBulkAddTags}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        />
      )}
      
      {/* Bulk Selection Header */}
      {filteredMemories.length > 0 && (
        <BulkSelectionHeader
          totalCount={filteredMemories.length}
          selectedCount={selectionCount}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onToggleAll={toggleAll}
          onToggleBulkMode={handleToggleBulkMode}
          isBulkMode={isBulkMode}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          data-select-all={isBulkMode}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery || selectedTags.length > 0
                ? 'No memories found matching your criteria.'
                : 'No memories yet. Create your first memory!'}
            </p>
            {(searchQuery || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTags([]);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMemories.map(memory => 
              isBulkMode ? (
                <BulkSelectableMemoryCard
                  key={memory.id}
                  memory={memory}
                  isSelected={selectedItems.includes(memory.id)}
                  onToggleSelect={toggleItem}
                  isBulkMode={isBulkMode}
                  data-memory-item
                  data-memory-id={memory.id}
                />
              ) : (
                <MemoryCard key={memory.id} memory={memory} />
              )
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredMemories.map(memory => (
              <MemoryListItem key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </main>
      
      {/* Mobile Floating Action Button */}
      <MobileFloatingActionButton 
        to="/memories/new" 
        label="Create new memory"
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={closeShortcuts}
        shortcuts={{ 
          global: globalShortcuts,
          page: [
            ...pageShortcuts,
            { key: '/', description: 'Focus search', action: () => searchInputRef.current?.focus() },
            { key: 'n', description: 'Create new memory', action: () => navigate('/memories/new') }
          ],
          pageName: 'Memories'
        }}
      />
    </div>
  );
}