"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payments_controller_1 = require("../controllers/payments.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
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
router.post('/webhook', (0, express_1.raw)({ type: 'application/json' }), payments_controller_1.handleWebhook);
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
router.post('/create-intent', auth_middleware_1.optionalAuth, (0, validate_middleware_1.validate)(validators_1.createPaymentIntentSchema), payments_controller_1.createPaymentIntent);
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
router.get('/:bookingId/status', auth_middleware_1.optionalAuth, payments_controller_1.getPaymentStatus);
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
router.post('/:bookingId/refund', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin', 'manager'), payments_controller_1.refundPayment);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map