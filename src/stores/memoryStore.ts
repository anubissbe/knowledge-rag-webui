import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Memory, CreateMemoryDto, UpdateMemoryDto } from '../types'
import { mcpAdapter } from '../services/api/mcp-adapter'

interface MemoryState {
  // State
  memories: Memory[]
  selectedMemory: Memory | null
  selectedMemories: string[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  
  // Filters and sorting
  searchQuery: string
  selectedCollection: string | null
  selectedTags: string[]
  sortBy: 'updated_at' | 'created_at' | 'title'
  sortOrder: 'asc' | 'desc'
  
  // Actions
  fetchMemories: (params?: {
    page?: number
    limit?: number
    sort?: string
    filter?: string
    collection?: string
  }) => Promise<void>
  fetchMemory: (id: string) => Promise<void>
  createMemory: (memory: CreateMemoryDto) => Promise<Memory>
  updateMemory: (id: string, memory: UpdateMemoryDto) => Promise<Memory>
  deleteMemory: (id: string) => Promise<void>
  deleteMemories: (ids: string[]) => Promise<void>
  
  // Related memories
  fetchRelatedMemories: (id: string) => Promise<Memory[]>
  
  // Selection
  selectMemory: (memory: Memory | null) => void
  selectMemories: (ids: string[]) => void
  toggleMemorySelection: (id: string) => void
  clearSelection: () => void
  
  // Filters
  setSearchQuery: (query: string) => void
  setSelectedCollection: (collection: string | null) => void
  setSelectedTags: (tags: string[]) => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  clearFilters: () => void
  
  // Bulk operations
  bulkUpdateCollection: (memoryIds: string[], collectionId: string) => Promise<void>
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  memories: [],
  selectedMemory: null,
  selectedMemories: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
  hasNextPage: false,
  hasPreviousPage: false,
  searchQuery: '',
  selectedCollection: null,
  selectedTags: [],
  sortBy: 'updated_at' as const,
  sortOrder: 'desc' as const,
}

export const useMemoryStore = create<MemoryState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        fetchMemories: async (params = {}) => {
          set({ loading: true, error: null })
          try {
            const {
              page = get().currentPage,
              limit = get().pageSize,
              sort = `${get().sortBy}:${get().sortOrder}`,
              filter = get().searchQuery,
              collection = get().selectedCollection || undefined,
            } = params

            const memories = await mcpAdapter.memory.getMemories(limit)

            // Filter memories based on collection and search query
            let filteredMemories = memories
            if (collection) {
              filteredMemories = filteredMemories.filter(m => m.collectionId === collection)
            }
            if (filter) {
              const query = filter.toLowerCase()
              filteredMemories = filteredMemories.filter(m => 
                m.title.toLowerCase().includes(query) ||
                m.content.toLowerCase().includes(query) ||
                m.tags?.some(tag => tag.toLowerCase().includes(query))
              )
            }

            // Sort memories
            filteredMemories.sort((a, b) => {
              const aValue = a[get().sortBy] || ''
              const bValue = b[get().sortBy] || ''
              const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
              return get().sortOrder === 'asc' ? result : -result
            })

            // Paginate
            const startIndex = (page - 1) * limit
            const endIndex = startIndex + limit
            const paginatedMemories = filteredMemories.slice(startIndex, endIndex)

            set({
              memories: paginatedMemories,
              totalCount: filteredMemories.length,
              currentPage: page,
              hasNextPage: endIndex < filteredMemories.length,
              hasPreviousPage: page > 1,
              loading: false,
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to fetch memories',
              loading: false,
            })
          }
        },

        fetchMemory: async (id: string) => {
          set({ loading: true, error: null })
          try {
            // Search for the specific memory by ID
            const searchResult = await mcpAdapter.memory.searchMemories({
              query: `id:${id}`,
              limit: 1
            })
            const memory = searchResult.memories[0]
            set({
              selectedMemory: memory,
              loading: false,
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to fetch memory',
              loading: false,
            })
          }
        },

