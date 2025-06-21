# API Integration

Knowledge RAG WebUI now uses real API endpoints instead of mock data. This document describes the API integration architecture and usage.

## 🏗️ Architecture

### API Services Structure
```
src/services/api/
├── index.ts           # Barrel export for all API services
├── baseApi.ts         # Base API client with error handling
├── memoryApi.ts       # Memory CRUD operations
├── searchApi.ts       # Search functionality
├── analyticsApi.ts    # Dashboard analytics
└── exportApi.ts       # Data export functionality
```

### Base API Client
The base API client provides:
- Centralized error handling with toast notifications
- Authentication support
- Request/response interceptors
- TypeScript type safety
- Automatic JSON parsing

## 🔌 API Endpoints

### Memory API
```typescript
// Get all memories with pagination and filters
GET /api/memories?page=1&pageSize=20&tags=AI,ML&search=query

// Get single memory
GET /api/memories/:id

// Create memory
POST /api/memories
Body: { title, content, tags?, userId?, metadata? }

// Update memory
PUT /api/memories/:id
Body: { title?, content?, tags?, metadata? }

// Delete memory
DELETE /api/memories/:id

// Bulk operations
POST /api/memories/bulk-delete
Body: { ids: string[] }

POST /api/memories/bulk-tags
Body: { ids: string[], tags: string[] }

POST /api/memories/bulk-collection
Body: { ids: string[], collectionId: string }

// Related memories
GET /api/memories/:id/related?limit=5
```

### Search API
```typescript
// Search memories
GET /api/search?q=query&page=1&pageSize=20&tags=AI,ML&sortBy=relevance

// Get search suggestions
GET /api/search/suggestions?q=query&limit=5

// Search history
GET /api/search/history?limit=10
DELETE /api/search/history

// Popular searches
GET /api/search/popular?limit=10
```

### Analytics API
```typescript
// Dashboard stats
GET /api/analytics/stats

// Recent activity
GET /api/analytics/activity?limit=10

// Search patterns
GET /api/analytics/search-patterns?days=7

// Memory growth
GET /api/analytics/memory-growth?days=30

// Tag distribution
GET /api/analytics/tag-distribution?limit=10

// Full analytics data
GET /api/analytics/full
```

### Export API
```typescript
// Export all data
GET /api/export?format=json&includeMetadata=true&tags=AI,ML

// Export specific memories
POST /api/export/memories
Body: { format, memoryIds, includeMetadata, includeTags }

// Export single memory
GET /api/export/memories/:id?format=markdown
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3001

# Optional: API Authentication
VITE_API_KEY=your_api_key_here
```

### API Client Configuration
```typescript
// Custom API client instance
import { ApiClient } from './services/api';

const customApi = new ApiClient('https://api.example.com');
```

## 🔄 Data Flow

### Component → API Service → Backend
1. Component calls API service method
2. API service uses base client to make request
3. Base client handles errors and shows toast notifications
4. Response data is transformed if needed
5. Component receives typed data

### Example Usage
```typescript
import { memoryApi } from '../services/api';
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const toast = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await memoryApi.getMemories(1, 20);
        setMemories(response.memories);
      } catch (error) {
        // Error is already handled by API client
        // Additional handling can be added here
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, []);
}
```

## 🚨 Error Handling

### Automatic Error Handling
The base API client automatically:
- Shows toast notifications for errors
- Handles common HTTP status codes
- Provides user-friendly error messages

### Error Types
- **401 Unauthorized**: "Please log in to continue"
- **403 Forbidden**: "You do not have permission"
- **404 Not Found**: "Resource not found"
- **500+ Server Error**: "Something went wrong"

### Custom Error Handling
```typescript
try {
  const data = await memoryApi.getMemory(id);
} catch (error) {
  // Custom handling in addition to automatic toast
  if (error.status === 404) {
    navigate('/memories');
  }
}
```

## 🔐 Authentication

### API Key Authentication
```typescript
// In baseApi.ts
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': import.meta.env.VITE_API_KEY,
  ...options?.headers,
}
```

### JWT Token Authentication
```typescript
// Add to baseApi.ts
const token = localStorage.getItem('auth_token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

## 🧪 Testing

### Mock API for Testing
```typescript
// __tests__/mocks/api.ts
export const mockMemoryApi = {
  getMemories: jest.fn().mockResolvedValue({
    memories: [],
    total: 0,
    page: 1,
    pageSize: 20
  }),
  // ... other methods
};

// In test file
jest.mock('../services/api', () => ({
  memoryApi: mockMemoryApi
}));
```

### Integration Tests
```typescript
// Use MSW for API mocking
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/memories', (req, res, ctx) => {
    return res(ctx.json({ memories: [] }));
  })
);
```

## 📊 Performance

### Request Optimization
- Pagination for large datasets
- Debounced search requests
- Parallel requests where possible
- Request caching (future enhancement)

### Bundle Size
- API services use tree shaking
- Import only what you need
- Lazy load API services for routes

## 🔮 Future Enhancements

### Planned Features
1. **Request Caching**: Cache GET requests
2. **Request Retry**: Retry failed requests
3. **Offline Queue**: Queue mutations when offline
4. **Optimistic Updates**: Update UI before server confirms
5. **GraphQL Support**: Alternative to REST API
6. **Real-time Subscriptions**: Beyond WebSocket events

### API Versioning
```typescript
// Future: API version in headers
headers: {
  'API-Version': '2024-01-01',
  ...
}
```

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure backend allows frontend origin
- Check API URL configuration
- Verify credentials are included if needed

#### 404 Errors
- Verify API endpoint URLs
- Check backend is running
- Ensure correct port configuration

#### Network Errors
- Check internet connection
- Verify API server is accessible
- Check for proxy/firewall issues

### Debug Mode
```typescript
// Enable debug logging
if (import.meta.env.DEV) {
  console.log('API Request:', endpoint, options);
  console.log('API Response:', response);
}
```

## 📚 Migration Guide

### From Mock Data to API
1. Replace mock data imports with API service imports
2. Update component state management
3. Add loading states
4. Handle errors appropriately
5. Update tests to mock API calls

### Example Migration
```typescript
// Before (Mock Data)
const [memories] = useState(mockMemories);

// After (API)
const [memories, setMemories] = useState<Memory[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  memoryApi.getMemories().then(response => {
    setMemories(response.memories);
    setIsLoading(false);
  });
}, []);
```