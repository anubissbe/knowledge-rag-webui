# Simple MCP Server Examples

These are minimal example implementations of MCP servers for testing the Knowledge RAG Web UI.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the RAG server:
```bash
npm run start:rag
```

The server will start on port 8002 (or the port specified in RAG_PORT environment variable).

## Testing the Server

1. Health check:
```bash
curl http://localhost:8002/health
```

2. List available tools:
```bash
curl -X POST http://localhost:8002 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "list_tools",
    "params": {},
    "id": 1
  }'
```

3. Store a memory:
```bash
curl -X POST http://localhost:8002 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "store_memory",
    "params": {
      "title": "Test Memory",
      "content": "This is a test memory content",
      "metadata": {"tag": "test"}
    },
    "id": 2
  }'
```

## Note

These are simplified examples for testing purposes. For production use, you should:
- Use a real database instead of in-memory storage
- Implement proper authentication
- Add error handling and validation
- Implement all required MCP methods
- Add logging and monitoring