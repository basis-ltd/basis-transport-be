import { Router } from 'express';
import authRoutes from './auth.routes';
import transportCardRoutes from './transportCard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transport-cards', transportCardRoutes);

export default router;
