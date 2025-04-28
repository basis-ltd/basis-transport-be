import { Router } from 'express';
import authRoutes from './auth.routes';
import transportCardRoutes from './transportCard.routes';
import auditRoutes from './audit.routes';
import { auditContextMiddleware } from '../middlewares/auditContext.middleware';

const router = Router();

/**
 * AUTH ROUTES
 */
router.use('/auth', authRoutes);

// AUDIT CONTEXT MIDDLEWARE
router.use(auditContextMiddleware);

/**
 * ALL ROUTES BELOW HAVE AUDIT CONTEXT AVAILABLE
 */

// TRANSPORT CARD ROUTES
router.use('/transport-cards', transportCardRoutes);

// AUDIT ROUTES
router.use('/audit-logs', auditRoutes);

export default router;
