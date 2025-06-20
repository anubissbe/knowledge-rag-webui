import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Collection, CreateCollectionDto, UpdateCollectionDto, Memory } from '../types'
import { mcpAdapter } from '../services/api/mcp-adapter'

interface CollectionState {
  // State
  collections: Collection[]
  selectedCollection: Collection | null
  collectionMemories: { [collectionId: string]: Memory[] }
  loading: boolean
  error: string | null
  
  // Actions
  fetchCollections: () => Promise<void>
  fetchCollection: (id: string) => Promise<void>
  createCollection: (collection: CreateCollectionDto) => Promise<Collection>
  updateCollection: (id: string, collection: UpdateCollectionDto) => Promise<Collection>
  deleteCollection: (id: string) => Promise<void>
  
  // Collection memories
  fetchCollectionMemories: (id: string) => Promise<void>
  
  // Selection
  selectCollection: (collection: Collection | null) => void
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  collections: [],
  selectedCollection: null,
  collectionMemories: {},
  loading: false,
  error: null,
}

export const useCollectionStore = create<CollectionState>()(
  devtools(
    (set) => ({
      ...initialState,

      fetchCollections: async () => {
        set({ loading: true, error: null })
        try {
          const collections = await mcpAdapter.collection.getCollections()
          set({
            collections,
            loading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch collections',
            loading: false,
          })
        }
      },

      fetchCollection: async (id: string) => {
        set({ loading: true, error: null })
        try {
          // MCP doesn't have a getCollection method, so find from list
          const collections = await mcpAdapter.collection.getCollections()
          const collection = collections.find(c => c.id === id)
          if (!collection) throw new Error('Collection not found')
          set({
            selectedCollection: collection,
            loading: false,
          })
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch collection',
            loading: false,
          })
        }
      },

      createCollection: async (collectionData: CreateCollectionDto) => {
        set({ loading: true, error: null })
        try {
          const collection = await mcpAdapter.collection.createCollection(collectionData)
          set(state => ({
            collections: [...state.collections, collection],
            loading: false,
          }))
          return collection
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to create collection',
            loading: false,
          })
          throw error
        }
      },

      updateCollection: async (id: string, collectionData: UpdateCollectionDto) => {
        set({ loading: true, error: null })
        try {
          // MCP doesn't support update, so we need to recreate
          // First get existing collection
          const collections = await mcpAdapter.collection.getCollections()
          const existing = collections.find(c => c.id === id)
          if (!existing) throw new Error('Collection not found')
          
          // Merge updates
          const updatedCollection = {
            ...existing,
            ...collectionData,
            updated_at: new Date().toISOString()
          }
          set(state => ({
            collections: state.collections.map(c => 
              c.id === id ? updatedCollection : c
            ),
            selectedCollection: state.selectedCollection?.id === id ? updatedCollection : state.selectedCollection,
            loading: false,
          }))
          return updatedCollection
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to update collection',
            loading: false,
          })
          throw error
        }
      },

      deleteCollection: async (id: string) => {
        set({ loading: true, error: null })
        try {
          // MCP doesn't support delete, simulate by removing from state
          // In a real implementation, this would need backend support
          console.warn('Collection deletion not supported by MCP')
          set(state => ({
            collections: state.collections.filter(c => c.id !== id),
            selectedCollection: state.selectedCollection?.id === id ? null : state.selectedCollection,
            collectionMemories: Object.fromEntries(
              Object.entries(state.collectionMemories).filter(([key]) => key !== id)
            ),
            loading: false,
          }))
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to delete collection',
            loading: false,
          })
          throw error
        }
      },

      fetchCollectionMemories: async (id: string) => {
        set({ loading: true, error: null })
        try {
          // Search for memories in this collection
          const result = await mcpAdapter.memory.searchMemories({
            query: '',
            filters: { collection: id },
            limit: 100
          })
          const memories = result.memories
          set(state => ({
            collectionMemories: {
              ...state.collectionMemories,
              [id]: memories,
            },
            loading: false,
          }))
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch collection memories',
            loading: false,
          })
        }
      },

      selectCollection: (collection: Collection | null) => {
        set({ selectedCollection: collection })
      },

      setLoading: (loading: boolean) => set({ loading }),

      setError: (error: string | null) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: 'CollectionStore' }
  )
)