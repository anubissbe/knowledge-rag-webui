import { http, HttpResponse } from 'msw';
import { mockApiResponses } from '../test-utils';

// API endpoint base URL
const API_BASE = process.env.VITE_RAG_URL || 'http://localhost:8002';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json(mockApiResponses.auth.login);
  }),

  http.post(`${API_BASE}/auth/register`, () => {
    return HttpResponse.json(mockApiResponses.auth.register);
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json(mockApiResponses.auth.login.user);
  }),

  // Memory endpoints
  http.get(`${API_BASE}/memories`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    let memories = mockApiResponses.memories.list.data;
    
    // Apply search filter
    if (search) {
      memories = memories.filter(memory => 
        memory.title.toLowerCase().includes(search.toLowerCase()) ||
        memory.content.toLowerCase().includes(search.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return HttpResponse.json({
      data: memories,
      total: memories.length,
      page,
      limit,
    });
  }),

  http.get(`${API_BASE}/memories/:id`, ({ params }) => {
    const memory = mockApiResponses.memories.list.data.find(
      m => m.id === params.id
    );
    
    if (!memory) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(memory);
  }),

  http.post(`${API_BASE}/memories`, async ({ request }) => {
    const body = await request.json();
    const newMemory = {
      ...mockApiResponses.memories.create,
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return HttpResponse.json(newMemory, { status: 201 });
  }),

  http.put(`${API_BASE}/memories/:id`, async ({ params, request }) => {
    const body = await request.json();
    const updatedMemory = {
      ...mockApiResponses.memories.update,
      id: params.id,
      ...body,
      updated_at: new Date().toISOString(),
    };
    
    return HttpResponse.json(updatedMemory);
  }),

  http.delete(`${API_BASE}/memories/:id`, () => {
    return HttpResponse.json(mockApiResponses.memories.delete);
  }),

  http.delete(`${API_BASE}/memories/bulk`, () => {
    return HttpResponse.json({ success: true, deleted: 2 });
  }),

  // Search endpoints
  http.get(`${API_BASE}/search/memories`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return HttpResponse.json([]);
    }
    
    const filteredMemories = mockApiResponses.search.memories.filter(memory =>
      memory.title.toLowerCase().includes(query.toLowerCase()) ||
      memory.content.toLowerCase().includes(query.toLowerCase())
    );
    
    return HttpResponse.json(filteredMemories);
  }),

  http.get(`${API_BASE}/search/suggestions`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return HttpResponse.json([]);
    }
    
    const suggestions = mockApiResponses.search.suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    );
    
    return HttpResponse.json(suggestions);
  }),

  // Collection endpoints
  http.get(`${API_BASE}/collections`, () => {
    return HttpResponse.json(mockApiResponses.collections.list);
  }),

  http.post(`${API_BASE}/collections`, async ({ request }) => {
    const body = await request.json();
    const newCollection = {
      ...mockApiResponses.collections.create,
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return HttpResponse.json(newCollection, { status: 201 });
  }),

  http.put(`${API_BASE}/collections/:id`, async ({ params, request }) => {
    const body = await request.json();
    const updatedCollection = {
      ...mockApiResponses.collections.update,
      id: params.id,
      ...body,
      updated_at: new Date().toISOString(),
    };
    
    return HttpResponse.json(updatedCollection);
  }),

  http.delete(`${API_BASE}/collections/:id`, () => {
    return HttpResponse.json(mockApiResponses.collections.delete);
  }),

  // Graph endpoints
  http.get(`${API_BASE}/graph/nodes`, () => {
    return HttpResponse.json(mockApiResponses.graph.nodes);
  }),

  http.get(`${API_BASE}/graph/edges`, () => {
    return HttpResponse.json(mockApiResponses.graph.edges);
  }),

  http.get(`${API_BASE}/graph`, ({ request }) => {
    const url = new URL(request.url);
    const layout = url.searchParams.get('layout');
    const nodeTypes = url.searchParams.getAll('nodeTypes');
    
    return HttpResponse.json({
      nodes: mockApiResponses.graph.nodes,
      edges: mockApiResponses.graph.edges,
      layout,
      filters: { nodeTypes },
    });
  }),

  // Analytics endpoints
  http.get(`${API_BASE}/analytics/overview`, () => {
    return HttpResponse.json({
      totalMemories: 42,
      totalCollections: 8,
      totalTags: 156,
      recentActivity: 12,
    });
  }),

  http.get(`${API_BASE}/analytics/usage`, () => {
    return HttpResponse.json({
      dailyViews: [10, 15, 8, 22, 18, 25, 30],
      topTags: ['react', 'javascript', 'typescript', 'nodejs', 'testing'],
      memoryGrowth: [40, 41, 41, 42, 42, 42, 42],
    });
  }),

  // Import/Export endpoints
  http.post(`${API_BASE}/import`, async ({ request }) => {
    // Simulate file upload processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return HttpResponse.json({
      success: true,
      imported: 5,
      skipped: 1,
      errors: [],
    });
  }),

  http.post(`${API_BASE}/export`, async ({ request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      downloadUrl: '/api/download/export-123.json',
      format: body.format || 'json',
      count: body.memoryIds?.length || 10,
    });
  }),

  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  // Error simulation endpoints for testing
  http.get(`${API_BASE}/test/error-500`, () => {
    return new HttpResponse(null, { status: 500 });
  }),

  http.get(`${API_BASE}/test/error-404`, () => {
    return new HttpResponse(null, { status: 404 });
  }),

  http.get(`${API_BASE}/test/timeout`, () => {
    // Simulate timeout - never respond
    return new Promise(() => {});
  }),

  // Catch-all for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),
];

export default handlers;