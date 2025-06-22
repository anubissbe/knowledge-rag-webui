import { Router } from 'express';
import { param, body, validationResult } from 'express-validator';
import { db } from '../services/database';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all memory templates
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const templates = await db.getMemoryTemplates(userId);
    res.json({ templates });
  })
);

// Get templates by category
router.get('/category/:category',
  authenticateToken,
  param('category').isIn(['meeting', 'learning', 'project', 'research', 'personal', 'code', 'recipe', 'book', 'custom']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { category } = req.params;
    const userId = req.user!.id;
    const templates = await db.getMemoryTemplatesByCategory(category as 'meeting' | 'learning' | 'project' | 'research' | 'personal' | 'code' | 'recipe' | 'book' | 'custom', userId);
    res.json({ templates });
  })
);

// Get specific memory template
router.get('/:templateId',
  authenticateToken,
  param('templateId').isUUID(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { templateId } = req.params;
    const userId = req.user!.id;
    const template = await db.getMemoryTemplate(templateId, userId);
    
    if (!template) {
      throw new ApiError('Template not found', 404, 'NOT_FOUND');
    }

    res.json(template);
  })
);

// Create custom memory template
router.post('/',
  authenticateToken,
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').trim().isLength({ min: 1, max: 500 }),
  body('category').isIn(['meeting', 'learning', 'project', 'research', 'personal', 'code', 'recipe', 'book', 'custom']),
  body('template.title').trim().isLength({ min: 1, max: 200 }),
  body('template.content').trim().isLength({ min: 1, max: 10000 }),
  body('template.contentType').isIn(['text', 'markdown', 'code']),
  body('template.tags').isArray(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user!.id;
    const createDto = {
      ...req.body,
      userId
    };

    const template = await db.createMemoryTemplate(createDto, userId);
    res.status(201).json(template);
  })
);

// Update memory template (only custom templates)
router.put('/:templateId',
  authenticateToken,
  param('templateId').isUUID(),
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ min: 1, max: 500 }),
  body('template.title').optional().trim().isLength({ min: 1, max: 200 }),
  body('template.content').optional().trim().isLength({ min: 1, max: 10000 }),
  body('template.contentType').optional().isIn(['text', 'markdown', 'code']),
  body('template.tags').optional().isArray(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { templateId } = req.params;
    const userId = req.user!.id;
    
    const template = await db.updateMemoryTemplate(templateId, req.body, userId);
    
    if (!template) {
      throw new ApiError('Template not found or not authorized', 404, 'NOT_FOUND');
    }

    res.json(template);
  })
);

// Delete memory template (only custom templates)
router.delete('/:templateId',
  authenticateToken,
  param('templateId').isUUID(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { templateId } = req.params;
    const userId = req.user!.id;
    
    const success = await db.deleteMemoryTemplate(templateId, userId);
    
    if (!success) {
      throw new ApiError('Template not found or not authorized', 404, 'NOT_FOUND');
    }

    res.json({ message: 'Template deleted successfully' });
  })
);

// Use template (increment usage count)
router.post('/:templateId/use',
  authenticateToken,
  param('templateId').isUUID(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { templateId } = req.params;
    const userId = req.user!.id;
    
    await db.incrementTemplateUsage(templateId, userId);
    res.json({ message: 'Template usage recorded' });
  })
);

// Get template usage statistics
router.get('/:templateId/stats',
  authenticateToken,
  param('templateId').isUUID(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { templateId } = req.params;
    const userId = req.user!.id;
    
    const stats = await db.getTemplateStats(templateId, userId);
    
    if (!stats) {
      throw new ApiError('Template not found', 404, 'NOT_FOUND');
    }

    res.json(stats);
  })
);

export default router;