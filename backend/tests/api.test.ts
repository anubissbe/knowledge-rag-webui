import request from 'supertest';

describe('API Endpoints', () => {
  const API_URL = 'http://localhost:5002/api';

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(API_URL)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(API_URL)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Knowledge RAG WebUI API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /v1/memories', () => {
    it('should return paginated memories', async () => {
      const response = await request(API_URL)
        .get('/v1/memories')
        .expect(200);

      expect(response.body).toHaveProperty('memories');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.memories)).toBe(true);
    });
  });

  describe('GET /v1/collections', () => {
    it('should return collections', async () => {
      const response = await request(API_URL)
        .get('/v1/collections')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /v1/analytics/stats', () => {
    it('should return analytics statistics', async () => {
      const response = await request(API_URL)
        .get('/v1/analytics/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalMemories');
      expect(response.body).toHaveProperty('totalCollections');
      expect(response.body).toHaveProperty('totalTags');
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should handle login with demo credentials', async () => {
      const response = await request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'password'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });
  });
});