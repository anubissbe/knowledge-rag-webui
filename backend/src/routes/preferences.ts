import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../services/database';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Update search preferences
router.put('/search',
  authenticateToken,
  body('filters').isObject(),
  body('filters.tags').optional().isArray(),
  body('filters.entities').optional().isArray(),
  body('filters.collections').optional().isArray(),
  body('filters.dateRange').optional().isString(),
  body('filters.contentType').optional().isString(),
  body('filters.sortBy').optional().isIn(['relevance', 'date', 'title']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = req.user!.id;
    const { filters } = req.body;

    // Get current user
    const user = await db.getUserById(userId);
    if (!user) {
      throw new ApiError('User not found', 404, 'NOT_FOUND');
    }

    // Update search preferences
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        search: {
          filters,
          savedAt: new Date().toISOString()
        }
      },
      updatedAt: new Date().toISOString()
    };

    await db.updateUser(userId, updatedUser);

    res.json({
      message: 'Search preferences updated successfully',
      preferences: updatedUser.preferences.search
    });
  })
);

// Get search preferences
router.get('/search',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    
    const user = await db.getUserById(userId);
    if (!user) {
      throw new ApiError('User not found', 404, 'NOT_FOUND');
    }

    res.json({
      preferences: user.preferences.search || null
    });
  })
);

export default router;