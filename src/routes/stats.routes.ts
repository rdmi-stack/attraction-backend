import { Router } from 'express';
import { getHomepageStats, getAdminStats } from '../controllers/stats.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/homepage', getHomepageStats);
router.get('/admin', authenticate, requireAdmin, getAdminStats);

export default router;
