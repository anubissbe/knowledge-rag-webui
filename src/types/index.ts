// Memory types
export interface Memory {
  id: string
  title: string
  content: string
  preview?: string
  metadata: Record<string, string | number | boolean | null>
  tags: string[]
  collection?: string
  collectionId?: string
  entities?: Entity[]
  userId?: string
  created_at: string
  updated_at: string
  createdAt?: Date // For backward compatibility
  updatedAt?: Date // For backward compatibility
}

export interface CreateMemoryDto {
  title: string
  content: string
  metadata?: Record<string, string | number | boolean | null>
  tags?: string[]
  collection?: string
  collectionId?: string
  userId?: string
}

export interface UpdateMemoryDto {
  title?: string
  content?: string
  metadata?: Record<string, string | number | boolean | null>
  tags?: string[]
  collection?: string
  collectionId?: string
}

// Search types
export interface SearchResult {
  memories: Memory[]
  total: number
  page: number
  limit: number
  searchTime: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  facets?: SearchFacets
}

export interface SearchResultItem {
  documentId: string
  memoryId: string
  title: string
  content: string
  score: number
  metadata: Record<string, string | number | boolean | null>
  highlights?: string[]
  tags?: string[]
  collection?: string
}

export interface SearchParams {
  query: string
  searchType?: 'hybrid' | 'vector' | 'fulltext'
  filters?: SearchFilters
  limit?: number
  offset?: number
  page?: number
  sort?: 'relevance' | 'date' | 'title'
  order?: 'asc' | 'desc'
}

export interface SearchFilters {
  tags?: string[]
  collections?: string[]
  dateRange?: {
    start?: string
    end?: string
  }
  metadata?: Record<string, string | number | boolean | null>
}

export interface SearchFacets {
  tags: Array<{ name: string; count: number }>
  collections: Array<{ name: string; count: number }>
  entities: Array<{ name: string; count: number }>
}

// Entity types
export interface Entity {
  id: string
  name: string
  type: string
  description?: string
  properties?: Record<string, string | number | boolean | null>
  memoryIds?: string[]
  created_at: string
  updated_at: string
  frequency?: number
  relevance?: number
}

export interface Relationship {
  id: string
  sourceId: string
  targetId: string
  type: string
  description?: string
  properties?: Record<string, string | number | boolean | null>
  weight?: number
  confidence?: number
  created_at: string
  updated_at: string
}

// Collection types
export interface Collection {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  memoryCount: number
  userId?: string
  isPublic?: boolean
  created_at: string
  updated_at: string
  createdAt?: Date // For backward compatibility
  updatedAt?: Date // For backward compatibility
}

export interface CreateCollectionDto {
  name: string
  description?: string
  color?: string
  icon?: string
  isPublic?: boolean
}

export interface UpdateCollectionDto {
  name?: string
  description?: string
  color?: string
  icon?: string
  isPublic?: boolean
}

// User types
export interface User {
  id: string
  email: string
  name: string
  bio?: string
  avatar?: string
  preferences?: UserPreferences
  created_at: string
  updated_at: string
  createdAt?: string
  lastLogin?: string
  isActive: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultSearchType: 'hybrid' | 'vector' | 'fulltext'
  keyboardShortcuts: boolean
  autoSave: boolean
  resultsPerPage: number
  defaultView: 'grid' | 'list' | 'compact'
  defaultSort?: 'recent' | 'oldest' | 'alphabetical' | 'updated'
  itemsPerPage?: string
  showPreview: boolean
  showTags?: boolean
  compactMode: boolean
  autoArchive?: boolean
  language?: string
  dateFormat?: string
  timeFormat?: string
  timezone?: string
  numberFormat?: string
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  confirmPassword: string
}

export interface AuthResponse {
  token: string
  user: User
  expiresAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Error types
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

// Graph types for knowledge graph visualization
export interface GraphNode {
  id: string
  label: string
  type: 'memory' | 'entity' | 'collection'
  properties?: Record<string, string | number | boolean | null>
  x?: number
  y?: number
  color?: string
  size?: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: string
  properties?: Record<string, string | number | boolean | null>
  weight?: number
  color?: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata?: {
    totalNodes: number
    totalEdges: number
    depth: number
  }
}

// Export/Import types
export interface ExportOptions {
  format: 'json' | 'markdown' | 'pdf'
  includeMetadata?: boolean
  includeCollections?: boolean
  dateRange?: {
    start?: string
    end?: string
  }
  collections?: string[]
  tags?: string[]
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: Array<{
    line?: number
    message: string
    data?: any
  }>
  warnings?: Array<{
    message: string
    data?: any
  }>
}

// Analytics types
export interface AnalyticsStats {
  totalMemories: number
  totalCollections: number
  totalEntities: number
  totalSearches: number
  avgMemoryLength: number
  popularTags: Array<{ tag: string; count: number }>
  searchPatterns: Array<{ query: string; count: number }>
  activityByDate: Array<{ date: string; count: number }>
}

// UI State types
export interface UIState {
  sidebarOpen: boolean
  currentView: 'grid' | 'list'
  selectedMemories: string[]
  loading: boolean
  error: string | null
  searchQuery: string
  activeFilters: SearchFilters
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}