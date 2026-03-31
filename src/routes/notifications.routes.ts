import { Router } from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validate.middleware';
import { paginationSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

router.get(
  '/',
  authenticate,
  validateQuery(
    paginationSchema.merge(
      z.object({
        status: z.enum(['unread', 'read', 'archived']).optional(),
        type: z.enum(['booking', 'review', 'user', 'system', 'alert']).optional(),
      })
    )
  ),
  getMyNotifications
);

router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/read-all', authenticate, markAllAsRead);
router.patch('/:id/read', authenticate, markAsRead);
router.delete('/clear', authenticate, clearAll);
router.delete('/:id', authenticate, deleteNotification);

export default router;
