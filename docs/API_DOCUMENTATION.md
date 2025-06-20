# API Documentation - Knowledge RAG Web UI

## Overview

The Knowledge RAG Web UI communicates with backend services through MCP (Model Context Protocol) servers using JSON-RPC 2.0. This document describes all available API endpoints and their usage.

## MCP Server Endpoints

### Base URLs
- **RAG Server**: `http://localhost:8002`
- **Knowledge Graph**: `http://localhost:8001`
- **Vector DB**: `http://localhost:8003`
- **Unified DB**: `http://localhost:8004`

### Authentication
All requests include a Bearer token in the Authorization header when available:
```
Authorization: Bearer <token>
```

## API Endpoints

### Memory Operations

#### Create Memory
**Server**: RAG MCP (8002)  
**Method**: `store_memory`  
**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "store_memory",
  "params": {
    "title": "string",
    "content": "string",
    "metadata": {},
    "user_id": "string"
  },
  "id": 1234567890
}
```
**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "memory_id": "string",
    "id": "string"
  },
  "id": 1234567890
}
```

#### Search Memories
**Server**: RAG MCP (8002)  
**Method**: `search_memories`  
**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "search_memories",
  "params": {
    "query": "string",
    "search_type": "hybrid|vector|fulltext",
    "limit": 10,
    "offset": 0,
    "user_id": "string"
  },
  "id": 1234567890
}
```
**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "results": [
      {
        "id": "string",
        "title": "string",
        "content": "string",
        "metadata": {},
        "score": 0.95
      }
    ],
    "total": 100
  },
  "id": 1234567890
}
```

### Knowledge Graph Operations

#### Extract Entities
**Server**: Knowledge Graph MCP (8001)  
**Method**: `extract_entities`  
**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "extract_entities",
  "params": {
    "text": "string",
    "extract_relationships": true
  },
  "id": 1234567890
}
```
**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "entities": [
      {
        "id": "string",
        "name": "string",
        "type": "string",
        "description": "string",
        "properties": {},
        "frequency": 1
      }
    ]
  },
  "id": 1234567890
}
```

#### Build Knowledge Graph
**Server**: Knowledge Graph MCP (8001)  
**Method**: `build_knowledge_graph`  
**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "build_knowledge_graph",
  "params": {
    "entity_name": "string",
    "max_depth": 3,
    "include_types": ["type1", "type2"]
  },
  "id": 1234567890
}
```
**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "nodes": [
      {
        "id": "string",
        "label": "string",
        "type": "string",
        "properties": {}
      }
    ],
    "edges": [
      {
        "source": "string",
        "target": "string",
        "type": "string",
        "weight": 1
      }
    ]
  },
  "id": 1234567890
}
```

### Vector Search Operations

#### Semantic Search
**Server**: Vector DB MCP (8003)  
**Method**: `search`  
**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "search",
  "params": {
    "query": "string",
    "top_k": 10,
    "filter": {}
  },
  "id": 1234567890
}
```

#### Find Similar
**Server**: Vector DB MCP (8003)  
**Method**: `search_similar`  
**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "search_similar",
  "params": {
    "text": "string",
    "top_k": 5,
    "exclude_ids": ["id1", "id2"]
  },
  "id": 1234567890
}
```

### Collection Operations

#### Execute Query (for collections)
**Server**: Unified DB MCP (8004)  
**Method**: `execute_query`  
**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "execute_query",
  "params": {
    "query": "SELECT * FROM collections ORDER BY created_at DESC",
    "database": "postgres"
  },
  "id": 1234567890
}
```

## TypeScript Types

### Memory Types
```typescript
interface Memory {
  id: string
  title: string
  content: string
  preview: string
  metadata: Record<string, any>
  tags: string[]
  collection?: string
  collectionId?: string
  entities: Entity[]
  userId?: string
  created_at: string
  updated_at: string
}

interface CreateMemoryDto {
  title: string
  content: string
  tags?: string[]
  metadata?: Record<string, any>
  collection?: string
  collectionId?: string
  userId?: string
}
```

### Search Types
```typescript
interface SearchParams {
  query: string
  searchType?: 'hybrid' | 'vector' | 'fulltext'
  filters?: SearchFilters
  sort?: string
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
  page?: number
}

interface SearchResult {
  memories: Memory[]
  total: number
  page: number
  limit: number
  searchTime: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
```

### Knowledge Graph Types
```typescript
interface Entity {
  id: string
  name: string
  type: string
  description?: string
  properties: Record<string, any>
  memoryIds?: string[]
  frequency?: number
  created_at: string
  updated_at: string
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    totalNodes: number
    totalEdges: number
    depth: number
  }
}
```

### Collection Types
```typescript
interface Collection {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  memoryCount: number
  userId?: string
  isPublic: boolean
  created_at: string
  updated_at: string
}
```

## Error Handling

All MCP calls follow this error format:
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Error description",
    "data": {}
  },
  "id": 1234567890
}
```

Common error codes:
- `-32700`: Parse error
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error

## Usage Examples

### Creating a Memory with Entity Extraction
```typescript
import { mcpAdapter } from '@/services/api/mcp-adapter'

const memory = await mcpAdapter.memory.createMemory({
  title: 'Meeting Notes',
  content: 'Discussed React performance optimization with John.',
  tags: ['meeting', 'react'],
  metadata: { attendees: ['John', 'Me'] }
})
// Automatically extracts entities: React, John
```

### Searching with Filters
```typescript
const results = await mcpAdapter.memory.searchMemories({
  query: 'performance optimization',
  searchType: 'hybrid',
  limit: 20,
  filters: {
    tags: ['react'],
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  }
})
```

### Building a Knowledge Graph
```typescript
const graph = await mcpAdapter.knowledgeGraph.buildGraph({
  entity_name: 'React',
  max_depth: 2,
  include_types: ['technology', 'person', 'concept']
})
```

## Rate Limiting

Currently, there are no rate limits on MCP servers, but it's recommended to:
- Batch operations when possible
- Implement client-side caching
- Use pagination for large datasets
- Add retry logic with exponential backoff

## Best Practices

1. **Error Handling**: Always wrap MCP calls in try-catch blocks
2. **Loading States**: Show loading indicators during operations
3. **Caching**: Cache frequently accessed data (collections, entities)
4. **Pagination**: Use pagination for large result sets
5. **Validation**: Validate input before sending to MCP servers

---

*Last Updated: 2025-06-20*