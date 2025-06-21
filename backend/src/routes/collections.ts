import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database';
import { Collection, CreateCollectionDto } from '../models/Collection';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  next();
};

// Get all collections
router.get('/',
  asyncHandler(async (req, res) => {
    const userId = 'user-1'; // In production, get from auth
    const collections = await db.getCollections(userId);
    res.json(collections);
  })
);

// Get collection by ID
router.get('/:id',
  param('id').isString(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const collection = await db.getCollectionById(req.params.id, userId);
    
    if (!collection) {
      throw new ApiError('Collection not found', 404, 'NOT_FOUND');
    }
    
    res.json(collection);
  })
);

// Create collection
router.post('/',
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('icon').optional().isString(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const createDto: CreateCollectionDto = req.body;
    
    const collection: Collection = {
      id: uuidv4(),
      ...createDto,
      userId,
      memoryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const created = await db.createCollection(collection);
    res.status(201).json(created);
  })
);

// Get memories in collection
router.get('/:id/memories',
  param('id').isString(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = 'user-1';
    const collection = await db.getCollectionById(req.params.id, userId);
    
    if (!collection) {
      throw new ApiError('Collection not found', 404, 'NOT_FOUND');
    }
    
    // Get memories for this collection
    const allMemories = await db.getMemories(userId, 1000, 0);
    const memories = allMemories.filter(m => m.collectionId === req.params.id);
    
    res.json({
      collection,
      memories,
    });
  })
);

export default router;