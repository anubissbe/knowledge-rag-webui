import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { Memory, SearchParams, SearchResult, Collection, User, Entity, CreateCollectionDto } from '../../types'

// API URLs from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const RAG_URL = import.meta.env.VITE_RAG_URL || 'http://localhost:8002'
const KG_URL = import.meta.env.VITE_KG_URL || 'http://localhost:8001'
const VECTOR_URL = import.meta.env.VITE_VECTOR_URL || 'http://localhost:8003'
const UNIFIED_URL = import.meta.env.VITE_UNIFIED_URL || 'http://localhost:8004'

// Create axios instances for each service
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export const ragClient = axios.create({
  baseURL: RAG_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Longer timeout for search operations
})

export const kgClient = axios.create({
  baseURL: KG_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

export const vectorClient = axios.create({
  baseURL: VECTOR_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

export const unifiedClient = axios.create({
  baseURL: UNIFIED_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Add request interceptor for auth token
const addAuthInterceptor = (client: any) => {
  client.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('auth-token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: any) => Promise.reject(error)
  )
}

// Add response interceptor for error handling
const addErrorInterceptor = (client: any) => {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth-token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}

// Apply interceptors to all clients
[apiClient, ragClient, kgClient, vectorClient, unifiedClient].forEach(client => {
  addAuthInterceptor(client)
  addErrorInterceptor(client)
})

// Memory API
export const memoryApi = {
  // Get all memories with pagination and filters
  getMemories: async (params?: {
    page?: number
    limit?: number
    sort?: string
    filter?: string
    collection?: string
  }) => {
    const response = await ragClient.get('/memories', { params })
    return response.data
  },

  // Get a single memory by ID
  getMemory: async (id: string): Promise<Memory> => {
    const response = await ragClient.get(`/memories/${id}`)
    return response.data
  },

  // Create a new memory
  createMemory: async (memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Promise<Memory> => {
    const response = await ragClient.post('/memories', memory)
    return response.data
  },

  // Update an existing memory
  updateMemory: async (id: string, memory: Partial<Memory>): Promise<Memory> => {
    const response = await ragClient.put(`/memories/${id}`, memory)
    return response.data
  },

  // Delete a memory
  deleteMemory: async (id: string): Promise<void> => {
    await ragClient.delete(`/memories/${id}`)
  },

  // Get related memories
  getRelatedMemories: async (id: string): Promise<Memory[]> => {
    const response = await ragClient.get(`/memories/${id}/related`)
    return response.data
  },

  // Bulk operations
  bulkDelete: async (ids: string[]): Promise<void> => {
    await ragClient.delete('/memories/bulk', { data: { ids } })
  },

  bulkUpdateCollection: async (ids: string[], collectionId: string): Promise<void> => {
    await ragClient.put('/memories/bulk/collection', { ids, collectionId })
  },
}

// Search API
export const searchApi = {
  // Perform search with various modes
  search: async (params: SearchParams): Promise<SearchResult> => {
    const response = await ragClient.post('/search', params)
    return response.data
  },

  // Get search suggestions
  getSuggestions: async (query: string): Promise<string[]> => {
    const response = await ragClient.get('/search/suggestions', {
      params: { q: query }
    })
    return response.data
  },

  // Get search filters/facets
  getSearchFilters: async (): Promise<any> => {
    const response = await ragClient.get('/search/filters')
    return response.data
  },
}

// Collection API
export const collectionApi = {
  // Get all collections
  getCollections: async (): Promise<Collection[]> => {
    const response = await ragClient.get('/collections')
    return response.data
  },

  // Get a single collection
  getCollection: async (id: string): Promise<Collection> => {
    const response = await ragClient.get(`/collections/${id}`)
    return response.data
  },

  // Create a new collection
  createCollection: async (collection: CreateCollectionDto & { memoryCount?: number }): Promise<Collection> => {
    const response = await ragClient.post('/collections', collection)
    return response.data
  },

  // Update a collection
  updateCollection: async (id: string, collection: Partial<Collection>): Promise<Collection> => {
    const response = await ragClient.put(`/collections/${id}`, collection)
    return response.data
  },

  // Delete a collection
  deleteCollection: async (id: string): Promise<void> => {
    await ragClient.delete(`/collections/${id}`)
  },

  // Get memories in a collection
  getCollectionMemories: async (id: string): Promise<Memory[]> => {
    const response = await ragClient.get(`/collections/${id}/memories`)
    return response.data
  },
}

// Knowledge Graph API
export const knowledgeGraphApi = {
  // Get entities
  getEntities: async (): Promise<Entity[]> => {
    const response = await kgClient.get('/entities')
    return response.data
  },

  // Get entity by ID
  getEntity: async (id: string): Promise<Entity> => {
    const response = await kgClient.get(`/entities/${id}`)
    return response.data
  },

  // Get entity relationships
  getEntityRelationships: async (id: string): Promise<any> => {
    const response = await kgClient.get(`/entities/${id}/relationships`)
    return response.data
  },

  // Get graph data for visualization
  getGraphData: async (params?: {
    depth?: number
    entityId?: string
    memoryId?: string
  }): Promise<any> => {
    const response = await kgClient.get('/graph', { params })
    return response.data
  },
}

// User API
export const userApi = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/user/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (profile: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/user/profile', profile)
    return response.data
  },

  // Get user preferences
  getPreferences: async (): Promise<any> => {
    const response = await apiClient.get('/user/preferences')
    return response.data
  },

  // Update user preferences
  updatePreferences: async (preferences: any): Promise<any> => {
    const response = await apiClient.put('/user/preferences', preferences)
    return response.data
  },
}

// Authentication API
export const authApi = {
  // Login
  login: async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  // Register
  register: async (userData: { email: string; password: string; name: string }): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
    localStorage.removeItem('auth-token')
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post('/auth/refresh')
    return response.data
  },

  // Verify token
  verifyToken: async (): Promise<{ valid: boolean; user?: User }> => {
    const response = await apiClient.get('/auth/verify')
    return response.data
  },
}

// Export/Import API
export const exportApi = {
  // Export memories to various formats
  exportMemories: async (format: 'json' | 'markdown' | 'pdf', options?: any): Promise<Blob> => {
    const response = await ragClient.post('/export/memories', { format, ...options }, {
      responseType: 'blob'
    })
    return response.data
  },

  // Import memories from file
  importMemories: async (file: File, format: 'json' | 'markdown'): Promise<{ imported: number; errors: any[] }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    
    const response = await ragClient.post('/import/memories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

// Analytics API
export const analyticsApi = {
  // Get usage statistics
  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/stats')
    return response.data
  },

  // Get search patterns
  getSearchPatterns: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/search-patterns')
    return response.data
  },

  // Get memory insights
  getMemoryInsights: async (): Promise<any> => {
    const response = await apiClient.get('/analytics/memories')
    return response.data
  },
}

// Health check for all services
export const healthApi = {
  checkHealth: async (): Promise<{ [key: string]: boolean }> => {
    const services = {
      api: apiClient,
      rag: ragClient,
      kg: kgClient,
      vector: vectorClient,
      unified: unifiedClient,
    }

    const results: { [key: string]: boolean } = {}
    
    await Promise.allSettled(
      Object.entries(services).map(async ([name, client]) => {
        try {
          await client.get('/health')
          results[name] = true
        } catch {
          results[name] = false
        }
      })
    )

    return results
  },
}