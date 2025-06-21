# Knowledge RAG WebUI Backend API

A RESTful API server for the Knowledge RAG WebUI application, providing memory management, search, and analytics capabilities.

## Features

- **RESTful API**: Clean, versioned API endpoints
- **WebSocket Support**: Real-time updates for collaborative features
- **JWT Authentication**: Secure user authentication (ready for implementation)
- **In-Memory Database**: Fast development with sample data
- **TypeScript**: Full type safety and modern JavaScript features
- **Express.js**: Fast, minimalist web framework
- **Rate Limiting**: API protection against abuse
- **CORS Support**: Cross-origin resource sharing
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Request validation using express-validator

## Architecture

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers (if needed)
│   ├── middleware/     # Express middleware
│   ├── models/         # TypeScript interfaces and types
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic and services
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── tests/              # Test files
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## API Endpoints

### Base URL
- Development: `http://localhost:5002/api`
- Production: Configure via environment variables

### Available Endpoints

#### Authentication
- `POST /v1/auth/login` - User login
- `POST /v1/auth/register` - User registration
- `GET /v1/auth/me` - Get current user
- `POST /v1/auth/refresh` - Refresh JWT token
- `POST /v1/auth/logout` - User logout

#### Memories
- `GET /v1/memories` - List memories with pagination
- `GET /v1/memories/:id` - Get memory by ID
- `POST /v1/memories` - Create new memory
- `PUT /v1/memories/:id` - Update memory
- `DELETE /v1/memories/:id` - Delete memory
- `GET /v1/memories/recent` - Get recent memories

#### Collections
- `GET /v1/collections` - List collections
- `GET /v1/collections/:id` - Get collection by ID
- `POST /v1/collections` - Create collection
- `GET /v1/collections/:id/memories` - Get memories in collection

#### Search
- `GET /v1/search?q=query` - Search memories
- `GET /v1/search/suggestions?q=query` - Get search suggestions

#### Analytics
- `GET /v1/analytics/stats` - Dashboard statistics
- `GET /v1/analytics/activity` - Recent activity
- `GET /v1/analytics/search-patterns` - Search patterns
- `GET /v1/analytics/memory-growth` - Memory growth over time
- `GET /v1/analytics/tag-distribution` - Tag usage distribution
- `GET /v1/analytics/system` - System status

#### Export
- `GET /v1/export/json` - Export memories as JSON
- `GET /v1/export/markdown` - Export memories as Markdown
- `GET /v1/export/csv` - Export memories as CSV
- `GET /v1/export/formats` - Get available export formats

### Health Check
- `GET /health` - Server health status

## Development

### Prerequisites
- Node.js 18+ and npm
- TypeScript knowledge

### Installation

```bash
cd backend
npm install
```

### Development Mode

```bash
# Build TypeScript files
npm run build

# Start development server with hot reload
npm run dev
```

The server will start on http://localhost:5002

### Production Mode

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5002
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=7d

# Database (future PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/knowledge_rag

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## WebSocket Events

The backend supports real-time updates via WebSocket:

### Connection
```javascript
const ws = new WebSocket('ws://localhost:5002');
```

### Events
- `memory:created` - New memory created
- `memory:updated` - Memory updated
- `memory:deleted` - Memory deleted
- `collection:created` - New collection created
- `collection:updated` - Collection updated
- `collection:deleted` - Collection deleted

### Message Format
```json
{
  "event": "memory:created",
  "data": {
    "id": "memory-id",
    "title": "Memory Title",
    // ... other memory fields
  }
}
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## API Examples

### Create a Memory
```bash
curl -X POST http://localhost:5002/api/v1/memories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Memory",
    "content": "This is the content",
    "contentType": "text",
    "tags": ["example", "test"]
  }'
```

### Search Memories
```bash
curl "http://localhost:5002/api/v1/search?q=RAG&tags=AI,LLM"
```

### Export Memories
```bash
# Export as JSON
curl "http://localhost:5002/api/v1/export/json" -o memories.json

# Export as Markdown
curl "http://localhost:5002/api/v1/export/markdown" -o memories.md
```

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **Rate Limiting**: Configured to prevent abuse
3. **Input Validation**: All inputs are validated before processing
4. **CORS**: Configure allowed origins properly
5. **Environment Variables**: Never commit `.env` files

## Future Enhancements

1. **PostgreSQL Integration**: Replace in-memory database
2. **pgvector**: Add vector similarity search
3. **Redis**: Add caching layer
4. **OAuth**: Support for Google/GitHub login
5. **File Uploads**: Support for attachments
6. **Webhooks**: Notify external services
7. **GraphQL**: Alternative API interface
8. **OpenAPI**: Generate API documentation

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5002
CMD ["npm", "start"]
```

### PM2

```bash
pm2 start dist/index.js --name knowledge-rag-api
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details