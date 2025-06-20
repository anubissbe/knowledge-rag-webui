# Knowledge RAG System Setup Guide

This guide will help you set up the complete Knowledge RAG system that this web UI connects to.

## Overview

The Knowledge RAG Web UI requires the following MCP (Model Context Protocol) servers to be running:

1. **RAG Server** (Port 8002) - Memory storage and retrieval
2. **Knowledge Graph Server** (Port 8001) - Entity extraction and relationships
3. **Vector DB Server** (Port 8003) - Semantic search capabilities
4. **Unified DB Server** (Port 8004) - Cross-database operations

## Prerequisites

- Python 3.8+ installed
- PostgreSQL 12+ installed and running
- Redis (optional, for caching)
- Node.js 18+ (for MCP servers)
- Docker (optional, for containerized deployment)

## Backend Setup

### 1. Clone the Knowledge RAG System

```bash
git clone https://github.com/your-org/knowledge-rag-system.git
cd knowledge-rag-system
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure PostgreSQL Database

Create a database for the Knowledge RAG system:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE knowledge_rag_db;
CREATE USER rag_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE knowledge_rag_db TO rag_user;

-- Create required tables
\c knowledge_rag_db
CREATE TABLE memories (
    id VARCHAR PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    user_id VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collections (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    color VARCHAR,
    icon VARCHAR,
    user_id VARCHAR,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entities (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=postgresql://rag_user:your_secure_password@localhost:5432/knowledge_rag_db

# MCP Server Ports
RAG_PORT=8002
KG_PORT=8001
VECTOR_PORT=8003
UNIFIED_PORT=8004

# Optional: OpenAI API for embeddings
OPENAI_API_KEY=your_openai_api_key

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

### 5. Start MCP Servers

The MCP servers can be started individually or using a script:

```bash
# Start all MCP servers
cd mcp-servers
npm install

# Start individual servers
node rag-server.js --port 8002 &
node kg-server.js --port 8001 &
node vector-server.js --port 8003 &
node unified-server.js --port 8004 &

# Or use the start script
./start-all-servers.sh
```

## MCP Server Implementation

If you need to implement the MCP servers from scratch, here's a basic template:

### RAG Server (rag-server.js)

```javascript
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// JSON-RPC endpoint
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
        result = { tools: ['store_memory', 'search_memories'] };
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

async function storeMemory(params) {
  const { title, content, metadata, user_id } = params;
  const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await pool.query(
    'INSERT INTO memories (id, title, content, metadata, user_id) VALUES ($1, $2, $3, $4, $5)',
    [id, title, content, metadata, user_id]
  );
  
  return { memory_id: id };
}

async function searchMemories(params) {
  const { query, limit = 10, offset = 0 } = params;
  
  const result = await pool.query(
    'SELECT * FROM memories WHERE content ILIKE $1 OR title ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [`%${query}%`, limit, offset]
  );
  
  return {
    results: result.rows,
    total: result.rowCount
  };
}

const PORT = process.env.RAG_PORT || 8002;
app.listen(PORT, () => {
  console.log(`RAG MCP Server running on port ${PORT}`);
});
```

## Docker Deployment (Optional)

Create a `docker-compose.yml` for easy deployment:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: knowledge_rag_db
      POSTGRES_USER: rag_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  rag-server:
    build: ./mcp-servers
    environment:
      DATABASE_URL: postgresql://rag_user:your_secure_password@postgres:5432/knowledge_rag_db
      RAG_PORT: 8002
    ports:
      - "8002:8002"
    depends_on:
      - postgres

  kg-server:
    build: ./mcp-servers
    environment:
      DATABASE_URL: postgresql://rag_user:your_secure_password@postgres:5432/knowledge_rag_db
      KG_PORT: 8001
    ports:
      - "8001:8001"
    depends_on:
      - postgres

  vector-server:
    build: ./mcp-servers
    environment:
      DATABASE_URL: postgresql://rag_user:your_secure_password@postgres:5432/knowledge_rag_db
      VECTOR_PORT: 8003
    ports:
      - "8003:8003"
    depends_on:
      - postgres

  unified-server:
    build: ./mcp-servers
    environment:
      DATABASE_URL: postgresql://rag_user:your_secure_password@postgres:5432/knowledge_rag_db
      UNIFIED_PORT: 8004
    ports:
      - "8004:8004"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run with Docker Compose:

```bash
docker-compose up -d
```

## Verifying the Setup

1. **Check MCP Server Health**:
```bash
# Test each server
curl http://localhost:8002/health
curl http://localhost:8001/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

2. **Test JSON-RPC**:
```bash
# Test RAG server
curl -X POST http://localhost:8002 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "list_tools",
    "params": {},
    "id": 1
  }'
```

3. **Run the Web UI Test Page**:
   - Start the web UI: `npm run dev`
   - Navigate to `http://localhost:5173/test-mcp`
   - Click "Test Connections" to verify all servers

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure all MCP servers are running
   - Check firewall settings
   - Verify port numbers match configuration

2. **Database Connection Failed**:
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database and tables exist

3. **CORS Issues**:
   - Make sure MCP servers have CORS enabled
   - Check allowed origins include your web UI URL

### Logs

Check server logs for detailed error messages:
```bash
# If using systemd
journalctl -u rag-server -f

# If running directly
# Check console output

# If using Docker
docker-compose logs -f rag-server
```

## Production Considerations

1. **Security**:
   - Use HTTPS for all connections
   - Implement proper authentication
   - Use environment variables for secrets
   - Set up proper CORS policies

2. **Performance**:
   - Add Redis caching
   - Implement connection pooling
   - Use indexes on frequently queried columns
   - Consider load balancing for MCP servers

3. **Monitoring**:
   - Set up health check endpoints
   - Implement logging aggregation
   - Monitor server metrics
   - Set up alerts for failures

## Next Steps

Once your backend is set up and running:

1. Configure the web UI `.env` file with your server URLs
2. Start the web UI with `npm run dev`
3. Navigate to the test page to verify connectivity
4. Begin using the Knowledge RAG system!

For more information about the MCP protocol, visit: https://modelcontextprotocol.io/