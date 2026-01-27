"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controller_1 = require("../controllers/bookings.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const tenant_middleware_1 = require("../middleware/tenant.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const validators_1 = require("../utils/validators");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', rate_limit_middleware_1.bookingLimiter, auth_middleware_1.optionalAuth, tenant_middleware_1.optionalTenant, (0, validate_middleware_1.validate)(validators_1.createBookingSchema), bookings_controller_1.createBooking);
/**
 * @swagger
 * /bookings/reference/{reference}:
 *   get:
 *     summary: Get booking by reference
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking reference (e.g., AN-ABC123)
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/reference/:reference', auth_middleware_1.optionalAuth, bookings_controller_1.getBookingByReference);
/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, refunded]
 *     responses:
 *       200:
 *         description: User's bookings
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/my', auth_middleware_1.authenticate, (0, validate_middleware_1.validateQuery)(validators_1.paginationSchema), bookings_controller_1.getMyBookings);
/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/cancel', auth_middleware_1.optionalAuth, bookings_controller_1.cancelBooking);
/**
 * @swagger
 * /bookings/{id}/ticket:
 *   get:
 *     summary: Download booking ticket (PDF)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket PDF URL
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/ticket', auth_middleware_1.optionalAuth, bookings_controller_1.getBookingTicket);
/**
 * @swagger
 * /bookings/admin:
 *   get:
 *     summary: Get all bookings (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, refunded]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All bookings
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/admin', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, tenant_middleware_1.optionalTenant, (0, validate_middleware_1.validateQuery)(validators_1.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'refunded']).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
}))), bookings_controller_1.getAllBookings);
/**
 * @swagger
 * /bookings/admin/stats:
 *   get:
 *     summary: Get booking statistics (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics
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
 *                     totalBookings:
 *                       type: integer
 *                     confirmedBookings:
 *                       type: integer
 *                     pendingBookings:
 *                       type: integer
 *                     cancelledBookings:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/admin/stats', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, tenant_middleware_1.optionalTenant, bookings_controller_1.getBookingStats);
/**
 * @swagger
 * /bookings/admin/{id}:
 *   patch:
 *     summary: Update booking status (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed, refunded]
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, processing, succeeded, failed, refunded]
 *     responses:
 *       200:
 *         description: Booking updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/admin/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin', 'manager'), (0, validate_middleware_1.validate)(zod_1.z.object({
    status: zod_1.z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'refunded']).optional(),
    paymentStatus: zod_1.z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded']).optional(),
})), bookings_controller_1.updateBookingStatus);
exports.default = router;
//# sourceMappingURL=bookings.routes.js.map