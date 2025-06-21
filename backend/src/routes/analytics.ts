import { Router } from 'express';
import { query } from 'express-validator';
import { db } from '../services/database';
import { asyncHandler } from '../utils/asyncHandler';
import { wsService } from '../services/websocket';

const router = Router();

// Get dashboard stats
router.get('/stats',
  asyncHandler(async (req, res) => {
    const userId = 'user-1'; // In production, get from auth
    const stats = await db.getAnalytics(userId);
    res.json(stats);
  })
);

// Get recent activity
router.get('/activity',
  query('limit').optional().isInt({ min: 1, max: 50 }),
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Mock recent activity - in production, track actual events
    const activities = [
      {
        type: 'memory_created',
        title: 'Created new memory',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        details: 'Understanding RAG Systems',
      },
      {
        type: 'memory_updated',
        title: 'Updated memory',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        details: 'Vector Databases Comparison',
      },
      {
        type: 'search',
        title: 'Searched for',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        details: 'machine learning',
      },
    ].slice(0, limit);
    
    res.json({ activities });
  })
);

// Get search patterns
router.get('/search-patterns',
  query('days').optional().isInt({ min: 1, max: 365 }),
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    
    // Mock search patterns - in production, track actual searches
    const patterns = [
      {
        query: 'RAG',
        count: 15,
        lastSearched: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        query: 'vector database',
        count: 12,
        lastSearched: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        query: 'machine learning',
        count: 8,
        lastSearched: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ];
    
    res.json({ patterns });
  })
);

// Get memory growth
router.get('/memory-growth',
  query('days').optional().isInt({ min: 1, max: 365 }),
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days as string) || 30;
    
    // Generate mock growth data
    const growth: Array<{ date: string; count: number }> = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      growth.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) + 1,
      });
    }
    
    res.json({ growth });
  })
);

// Get tag distribution
router.get('/tag-distribution',
  query('limit').optional().isInt({ min: 1, max: 50 }),
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Get all memories and count tags
    const memories = await db.getMemories(userId, 1000, 0);
    const tagCounts = new Map<string, number>();
    
    memories.forEach(memory => {
      memory.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    const total = Array.from(tagCounts.values()).reduce((a, b) => a + b, 0);
    const distribution = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    res.json({ distribution });
  })
);

// Get system status
router.get('/system',
  asyncHandler(async (req, res) => {
    res.json({
      websocket: {
        connected: wsService.getConnectionCount(),
        activeUsers: wsService.getActiveUsers(),
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
    });
  })
);

export default router;