import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, Filter, X, ChevronDown, Tag
} from 'lucide-react';
import type { SearchResult } from '../types';
import SearchResultCard from '../components/search/SearchResultCard';
import SearchFilters from '../components/search/SearchFilters';
import SearchStats from '../components/search/SearchStats';
import { useDebounce } from '../hooks/useDebounce';
import { usePageKeyboardShortcuts, useGlobalKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import { useKeyboardShortcutsModal } from '../hooks/useKeyboardShortcutsModal';
import KeyboardShortcutIndicator from '../components/KeyboardShortcutIndicator';
import { searchApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import { preferencesApi } from '../services/api/preferencesApi';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';


// Mock search function - DEPRECATED: Now using real API
/*
const mockSearch = async (query: string, filters: SearchFiltersInterface): Promise<SearchResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockMemories: Memory[] = [
    {
      id: '1',
      title: 'Understanding RAG Systems',
      content: 'Retrieval-Augmented Generation (RAG) is a powerful technique that combines the benefits of retrieval-based and generative AI systems.',
      contentType: 'markdown' as const,
      summary: 'An overview of Retrieval-Augmented Generation systems, their components, benefits, and implementation.',
      userId: 'user-1',
      tags: ['AI', 'RAG', 'Machine Learning', 'LLM'],
      entities: [],
      metadata: { wordCount: 245, readingTime: 2, language: 'en' },
      score: 0.95,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z'
    },
    {
      id: '2',
      title: 'Vector Databases Explained',
      content: 'Understanding how vector databases work in RAG systems and their role in similarity search.',
      contentType: 'text' as const,
      summary: 'Deep dive into vector databases and their role in similarity search.',
      userId: 'user-1',
      tags: ['Vector DB', 'Embeddings', 'Search'],
      entities: [],
      metadata: { wordCount: 350, readingTime: 3, language: 'en' },
      score: 0.82,
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-14T09:00:00Z'
    }
  ].filter(memory => {
    const matchesQuery = query === '' || 
      memory.title.toLowerCase().includes(query.toLowerCase()) ||
      memory.content.toLowerCase().includes(query.toLowerCase());
    
    const matchesTags = !filters.tags?.length || 
      filters.tags.some((tag: string) => memory.tags.includes(tag));
    
    return matchesQuery && matchesTags;
  });

  // Calculate facets
  const facets = {
    tags: mockMemories.reduce((acc, memory) => {
      memory.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    entities: {},
    collections: {},
    dateRanges: {
      'Last 7 days': 2,
      'Last 30 days': 5,
      'Last 3 months': 8,
      'Last year': 12
    }
  };

  return {
    memories: mockMemories,
    facets,
    totalCount: mockMemories.length,
    page: 1,
    pageSize: 20
  };
};
*/

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  
  // Parse query params
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') || '';
  const initialTag = params.get('tag') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: initialTag ? [initialTag] : [],
    entities: [] as string[],
    collections: [] as string[],
    dateRange: '',
    contentType: '',
    sortBy: 'relevance' as 'relevance' | 'date' | 'title'
  });
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const debouncedFilters = useDebounce(filters, 1000); // Save filters after 1 second of no changes

  // Perform search
  const performSearch = useCallback(async () => {
    if (!debouncedQuery && filters.tags.length === 0) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchApi.search(
        debouncedQuery,
        1, // page
        20, // pageSize
        {
          tags: filters.tags.length > 0 ? filters.tags : undefined,
          entities: filters.entities.length > 0 ? filters.entities : undefined,
          dateFrom: filters.dateRange ? filters.dateRange.split(',')[0] : undefined,
          dateTo: filters.dateRange ? filters.dateRange.split(',')[1] : undefined,
          sortBy: filters.sortBy
        }
      );
      
      // Transform API response to match component expectations
      const transformedFacets = {
        tags: searchResults.facets.tags.reduce((acc, item) => {
          acc[item.value] = item.count;
          return acc;
        }, {} as Record<string, number>),
        entities: searchResults.facets.entities.reduce((acc, item) => {
          acc[item.value] = item.count;
          return acc;
        }, {} as Record<string, number>),
        collections: {}, // API doesn't return collections facet yet
        dateRanges: searchResults.facets.dates.reduce((acc, item) => {
          acc[item.value] = item.count;
          return acc;
        }, {} as Record<string, number>)
      };

      setResults({
        memories: searchResults.memories,
        facets: transformedFacets,
        totalCount: searchResults.total,
        page: searchResults.page,
        pageSize: searchResults.pageSize
      });
    } catch (error) {
      toast.error('Search failed', 'Unable to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.tags.length > 0) params.set('tag', filters.tags[0]);
    
    const newSearch = params.toString();
    if (newSearch !== location.search.substring(1)) {
      navigate(`/search${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    }
  }, [query, filters.tags, navigate, location.search]);

  // Perform search when query or filters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Save search preferences when filters change (debounced)
  useEffect(() => {
    const savePreferences = async () => {
      if (!isAuthenticated || !filtersLoaded) return;

      try {
        await preferencesApi.saveSearchPreferences(debouncedFilters);
        logger.debug('Search preferences saved');
      } catch (error) {
        logger.warn('Failed to save search preferences');
      }
    };

    savePreferences();
  }, [debouncedFilters, isAuthenticated, filtersLoaded]);

  const handleTagClick = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      tags: [],
      entities: [],
      collections: [],
      dateRange: '',
      contentType: '',
      sortBy: 'relevance'
    });
  };

  const activeFilterCount = [
    filters.tags.length,
    filters.entities.length,
    filters.collections.length,
    filters.dateRange ? 1 : 0,
    filters.contentType ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  // Keyboard shortcuts
  const pageShortcuts = usePageKeyboardShortcuts('search');
  const globalShortcuts = useGlobalKeyboardShortcuts();
  const { isOpen: isShortcutsOpen, close: closeShortcuts } = useKeyboardShortcutsModal();

  // Load saved search preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!isAuthenticated) {
        setFiltersLoaded(true);
        return;
      }

      try {
        const preferences = await preferencesApi.getSearchPreferences();
        if (preferences && !initialTag) {
          // Only load saved preferences if not overridden by URL params
          setFilters(preferences.filters);
        }
      } catch (error) {
        logger.warn('Failed to load search preferences');
      } finally {
        setFiltersLoaded(true);
      }
    };

    loadPreferences();
  }, [isAuthenticated, initialTag]);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Custom keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Clear search with Escape when focused
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        e.preventDefault();
        setQuery('');
      }
      // Toggle filters with f
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowFilters(!showFilters);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showFilters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your memories..."
                className="w-full pl-12 pr-12 py-4 sm:py-3 text-base sm:text-lg border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         min-h-[52px] touch-manipulation"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 
                           hover:text-gray-600 dark:hover:text-gray-300 p-1 min-h-[44px] min-w-[44px]
                           flex items-center justify-center touch-manipulation"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle and Active Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group inline-flex items-center justify-center px-4 py-3 sm:py-2 text-sm font-medium rounded-lg
                         text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                         min-h-[44px] touch-manipulation relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                <KeyboardShortcutIndicator 
                  shortcut={{ key: 'f' }} 
                  showOnHover 
                  className="ml-2 hidden sm:inline-flex"
                />
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 
                           dark:hover:text-blue-300 px-2 py-1 min-h-[36px] touch-manipulation"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Active Filter Tags */}
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-2 rounded-full text-sm
                             bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                             min-h-[36px]"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => handleTagClick(tag)}
                      className="ml-2 hover:text-blue-900 dark:hover:text-blue-100 p-0.5
                               min-h-[20px] min-w-[20px] flex items-center justify-center touch-manipulation"
                      aria-label={`Remove ${tag} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            facets={results?.facets || { tags: {}, entities: {}, collections: {}, dateRanges: {} }}
          />
        )}
      </div>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : results ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Results List */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {results.totalCount === 0 ? 'No results found' : 
                   `${results.totalCount} result${results.totalCount === 1 ? '' : 's'} found`}
                </h2>
                {query && (
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    for "{query}"
                  </p>
                )}
              </div>

              {/* Sort Options */}
              {results.totalCount > 0 && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'relevance' | 'date' | 'title' }))}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="title">Title</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {results.totalCount > 0 ? (
                <div className="space-y-6">
                  {results.memories.map((memory) => (
                    <SearchResultCard
                      key={memory.id}
                      memory={memory}
                      query={debouncedQuery}
                      onTagClick={handleTagClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </div>

            {/* Stats Sidebar */}
            {results.totalCount > 0 && (
              <aside className="lg:w-80">
                <SearchStats
                  facets={results.facets}
                  totalCount={results.totalCount}
                  filters={filters}
                  onFilterChange={(key, value) => {
                    if (key === 'tags') {
                      handleTagClick(value as string);
                    } else {
                      setFilters(prev => ({ ...prev, [key]: value }));
                    }
                  }}
                />
              </aside>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Start searching your memories
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a search term or select filters to find what you're looking for
            </p>
          </div>
        )}
      </main>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={closeShortcuts}
        shortcuts={{ 
          global: globalShortcuts,
          page: [
            ...pageShortcuts,
            { key: 'f', description: 'Toggle filters', action: () => setShowFilters(!showFilters) }
          ],
          pageName: 'Search'
        }}
      />
    </div>
  );
}