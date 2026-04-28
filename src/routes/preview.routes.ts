import { Router } from 'express';
import {
  unlockPreview,
  lookupPreviewTenant,
  getPreviewCode,
  regeneratePreviewCode,
} from '../controllers/preview.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public — gate page hits these
router.get('/lookup', lookupPreviewTenant);
router.post('/unlock', unlockPreview);

// Admin — view/rotate per-tenant code
router.get('/admin/code/:tenantId', authenticate, requireAdmin, getPreviewCode);
router.post('/admin/regenerate/:tenantId', authenticate, requireAdmin, regeneratePreviewCode);

export default router;
