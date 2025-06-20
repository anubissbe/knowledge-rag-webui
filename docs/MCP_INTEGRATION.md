# MCP (Model Context Protocol) Integration Documentation

## Overview

The Knowledge RAG Web UI integrates with multiple MCP servers to provide comprehensive functionality for memory management, knowledge extraction, and semantic search. This document details the integration architecture, testing procedures, and troubleshooting guidelines.

## Architecture

### MCP Servers

The application connects to four primary MCP servers:

1. **RAG Server (Port 8002)**
   - Memory CRUD operations
   - Full-text search
   - Memory organization

2. **Knowledge Graph Server (Port 8001)**
   - Entity extraction
   - Relationship mapping
   - Graph visualization data

3. **Vector DB Server (Port 8003)**
   - Semantic embeddings
   - Similarity search
   - Vector operations

4. **Unified DB Server (Port 8004)**
   - Cross-database queries
   - Aggregated operations
   - Data synchronization

### Integration Layer

```
┌─────────────────┐
│   Web UI (React)│
└────────┬────────┘
         │
┌────────▼────────┐
│  MCP Adapter    │
│  (TypeScript)   │
└────────┬────────┘
         │
    JSON-RPC 2.0
         │
┌────────▼────────────────────────┐
│        MCP Servers              │
├─────────┬─────────┬─────────┬──┤
│   RAG   │   KG    │ Vector  │UD│
│  8002   │  8001   │  8003   │04│
└─────────┴─────────┴─────────┴──┘
```

## Configuration

### Environment Variables

```env
# MCP Server URLs
VITE_RAG_URL=http://192.168.1.24:8002
VITE_KG_URL=http://192.168.1.24:8001
VITE_VECTOR_URL=http://192.168.1.24:8003
VITE_UNIFIED_URL=http://192.168.1.24:8004

# Optional authentication
VITE_MCP_AUTH_TOKEN=your-token-here
```

### MCP Adapter Configuration

The MCP adapter (`src/services/api/mcp-adapter.ts`) handles all communication with MCP servers:

```typescript
export const mcpAdapter = {
  rag: createMCPClient(VITE_RAG_URL),
  knowledgeGraph: createMCPClient(VITE_KG_URL),
  vectorDB: createMCPClient(VITE_VECTOR_URL),
  unifiedDB: createMCPClient(VITE_UNIFIED_URL),
};
```

## Testing

### 1. Command-Line Testing

Run the comprehensive MCP integration test:

```bash
npm run test:mcp
```

This test verifies:
- Server connectivity
- CRUD operations
- Search functionality
- Entity extraction
- Vector operations

### 2. Web UI Testing

Access the MCP test page (development mode only):

```
http://localhost:5173/test-mcp
```

Features:
- Real-time server status
- Operation testing
- Performance metrics
- Error simulation

### 3. E2E Testing

Run Playwright tests for MCP integration:

```bash
npm run test:e2e -- mcp-integration.spec.ts
```

Tests include:
- Memory creation/retrieval
- Search operations
- Knowledge graph visualization
- Collection management
- Error handling

## API Operations

### Memory Operations

```typescript
// Create memory
await mcpAdapter.rag.memories.create({
  title: "Memory Title",
  content: "Memory content",
  tags: ["tag1", "tag2"],
  metadata: { custom: "data" }
});

// Search memories
await mcpAdapter.rag.memories.search({
  query: "search terms",
  filters: { tags: ["tag1"] },
  limit: 10,
  offset: 0
});

// Get memory
await mcpAdapter.rag.memories.get(memoryId);

// Update memory
await mcpAdapter.rag.memories.update(memoryId, updates);

// Delete memory
await mcpAdapter.rag.memories.delete(memoryId);
```

### Knowledge Graph Operations

```typescript
// Extract entities
await mcpAdapter.knowledgeGraph.entities.extract({
  text: "John works at OpenAI in San Francisco",
  options: { includeMetadata: true }
});

// Build graph
await mcpAdapter.knowledgeGraph.graph.build({
  entityId: "entity-123",
  maxDepth: 3,
  includeRelationships: true
});

// Get entity relationships
await mcpAdapter.knowledgeGraph.relationships.get(entityId);
```

