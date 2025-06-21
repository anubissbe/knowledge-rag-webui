import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { db } from '../services/database';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
import { Memory } from '../models/Memory';

const router = Router();

// Export memories as JSON
router.get('/json',
  query('ids').optional(),
  query('collectionId').optional().isString(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = 'user-1'; // In production, get from auth
    let memories: Memory[] = [];

    if (req.query.ids) {
      // Export specific memories
      const ids = (req.query.ids as string).split(',');
      memories = await Promise.all(
        ids.map(id => db.getMemoryById(id, userId))
      ).then(results => results.filter(Boolean) as Memory[]);
    } else if (req.query.collectionId) {
      // Export all memories from a collection
      const allMemories = await db.getMemories(userId, 1000, 0);
      memories = allMemories.filter(m => m.collectionId === req.query.collectionId);
    } else {
      // Export all memories
      memories = await db.getMemories(userId, 1000, 0);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="memories-export-${Date.now()}.json"`);
    res.json({
      version: '1.0',
      exportDate: new Date().toISOString(),
      memories,
    });
  })
);

// Export memories as Markdown
router.get('/markdown',
  query('ids').optional(),
  query('collectionId').optional().isString(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = 'user-1';
    let memories: Memory[] = [];

    if (req.query.ids) {
      const ids = (req.query.ids as string).split(',');
      memories = await Promise.all(
        ids.map(id => db.getMemoryById(id, userId))
      ).then(results => results.filter(Boolean) as Memory[]);
    } else if (req.query.collectionId) {
      const allMemories = await db.getMemories(userId, 1000, 0);
      memories = allMemories.filter(m => m.collectionId === req.query.collectionId);
    } else {
      memories = await db.getMemories(userId, 1000, 0);
    }

    // Convert to Markdown
    let markdown = '# Knowledge RAG Export\n\n';
    markdown += `_Exported on ${new Date().toLocaleString()}_\n\n`;
    markdown += `_Total memories: ${memories.length}_\n\n---\n\n`;

    // Group by collection if applicable
    const collections = await db.getCollections(userId);
    const collectionMap = new Map(collections.map(c => [c.id, c]));

    memories.forEach(memory => {
      const collection = memory.collectionId ? collectionMap.get(memory.collectionId) : null;
      
      markdown += `## ${memory.title}\n\n`;
      if (collection) {
        markdown += `**Collection:** ${collection.name}\n\n`;
      }
      if (memory.tags.length > 0) {
        markdown += `**Tags:** ${memory.tags.join(', ')}\n\n`;
      }
      markdown += `**Created:** ${new Date(memory.createdAt).toLocaleString()}\n\n`;
      
      if (memory.contentType === 'markdown' || memory.contentType === 'text') {
        markdown += memory.content + '\n\n';
      } else if (memory.contentType === 'code') {
        markdown += '```\n' + memory.content + '\n```\n\n';
      } else if (memory.contentType === 'link') {
        markdown += `[${memory.content}](${memory.content})\n\n`;
      }
      
      markdown += '---\n\n';
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="memories-export-${Date.now()}.md"`);
    res.send(markdown);
  })
);

// Export memories as CSV
router.get('/csv',
  query('ids').optional(),
  query('collectionId').optional().isString(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
    }

    const userId = 'user-1';
    let memories: Memory[] = [];

    if (req.query.ids) {
      const ids = (req.query.ids as string).split(',');
      memories = await Promise.all(
        ids.map(id => db.getMemoryById(id, userId))
      ).then(results => results.filter(Boolean) as Memory[]);
    } else if (req.query.collectionId) {
      const allMemories = await db.getMemories(userId, 1000, 0);
      memories = allMemories.filter(m => m.collectionId === req.query.collectionId);
    } else {
      memories = await db.getMemories(userId, 1000, 0);
    }

    // Convert to CSV
    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;
    
    let csv = 'ID,Title,Content,Tags,Collection,Type,Created,Updated\n';
    
    const collections = await db.getCollections(userId);
    const collectionMap = new Map(collections.map(c => [c.id, c]));

    memories.forEach(memory => {
      const collection = memory.collectionId ? collectionMap.get(memory.collectionId) : null;
      csv += [
        escapeCSV(memory.id),
        escapeCSV(memory.title),
        escapeCSV(memory.content),
        escapeCSV(memory.tags.join(', ')),
        escapeCSV(collection?.name || ''),
        escapeCSV(memory.contentType),
        escapeCSV(memory.createdAt),
        escapeCSV(memory.updatedAt),
      ].join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="memories-export-${Date.now()}.csv"`);
    res.send(csv);
  })
);

// Get export formats info
router.get('/formats',
  asyncHandler(async (req, res) => {
    res.json({
      formats: [
        {
          id: 'json',
          name: 'JSON',
          description: 'Full data export in JSON format',
          mimeType: 'application/json',
          extension: '.json',
        },
        {
          id: 'markdown',
          name: 'Markdown',
          description: 'Human-readable Markdown format',
          mimeType: 'text/markdown',
          extension: '.md',
        },
        {
          id: 'csv',
          name: 'CSV',
          description: 'Spreadsheet-compatible CSV format',
          mimeType: 'text/csv',
          extension: '.csv',
        },
      ],
    });
  })
);

export default router;