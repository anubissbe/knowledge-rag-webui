import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { SearchResult, SearchParams, SearchFilters, SearchFacets } from '../types'
import { mcpAdapter } from '../services/api/mcp-adapter'

interface SearchState {
  // State
  query: string
  results: SearchResult | null
  suggestions: string[]
  facets: SearchFacets | null
  loading: boolean
  error: string | null
  searchHistory: string[]
  
  // Search parameters
  searchType: 'hybrid' | 'vector' | 'fulltext'
  filters: SearchFilters
  sortBy: 'relevance' | 'date' | 'title'
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
  
  // Recent searches
  recentSearches: Array<{
    query: string
    timestamp: string
    resultsCount: number
  }>
  
  // Actions
  search: (params: SearchParams) => Promise<void>
  searchWithQuery: (query: string) => Promise<void>
  getSuggestions: (query: string) => Promise<void>
  loadMoreResults: () => Promise<void>
  
  // Search parameters
  setQuery: (query: string) => void
  setSearchType: (type: 'hybrid' | 'vector' | 'fulltext') => void
  setFilters: (filters: SearchFilters) => void
  updateFilter: (key: keyof SearchFilters, value: any) => void
  clearFilters: () => void
  setSorting: (sortBy: 'relevance' | 'date' | 'title', sortOrder?: 'asc' | 'desc') => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  
  // History
  addToHistory: (query: string, resultsCount: number) => void
  clearHistory: () => void
  removeFromHistory: (query: string) => void
  
  // Suggestions
  clearSuggestions: () => void
  
  // Quick search presets
  quickSearches: Array<{
    name: string
    query: string
    filters?: SearchFilters
  }>
  addQuickSearch: (name: string, query: string, filters?: SearchFilters) => void
  removeQuickSearch: (name: string) => void
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  clearResults: () => void
}

const initialState = {
  query: '',
  results: null,
  suggestions: [],
  facets: null,
  loading: false,
  error: null,
  searchHistory: [],
  searchType: 'hybrid' as const,
  filters: {},
  sortBy: 'relevance' as const,
  sortOrder: 'desc' as const,
  page: 1,
  limit: 20,
  recentSearches: [],
  quickSearches: [
    { name: 'Recent', query: '', filters: { dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() } } },
    { name: 'Favorites', query: '', filters: { tags: ['favorite'] } },
    { name: 'Important', query: '', filters: { tags: ['important'] } },
  ],
}

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        search: async (params: SearchParams) => {
          set({ loading: true, error: null })
          try {
            const result = await mcpAdapter.memory.searchMemories(params)
            const { query, limit } = params
            
            set({
              results: result,
              query: query,
              page: params.page || 1,
              limit: limit || 20,
              loading: false,
            })

            // Add to search history if it's a new search
            if (query && query.trim()) {
              get().addToHistory(query, result.total)
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Search failed',
              loading: false,
            })
          }
        },

        searchWithQuery: async (query: string) => {
          const { searchType, filters, sortBy, sortOrder, limit } = get()
          await get().search({
            query,
            searchType,
            filters,
            sort: sortBy,
            order: sortOrder,
            limit,
            page: 1,
          })
        },

        getSuggestions: async (query: string) => {
          if (!query.trim() || query.length < 2) {
            set({ suggestions: [] })
            return
          }

          try {
            // MCP doesn't have suggestions endpoint, so generate from search history
            const suggestions = get().searchHistory
              .filter(h => h.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
            set({ suggestions })
          } catch (error: any) {
            // Silently fail for suggestions
            set({ suggestions: [] })
          }
        },

        loadMoreResults: async () => {
          const { query, searchType, filters, sortBy, sortOrder, limit, page, results } = get()
          
          if (!results?.hasNextPage) return

          set({ loading: true })
          try {
            const nextPageResults = await mcpAdapter.memory.searchMemories({
              query,
              searchType,
              filters,
              sort: sortBy,
              order: sortOrder,
              limit,
              page: page + 1,
              offset: page * limit,
            })

            set(state => ({
              results: state.results ? {
                ...nextPageResults,
                memories: [...state.results.memories, ...nextPageResults.memories],
              } : nextPageResults,
              page: page + 1,
              loading: false,
            }))
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to load more results',
              loading: false,
            })
          }
        },

        setQuery: (query: string) => {
          set({ query })
        },

        setSearchType: (searchType: 'hybrid' | 'vector' | 'fulltext') => {
          set({ searchType })
        },

        setFilters: (filters: SearchFilters) => {
          set({ filters })
        },

        updateFilter: (key: keyof SearchFilters, value: any) => {
          set(state => ({
            filters: {
              ...state.filters,
              [key]: value,
            }
          }))
        },

        clearFilters: () => {
          set({ filters: {} })
        },

        setSorting: (sortBy: 'relevance' | 'date' | 'title', sortOrder: 'asc' | 'desc' = 'desc') => {
          set({ sortBy, sortOrder })
        },

        setPage: (page: number) => {
          set({ page })
        },

        setLimit: (limit: number) => {
          set({ limit })
        },

        addToHistory: (query: string, resultsCount: number) => {
          set(state => {
            const newSearch = {
              query,
              timestamp: new Date().toISOString(),
              resultsCount,
            }
            
            // Remove duplicate if exists and add to front
            const filteredHistory = state.recentSearches.filter(s => s.query !== query)
            const newHistory = [newSearch, ...filteredHistory].slice(0, 10) // Keep only last 10
            
            return {
              recentSearches: newHistory,
              searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 20)
            }
          })
        },

        clearHistory: () => {
          set({ recentSearches: [], searchHistory: [] })
        },

        removeFromHistory: (query: string) => {
          set(state => ({
            recentSearches: state.recentSearches.filter(s => s.query !== query),
            searchHistory: state.searchHistory.filter(q => q !== query),
          }))
        },

        clearSuggestions: () => {
          set({ suggestions: [] })
        },

        addQuickSearch: (name: string, query: string, filters?: SearchFilters) => {
          set(state => ({
            quickSearches: [
              ...state.quickSearches.filter(q => q.name !== name),
              { name, query, filters }
            ]
          }))
        },

        removeQuickSearch: (name: string) => {
          set(state => ({
            quickSearches: state.quickSearches.filter(q => q.name !== name)
          }))
        },

        setLoading: (loading: boolean) => set({ loading }),

        setError: (error: string | null) => set({ error }),

        reset: () => set(initialState),

        clearResults: () => {
          set({
            results: null,
            query: '',
            suggestions: [],
            facets: null,
            error: null,
            page: 1,
          })
        },
      }),
      {
        name: 'search-store',
        partialize: (state) => ({
          searchType: state.searchType,
          limit: state.limit,
          recentSearches: state.recentSearches,
          searchHistory: state.searchHistory,
          quickSearches: state.quickSearches,
        }),
      }
    ),
    { name: 'SearchStore' }
  )
)