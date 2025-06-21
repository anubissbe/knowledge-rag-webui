const { test, expect } = require('@playwright/test');

test.describe('Backend API Integration', () => {
  const API_URL = 'http://localhost:5002/api';
  const FRONTEND_URL = 'http://localhost:5173';

  test('Backend health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
  });

  test('API endpoints are accessible', async ({ request }) => {
    // Test main API info
    const apiInfo = await request.get(`${API_URL}/`);
    expect(apiInfo.ok()).toBeTruthy();
    const info = await apiInfo.json();
    expect(info).toHaveProperty('name', 'Knowledge RAG WebUI API');
    expect(info).toHaveProperty('version', '1.0.0');

    // Test memories endpoint
    const memories = await request.get(`${API_URL}/v1/memories`);
    expect(memories.ok()).toBeTruthy();
    const memoriesData = await memories.json();
    expect(memoriesData).toHaveProperty('memories');
    expect(memoriesData).toHaveProperty('pagination');

    // Test collections endpoint
    const collections = await request.get(`${API_URL}/v1/collections`);
    expect(collections.ok()).toBeTruthy();
    expect(Array.isArray(await collections.json())).toBeTruthy();

    // Test analytics endpoint
    const analytics = await request.get(`${API_URL}/v1/analytics/stats`);
    expect(analytics.ok()).toBeTruthy();
    const stats = await analytics.json();
    expect(stats).toHaveProperty('totalMemories');
    expect(stats).toHaveProperty('totalCollections');
  });

  test('Authentication flow works', async ({ request }) => {
    // Test login with demo credentials
    const loginResponse = await request.post(`${API_URL}/v1/auth/login`, {
      data: {
        email: 'demo@example.com',
        password: 'demo'
      }
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    const loginData = await loginResponse.json();
    expect(loginData).toHaveProperty('user');
    expect(loginData).toHaveProperty('token');
    expect(loginData.user).not.toHaveProperty('passwordHash');

    // Test invalid credentials
    const invalidLogin = await request.post(`${API_URL}/v1/auth/login`, {
      data: {
        email: 'invalid@example.com',
        password: 'wrong'
      }
    });
    expect(invalidLogin.status()).toBe(401);
  });

  test('Search functionality works', async ({ request }) => {
    const searchResponse = await request.get(`${API_URL}/v1/search?q=RAG`);
    expect(searchResponse.ok()).toBeTruthy();
    
    const searchData = await searchResponse.json();
    expect(searchData).toHaveProperty('query', 'RAG');
    expect(searchData).toHaveProperty('memories');
    expect(searchData).toHaveProperty('facets');
    expect(searchData).toHaveProperty('processingTime');
  });

  test('Export endpoints work', async ({ request }) => {
    // Test export formats info
    const formats = await request.get(`${API_URL}/v1/export/formats`);
    expect(formats.ok()).toBeTruthy();
    const formatsData = await formats.json();
    expect(formatsData.formats).toHaveLength(3);

    // Test JSON export
    const jsonExport = await request.get(`${API_URL}/v1/export/json`);
    expect(jsonExport.ok()).toBeTruthy();
    const exportData = await jsonExport.json();
    expect(exportData).toHaveProperty('version');
    expect(exportData).toHaveProperty('exportDate');
    expect(exportData).toHaveProperty('memories');
  });

  test('No sensitive data exposed in responses', async ({ request }) => {
    // Get all memories and check for sensitive data
    const response = await request.get(`${API_URL}/v1/memories`);
    const data = await response.json();
    const content = JSON.stringify(data);
    
    // Check that no sensitive patterns are exposed
    expect(content).not.toContain('passwordHash');
    expect(content).not.toContain('your-super-secret-key');
    expect(content).not.toContain('JWT_SECRET');
    
    // Check user endpoint doesn't expose password
    const meResponse = await request.get(`${API_URL}/v1/auth/me`);
    const userData = await meResponse.json();
    expect(userData).not.toHaveProperty('passwordHash');
  });
});