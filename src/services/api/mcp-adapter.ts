import axios from 'axios'
import type { 
  Memory, 
  CreateMemoryDto, 
  UpdateMemoryDto,
  SearchParams, 
  SearchResult,
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
  Entity,
  GraphData
} from '@/types'

// MCP Server URLs
const RAG_MCP_URL = 'http://192.168.1.24:8002'
const KG_MCP_URL = 'http://192.168.1.24:8001'
const VECTOR_MCP_URL = 'http://192.168.1.24:8003'
const UNIFIED_MCP_URL = 'http://192.168.1.24:8004'

// Helper to make JSON-RPC calls
async function callMCPMethod<T = any>(
  url: string,
  method: string,
  params: any = {}
): Promise<T> {
  try {
    // Add auth token if available
    const token = localStorage.getItem('auth-token')
    const headers: any = { 'Content-Type': 'application/json' }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await axios.post(url, {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    }, {
      headers,
      timeout: 30000
    })

    if (response.data.error) {
      throw new Error(response.data.error.message || 'MCP call failed')
    }

    return response.data.result
  } catch (error: any) {
    console.error(`MCP call failed: ${method}`, error)
    throw new Error(error.response?.data?.error?.message || error.message || 'MCP call failed')
  }
}

// Memory API Adapter
export const memoryMCPAdapter = {
  // Store a memory using RAG MCP
  async createMemory(memory: CreateMemoryDto): Promise<Memory> {
    const result = await callMCPMethod(RAG_MCP_URL, 'store_memory', {
      title: memory.title,
      content: memory.content,
      metadata: memory.metadata || {},
      user_id: memory.userId || 'default'
    })

    // Extract entities using Knowledge Graph MCP
    let entities: Entity[] = []
    try {
      const entityResult = await callMCPMethod(KG_MCP_URL, 'extract_entities', {
        text: memory.content,
        extract_relationships: true
      })
      entities = entityResult.entities || []
    } catch (error) {
      console.warn('Entity extraction failed:', error)
    }

    return {
      id: result.memory_id || result.id || String(Date.now()),
      title: memory.title,
      content: memory.content,
      preview: memory.content.slice(0, 200),
      metadata: memory.metadata || {},
      tags: memory.tags || [],
      collection: memory.collection,
      collectionId: memory.collectionId,
      entities,
      userId: memory.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },

  // Search memories using RAG MCP
  async searchMemories(params: SearchParams): Promise<SearchResult> {
    const searchType = params.searchType || 'hybrid'
    let searchResult: any

    if (searchType === 'vector') {
      // Use Vector DB MCP for semantic search
      searchResult = await callMCPMethod(VECTOR_MCP_URL, 'search', {
        query: params.query,
        top_k: params.limit || 10,
        filter: params.filters
      })
    } else {
      // Use RAG MCP for hybrid search
      searchResult = await callMCPMethod(RAG_MCP_URL, 'search_memories', {
        query: params.query,
        search_type: searchType,
        limit: params.limit || 10,
        offset: params.offset || 0,
        user_id: 'default'
      })
    }

    // Transform results to our format
    const memories: Memory[] = searchResult.results?.map((result: any) => ({
      id: result.id || result.document_id,
      title: result.title || 'Untitled',
      content: result.content || result.text || '',
      preview: result.preview || result.content?.slice(0, 200) || '',
      metadata: result.metadata || {},
      tags: result.tags || [],
      collection: result.collection,
      entities: [],
      created_at: result.created_at || new Date().toISOString(),
      updated_at: result.updated_at || new Date().toISOString(),
      score: result.score || result.similarity_score
    })) || []

    return {
      memories,
      total: searchResult.total || memories.length,
      page: params.page || 1,
      limit: params.limit || 10,
      searchTime: searchResult.search_time || 0,
      hasNextPage: memories.length === (params.limit || 10),
      hasPreviousPage: (params.page || 1) > 1
    }
  },

  // Get all memories (using search with empty query)
  async getMemories(limit = 50): Promise<Memory[]> {
    try {
      const result = await this.searchMemories({
        query: '',
        limit
      })
      return result.memories
    } catch (error) {
      console.error('Failed to get memories:', error)
      return []
    }
  },

  // Get related memories
  async getRelatedMemories(id: string): Promise<Memory[]> {
    try {
      // First get the memory content
      const searchResult = await this.searchMemories({
        query: `id:${id}`,
        limit: 1
      })

      if (searchResult.memories.length === 0) {
        return []
      }

      const memory = searchResult.memories[0]
      
      // Search for similar memories
      const related = await callMCPMethod(VECTOR_MCP_URL, 'search_similar', {
        text: memory.content,
        top_k: 5,
        exclude_ids: [id]
      })

      return related.results?.map((result: any) => ({
        id: result.id || result.document_id,
        title: result.title || 'Untitled',
        content: result.content || result.text || '',
        preview: result.preview || result.content?.slice(0, 200) || '',
        metadata: result.metadata || {},
        tags: result.tags || [],
        entities: [],
        created_at: result.created_at || new Date().toISOString(),
        updated_at: result.updated_at || new Date().toISOString()
      })) || []
    } catch (error) {
      console.error('Failed to get related memories:', error)
      return []
    }
  },

  // Delete memory (not directly supported by MCP, would need custom implementation)
  async deleteMemory(id: string): Promise<void> {
    console.warn('Delete not implemented in MCP servers')
    // In a real implementation, this would need to be handled by a custom API
    throw new Error('Delete operation not supported')
  },

  // Update memory (not directly supported by MCP, would need custom implementation)
  async updateMemory(id: string, updates: UpdateMemoryDto): Promise<Memory> {
    console.warn('Update not implemented in MCP servers')
    // In a real implementation, this would need to be handled by a custom API
    throw new Error('Update operation not supported')
  }
}

// Entity/Knowledge Graph API Adapter
export const knowledgeGraphMCPAdapter = {
  // Get entities from text
  async extractEntities(text: string): Promise<Entity[]> {
    const result = await callMCPMethod(KG_MCP_URL, 'extract_entities', {
      text,
      extract_relationships: true
    })

    return result.entities?.map((entity: any) => ({
      id: entity.id || `entity-${Date.now()}-${Math.random()}`,
      name: entity.name,
      type: entity.type,
      description: entity.description,
      properties: entity.properties || {},
      frequency: entity.frequency || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) || []
  },

  // Build knowledge graph
  async buildGraph(params: {
    entity_name?: string
    max_depth?: number
    include_types?: string[]
  }): Promise<GraphData> {
    const result = await callMCPMethod(KG_MCP_URL, 'build_knowledge_graph', params)

    // Transform to our GraphData format
    const nodes = result.nodes?.map((node: any) => ({
      id: node.id,
      label: node.label || node.name,
      type: node.type === 'document' ? 'memory' : node.type,
      properties: node.properties || {},
      x: node.x,
      y: node.y,
      size: node.size || 10,
      color: node.color
    })) || []

    const edges = result.edges?.map((edge: any) => ({
      id: edge.id || `edge-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: edge.type || edge.relationship || 'related',
      properties: edge.properties || {},
      weight: edge.weight || 1
    })) || []

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        depth: params.max_depth || 3
      }
    }
  },

  // Get entity details
  async getEntity(name: string): Promise<Entity | null> {
    const result = await callMCPMethod(KG_MCP_URL, 'get_entity_info', { entity_name: name })

    if (!result || !result.entity) {
      return null
    }

    return {
      id: result.entity.id || `entity-${name}`,
      name: result.entity.name,
      type: result.entity.type,
      description: result.entity.description,
      properties: result.entity.properties || {},
      memoryIds: result.related_documents || [],
      frequency: result.frequency || 1,
      created_at: result.entity.created_at || new Date().toISOString(),
      updated_at: result.entity.updated_at || new Date().toISOString()
    }
  }
}

// Collection API Adapter (using Unified DB MCP)
export const collectionMCPAdapter = {
  // Get all collections
  async getCollections(): Promise<Collection[]> {
    try {
      const result = await callMCPMethod(UNIFIED_MCP_URL, 'execute_query', {
        query: 'SELECT * FROM collections ORDER BY created_at DESC',
        database: 'postgres'
      })

      return result.rows?.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        icon: row.icon,
        memoryCount: row.memory_count || 0,
        userId: row.user_id,
        isPublic: row.is_public || false,
        created_at: row.created_at,
        updated_at: row.updated_at
      })) || []
    } catch (error) {
      console.error('Failed to get collections:', error)
      return []
    }
  },

  // Create collection
  async createCollection(collection: CreateCollectionDto): Promise<Collection> {
    const id = `col-${Date.now()}`
    const now = new Date().toISOString()

    try {
      await callMCPMethod(UNIFIED_MCP_URL, 'execute_query', {
        query: `
          INSERT INTO collections (id, name, description, color, icon, user_id, is_public, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        params: [
          id,
          collection.name,
          collection.description || null,
          collection.color || null,
          collection.icon || null,
          'default',
          collection.isPublic || false,
          now,
          now
        ],
        database: 'postgres'
      })

      return {
        id,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        icon: collection.icon,
        memoryCount: 0,
        userId: 'default',
        isPublic: collection.isPublic || false,
        created_at: now,
        updated_at: now
      }
    } catch (error) {
      console.error('Failed to create collection:', error)
      throw error
    }
  }
}

// Export convenience functions for the stores
export const mcpAdapter = {
  memory: memoryMCPAdapter,
  knowledgeGraph: knowledgeGraphMCPAdapter,
  collection: collectionMCPAdapter,

  // Test connection to MCP servers
  async testConnections(): Promise<{
    rag: boolean
    kg: boolean
    vector: boolean
    unified: boolean
  }> {
    const results = {
      rag: false,
      kg: false,
      vector: false,
      unified: false
    }

    try {
      await callMCPMethod(RAG_MCP_URL, 'list_tools')
      results.rag = true
    } catch (error) {
      console.error('RAG MCP connection failed:', error)
    }

    try {
      await callMCPMethod(KG_MCP_URL, 'list_tools')
      results.kg = true
    } catch (error) {
      console.error('KG MCP connection failed:', error)
    }

    try {
      await callMCPMethod(VECTOR_MCP_URL, 'list_tools')
      results.vector = true
    } catch (error) {
      console.error('Vector MCP connection failed:', error)
    }

    try {
      await callMCPMethod(UNIFIED_MCP_URL, 'list_tools')
      results.unified = true
    } catch (error) {
      console.error('Unified MCP connection failed:', error)
    }

    return results
  }
}