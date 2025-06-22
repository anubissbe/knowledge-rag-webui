import { Router } from 'express';
import memoriesRouter from './memories';
import collectionsRouter from './collections';
import analyticsRouter from './analytics';
import searchRouter from './search';
import authRouter from './auth';
import exportRouter from './export';
import preferencesRouter from './preferences';
import memoryVersionsRouter from './memoryVersions';

const router = Router();

// API version prefix
const v1 = '/v1';

// Mount routes
router.use(`${v1}/memories`, memoriesRouter);
router.use(`${v1}/memories`, memoryVersionsRouter);
router.use(`${v1}/collections`, collectionsRouter);
router.use(`${v1}/analytics`, analyticsRouter);
router.use(`${v1}/search`, searchRouter);
router.use(`${v1}/auth`, authRouter);
router.use(`${v1}/export`, exportRouter);
router.use(`${v1}/preferences`, preferencesRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Knowledge RAG WebUI API',
    version: '1.0.0',
    endpoints: {
      memories: `${v1}/memories`,
      memoryVersions: `${v1}/memories/:memoryId/versions`,
      collections: `${v1}/collections`,
      analytics: `${v1}/analytics`,
      search: `${v1}/search`,
      auth: `${v1}/auth`,
      export: `${v1}/export`,
      preferences: `${v1}/preferences`,
    },
  });
});

export default router;