### Vector Search Operations

```typescript
// Create embedding
await mcpAdapter.vectorDB.embeddings.create({
  text: "Content to embed",
  metadata: { source: "user-input" }
});

// Similarity search
await mcpAdapter.vectorDB.search.similar({
  query: "search query",
  limit: 10,
  threshold: 0.7
});

// Hybrid search
await mcpAdapter.vectorDB.search.hybrid({
  query: "search terms",
  vectorWeight: 0.7,
  textWeight: 0.3
});
```

## Error Handling

### Connection Errors

```typescript
try {
  const result = await mcpAdapter.rag.memories.create(data);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    // Server not reachable
    console.error('MCP server is not running');
  } else if (error.code === 'TIMEOUT') {
    // Request timeout
    console.error('MCP server timeout');
  }
}
```

### Validation Errors

```typescript
// MCP adapter includes validation
const result = await mcpAdapter.rag.memories.create({
  title: "", // Will throw validation error
  content: "Content"
});
```

### Retry Logic

The MCP adapter includes automatic retry for transient failures:

```typescript
const mcpClient = createMCPClient(url, {
  retries: 3,
  retryDelay: 1000,
  timeout: 5000
});
```

## Performance Optimization

### 1. Connection Pooling

MCP adapter maintains persistent connections:

```typescript
// Connections are reused automatically
const memory1 = await mcpAdapter.rag.memories.get(id1);
const memory2 = await mcpAdapter.rag.memories.get(id2);
```

### 2. Batch Operations

```typescript
// Batch create memories
await mcpAdapter.rag.memories.batchCreate([
  { title: "Memory 1", content: "..." },
  { title: "Memory 2", content: "..." }
]);

// Batch delete
await mcpAdapter.rag.memories.batchDelete([id1, id2, id3]);
```

### 3. Caching

React Query handles caching automatically:

```typescript
// Cached for 5 minutes by default
const { data } = useQuery({
  queryKey: ['memory', memoryId],
  queryFn: () => mcpAdapter.rag.memories.get(memoryId),
  staleTime: 5 * 60 * 1000
});
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Verify MCP servers are running
   - Check firewall settings
   - Confirm correct URLs in environment

2. **Timeout Errors**
   - Increase timeout in adapter config
   - Check server performance
   - Verify network connectivity

3. **Authentication Failures**
   - Verify auth token is correct
   - Check token expiration
   - Confirm server auth configuration

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('MCP_DEBUG', 'true');

// Or in environment
VITE_MCP_DEBUG=true npm run dev
```

### Health Checks

Manual health check:

```bash
# Check individual servers
curl http://192.168.1.24:8002/health
curl http://192.168.1.24:8001/health
curl http://192.168.1.24:8003/health
curl http://192.168.1.24:8004/health
```

## Monitoring

### Metrics Collection

The MCP adapter collects performance metrics:

```typescript
// Access metrics
const metrics = mcpAdapter.getMetrics();
console.log(metrics);
// {
//   requests: 1234,
//   errors: 5,
//   avgResponseTime: 123,
//   serverStatus: { ... }
// }
```

### Error Tracking

Errors are automatically logged with context:

```typescript
// Errors include:
// - Server URL
// - Method called
// - Parameters
// - Timestamp
// - Stack trace
```

## Security Considerations

1. **Authentication**
   - Use environment variables for tokens
   - Never commit credentials
   - Rotate tokens regularly

2. **Data Validation**
   - All inputs are validated client-side
   - Server performs additional validation
   - Sanitize user inputs

3. **Network Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Monitor for unusual patterns

## Future Enhancements

1. **WebSocket Integration**
   - Real-time updates from MCP servers
   - Live collaboration features
   - Push notifications

2. **Offline Support**
   - Queue operations when offline
   - Sync when connection restored
   - Local caching improvements

3. **Advanced Features**
   - Streaming responses
   - File upload support
   - Bulk import/export
   - Custom MCP server plugins