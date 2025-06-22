import { Router } from 'express';
import { param, query, body, validationResult } from 'express-validator';
import { db } from '../services/database';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get memory version history
router.get('/:memoryId/versions',
  authenticateToken,
  param('memoryId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { memoryId } = req.params;
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const versions = await db.getMemoryVersions(memoryId, userId, limit, offset);
    res.json({
      versions,
      pagination: {
        limit,
        offset,
        total: versions.length,
      },
    });
  })
);

// Get specific memory version
router.get('/:memoryId/versions/:version',
  authenticateToken,
  param('memoryId').isUUID(),
  param('version').isInt({ min: 1 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { memoryId, version } = req.params;
    const userId = req.user!.id;
    const versionNumber = parseInt(version);

    const memoryVersion = await db.getMemoryVersion(memoryId, versionNumber, userId);
    if (!memoryVersion) {
      throw new ApiError('Version not found', 404, 'NOT_FOUND');
    }

    res.json(memoryVersion);
  })
);

// Compare two memory versions
router.get('/:memoryId/versions/:fromVersion/compare/:toVersion',
  authenticateToken,
  param('memoryId').isUUID(),
  param('fromVersion').isInt({ min: 1 }),
  param('toVersion').isInt({ min: 1 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { memoryId, fromVersion, toVersion } = req.params;
    const userId = req.user!.id;
    const fromVer = parseInt(fromVersion);
    const toVer = parseInt(toVersion);

    const comparison = await db.compareMemoryVersions(memoryId, fromVer, toVer, userId);
    if (!comparison) {
      throw new ApiError('Versions not found', 404, 'NOT_FOUND');
    }

    res.json(comparison);
  })
);

// Restore memory to specific version
router.post('/:memoryId/versions/:version/restore',
  authenticateToken,
  param('memoryId').isUUID(),
  param('version').isInt({ min: 1 }),
  body('changeDescription').optional().isString().isLength({ max: 500 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const { memoryId, version } = req.params;
    const { changeDescription: _changeDescription } = req.body;
    const userId = req.user!.id;
    const versionNumber = parseInt(version);

    const restoredMemory = await db.restoreMemoryVersion(memoryId, versionNumber, userId, userId);
    if (!restoredMemory) {
      throw new ApiError('Memory or version not found', 404, 'NOT_FOUND');
    }

    res.json({
      message: 'Memory restored successfully',
      memory: restoredMemory,
      restoredFromVersion: versionNumber,
    });
  })
);

export default router;