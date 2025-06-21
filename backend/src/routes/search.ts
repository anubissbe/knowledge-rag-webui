import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { db } from '../services/database';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Search memories
router.get('/',
  query('q').notEmpty().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('tags').optional(),
  query('collections').optional(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('contentType').optional().isIn(['text', 'markdown', 'code', 'link']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = 'user-1'; // In production, get from auth
    const searchQuery = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Parse filters
    const filters = {
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      collections: req.query.collections ? (req.query.collections as string).split(',') : undefined,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      contentType: req.query.contentType as string,
    };

    // Perform search
    const startTime = Date.now();
    const results = await db.searchMemories(userId, searchQuery, filters);
    const processingTime = Date.now() - startTime;

    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);

    // Generate facets for filtering
    const allTags = new Map<string, number>();
    const allContentTypes = new Map<string, number>();
    
    results.forEach(memory => {
      memory.tags.forEach(tag => {
        allTags.set(tag, (allTags.get(tag) || 0) + 1);
      });
      allContentTypes.set(memory.contentType, (allContentTypes.get(memory.contentType) || 0) + 1);
    });

    const facets = {
      tags: Array.from(allTags.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      contentTypes: Array.from(allContentTypes.entries())
        .map(([value, count]) => ({ value, count })),
    };

    res.json({
      query: searchQuery,
      memories: paginatedResults,
      facets,
      pagination: {
        page,
        limit,
        total: results.length,
        pages: Math.ceil(results.length / limit),
      },
      processingTime,
    });
  })
);

// Get search suggestions
router.get('/suggestions',
  query('q').notEmpty().trim(),
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const query = (req.query.q as string).toLowerCase();
    
    // Get all memories for suggestions
    const memories = await db.getMemories(userId, 100, 0);
    
    // Extract unique terms from titles and tags
    const suggestions = new Set<string>();
    
    memories.forEach(memory => {
      // Add matching titles
      if (memory.title.toLowerCase().includes(query)) {
        suggestions.add(memory.title);
      }
      
      // Add matching tags
      memory.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          suggestions.add(tag);
        }
      });
    });
    
    res.json({
      suggestions: Array.from(suggestions).slice(0, 10),
    });
  })
);

export default router;