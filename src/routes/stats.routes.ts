import { Router } from 'express';
import { getHomepageStats } from '../controllers/stats.controller';

const router = Router();

router.get('/homepage', getHomepageStats);

export default router;
