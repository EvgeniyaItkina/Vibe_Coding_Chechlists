// routes/api.ts - Main API routes aggregator
import express from 'express';
import authRoutes from './auth/auth.js';
import checklistRoutes from './checklists/checklists.js';
import itemRoutes from './items/items.js';
import templateRoutes from './templates/templates.js';

const router = express.Router();

// Mount sub-routers
router.use('/', authRoutes);
router.use('/checklists', checklistRoutes);
router.use('/items', itemRoutes);
router.use('/templates', templateRoutes);

export default router;