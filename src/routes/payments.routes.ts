import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentStatus,
  refundPayment,
} from '../controllers/payments.controller';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPaymentIntentSchema } from '../utils/validators';

const router = Router();

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Payments]
 *     description: Handle Stripe payment events (called by Stripe)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid webhook signature
 */
router.post('/webhook', handleWebhook);

/**
 * @swagger
 * /payments/create-intent:
 *   post:
 *     summary: Create Stripe PaymentIntent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: Booking ID to create payment for
 *     responses:
 *       200:
 *         description: PaymentIntent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     clientSecret:
 *                       type: string
 *                       description: Stripe client secret for frontend
 *                     paymentIntentId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/create-intent',
  authenticate,
  validate(createPaymentIntentSchema),
  createPaymentIntent
);

/**
 * @swagger
 * /payments/confirm:
 *   post:
 *     summary: Confirm payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: Booking ID to confirm payment for
 *     responses:
 *       200:
 *         description: Payment confirmed
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/confirm', optionalAuth, confirmPayment);

/**
 * @swagger
 * /payments/{bookingId}/status:
 *   get:
 *     summary: Get payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                     paymentStatus:
 *                       type: string
 *                     bookingStatus:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:bookingId/status',
  authenticate,
  getPaymentStatus
);

/**
 * @swagger
 * /payments/{bookingId}/refund:
 *   post:
 *     summary: Refund payment (Admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Partial refund amount (optional, full refund if not specified)
 *     responses:
 *       200:
 *         description: Refund processed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:bookingId/refund',
  authenticate,
  requireRole('super-admin', 'brand-admin', 'manager'),
  refundPayment
);

export default router;