        createMemory: async (memoryData: CreateMemoryDto) => {
          set({ loading: true, error: null })
          try {
            const memory = await mcpAdapter.memory.createMemory(memoryData)
            set(state => ({
              memories: [memory, ...state.memories],
              totalCount: state.totalCount + 1,
              loading: false,
            }))
            return memory
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to create memory',
              loading: false,
            })
            throw error
          }
        },

        updateMemory: async (id: string, memoryData: UpdateMemoryDto) => {
          set({ loading: true, error: null })
          try {
            const updatedMemory = await mcpAdapter.memory.updateMemory(id, memoryData)
            set(state => ({
              memories: state.memories.map(m => 
                m.id === id ? updatedMemory : m
              ),
              selectedMemory: state.selectedMemory?.id === id ? updatedMemory : state.selectedMemory,
              loading: false,
            }))
            return updatedMemory
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to update memory',
              loading: false,
            })
            throw error
          }
        },

        deleteMemory: async (id: string) => {
          set({ loading: true, error: null })
          try {
            await mcpAdapter.memory.deleteMemory(id)
            set(state => ({
              memories: state.memories.filter(m => m.id !== id),
              selectedMemory: state.selectedMemory?.id === id ? null : state.selectedMemory,
              selectedMemories: state.selectedMemories.filter(mId => mId !== id),
              totalCount: state.totalCount - 1,
              loading: false,
            }))
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to delete memory',
              loading: false,
            })
            throw error
          }
        },

        deleteMemories: async (ids: string[]) => {
          set({ loading: true, error: null })
          try {
            // MCP doesn't support bulk delete, so delete one by one
            await Promise.all(ids.map(id => mcpAdapter.memory.deleteMemory(id)))
            set(state => ({
              memories: state.memories.filter(m => !ids.includes(m.id)),
              selectedMemories: [],
              totalCount: state.totalCount - ids.length,
              loading: false,
            }))
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to delete memories',
              loading: false,
            })
            throw error
          }
        },

        fetchRelatedMemories: async (id: string) => {
          try {
            const relatedMemories = await mcpAdapter.memory.getRelatedMemories(id)
            return relatedMemories
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to fetch related memories',
            })
            return []
          }
        },

        selectMemory: (memory: Memory | null) => {
          set({ selectedMemory: memory })
        },

        selectMemories: (ids: string[]) => {
          set({ selectedMemories: ids })
        },

        toggleMemorySelection: (id: string) => {
          set(state => ({
            selectedMemories: state.selectedMemories.includes(id)
              ? state.selectedMemories.filter(mId => mId !== id)
              : [...state.selectedMemories, id]
          }))
        },

        clearSelection: () => {
          set({ selectedMemories: [], selectedMemory: null })
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query })
        },

        setSelectedCollection: (collection: string | null) => {
          set({ selectedCollection: collection })
        },

        setSelectedTags: (tags: string[]) => {
          set({ selectedTags: tags })
        },

        setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => {
          set({ sortBy: sortBy as any, sortOrder })
        },

        clearFilters: () => {
          set({
            searchQuery: '',
            selectedCollection: null,
            selectedTags: [],
          })
        },

        bulkUpdateCollection: async (memoryIds: string[], collectionId: string) => {
          set({ loading: true, error: null })
          try {
            // MCP doesn't support bulk update, so update one by one
            await Promise.all(memoryIds.map(id => 
              mcpAdapter.memory.updateMemory(id, { collectionId })
            ))
            set(state => ({
              memories: state.memories.map(m => 
                memoryIds.includes(m.id) ? { ...m, collectionId } : m
              ),
              selectedMemories: [],
              loading: false,
            }))
          } catch (error: any) {
            set({
              error: error.response?.data?.message || error.message || 'Failed to update memory collections',
              loading: false,
            })
            throw error
          }
        },

        setLoading: (loading: boolean) => set({ loading }),
        
        setError: (error: string | null) => set({ error }),

        reset: () => set(initialState),
      }),
      {
        name: 'memory-store',
        partialize: (state) => ({
          pageSize: state.pageSize,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
        }),
      }
    ),
    { name: 'MemoryStore' }
  )
)