import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database';
import { wsService } from '../services/websocket';
import { Memory, CreateMemoryDto } from '../models/Memory';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
// import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  next();
};

// Get all memories
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('collectionId').optional().isString(),
  query('tags').optional().isString(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // In production, get userId from auth middleware
    const userId = 'user-1';
    
    const memories = await db.getMemories(userId, limit, offset);
    const total = memories.length; // In production, get actual total count
    
    res.json({
      memories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

// Get memory by ID
router.get('/:id',
  param('id').isString(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const memory = await db.getMemoryById(req.params.id, userId);
    
    if (!memory) {
      throw new ApiError('Memory not found', 404, 'NOT_FOUND');
    }
    
    res.json(memory);
  })
);

// Create memory
router.post('/',
  body('title').notEmpty().trim(),
  body('content').notEmpty(),
  body('contentType').optional().isIn(['text', 'markdown', 'code', 'link']),
  body('summary').optional().trim(),
  body('collectionId').optional().isString(),
  body('tags').optional().isArray(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const createDto: CreateMemoryDto = req.body;
    
    // Calculate metadata
    const wordCount = createDto.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    const memory: Memory = {
      id: uuidv4(),
      ...createDto,
      contentType: createDto.contentType || 'text',
      tags: createDto.tags || [],
      entities: [], // In production, extract entities
      metadata: {
        wordCount,
        readingTime,
        language: 'en', // In production, detect language
        ...createDto.metadata,
      },
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    
    const created = await db.createMemory(memory);
    
    // Notify WebSocket clients
    wsService.notifyMemoryCreated(userId, created);
    
    res.status(201).json(created);
  })
);

// Update memory
router.put('/:id',
  param('id').isString(),
  body('title').optional().trim(),
  body('content').optional(),
  body('contentType').optional().isIn(['text', 'markdown', 'code', 'link']),
  body('summary').optional().trim(),
  body('collectionId').optional().isString(),
  body('tags').optional().isArray(),
  body('changeDescription').optional().isString().isLength({ max: 500 }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const { changeDescription, ...updates } = req.body;
    
    // Recalculate metadata if content changed
    if (updates.content) {
      const wordCount = updates.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      updates.metadata = {
        ...updates.metadata,
        wordCount,
        readingTime,
      };
    }
    
    const updated = await db.updateMemory(req.params.id, updates, userId, changeDescription);
    
    if (!updated) {
      throw new ApiError('Memory not found', 404, 'NOT_FOUND');
    }
    
    // Notify WebSocket clients
    wsService.notifyMemoryUpdated(userId, updated);
    
    res.json(updated);
  })
);

// Delete memory
router.delete('/:id',
  param('id').isString(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const deleted = await db.deleteMemory(req.params.id, userId);
    
    if (!deleted) {
      throw new ApiError('Memory not found', 404, 'NOT_FOUND');
    }
    
    // Notify WebSocket clients
    wsService.notifyMemoryDeleted(userId, req.params.id);
    
    res.status(204).send();
  })
);

// Bulk operations
router.post('/bulk-delete',
  body('ids').isArray().notEmpty(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const { ids } = req.body;
    
    let deletedCount = 0;
    for (const id of ids) {
      const deleted = await db.deleteMemory(id, userId);
      if (deleted) {
        deletedCount++;
        wsService.notifyMemoryDeleted(userId, id);
      }
    }
    
    res.json({ deleted: deletedCount });
  })
);

export default router;