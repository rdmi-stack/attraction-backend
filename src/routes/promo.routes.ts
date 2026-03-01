import { Router } from 'express';
import {
  validatePromoCode,
  getPromoCodes,
  getPromoCodeStats,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from '../controllers/promo.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public — validate a promo code
router.post('/validate', validatePromoCode);

// Admin — CRUD
router.get('/', authenticate, requireAdmin, getPromoCodes);
router.get('/stats', authenticate, requireAdmin, getPromoCodeStats);
router.get('/:id', authenticate, requireAdmin, getPromoCodeById);
router.post('/', authenticate, requireAdmin, createPromoCode);
router.patch('/:id', authenticate, requireAdmin, updatePromoCode);
router.delete('/:id', authenticate, requireAdmin, deletePromoCode);

export default router;
