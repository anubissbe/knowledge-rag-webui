/**
 * Simple RAG MCP Server Example
 * This is a basic implementation of a RAG server following the MCP protocol
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for demo purposes
const memories = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'rag-mcp' });
});

// Main JSON-RPC endpoint
app.post('/', async (req, res) => {
  const { method, params, id } = req.body;
  
  try {
    let result;
    
    switch (method) {
      case 'store_memory':
        result = await storeMemory(params);
        break;
        
      case 'search_memories':
        result = await searchMemories(params);
        break;
        
      case 'list_tools':
        result = {
          tools: [
            {
              name: 'store_memory',
              description: 'Store a new memory',
              parameters: {
                title: 'string',
                content: 'string',
                metadata: 'object',
                user_id: 'string'
              }
            },
            {
              name: 'search_memories',
              description: 'Search memories',
              parameters: {
                query: 'string',
                search_type: 'string',
                limit: 'number',
                offset: 'number'
              }
            }
          ]
        };
        break;
        
      default:
        throw new Error(`Method ${method} not found`);
    }
    
    res.json({
      jsonrpc: '2.0',
      result,
      id
    });
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error.message
      },
      id
    });
  }
});

// Store memory function
async function storeMemory(params) {
  const { title, content, metadata = {}, user_id = 'default' } = params;
  const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const memory = {
    id,
    title,
    content,
    metadata,
    user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  memories.set(id, memory);
  
  return { memory_id: id, id };
}

// Search memories function
async function searchMemories(params) {
  const { 
    query = '', 
    search_type = 'hybrid',
    limit = 10, 
    offset = 0,
    user_id = 'default'
  } = params;
  
  // Simple text search for demo
  const results = Array.from(memories.values())
    .filter(memory => {
      if (user_id && memory.user_id !== user_id) return false;
      
      const searchText = query.toLowerCase();
      return memory.title.toLowerCase().includes(searchText) ||
             memory.content.toLowerCase().includes(searchText);
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(offset, offset + limit);
  
  return {
    results: results.map(memory => ({
      ...memory,
      score: 1.0 // Dummy relevance score
    })),
    total: results.length,
    search_type
  };
}

// Start server
const PORT = process.env.RAG_PORT || 8002;
app.listen(PORT, () => {
  console.log(`Simple RAG MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`JSON-RPC endpoint: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});