"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attractions_controller_1 = require("../controllers/attractions.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const tenant_middleware_1 = require("../middleware/tenant.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const validators_1 = require("../utils/validators");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /attractions:
 *   get:
 *     summary: List attractions with filters
 *     tags: [Attractions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination city
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: badges
 *         schema:
 *           type: string
 *         description: Filter by badges (comma-separated)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of attractions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attraction'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', auth_middleware_1.optionalAuth, tenant_middleware_1.optionalTenant, (0, validate_middleware_1.validateQuery)(validators_1.paginationSchema.merge(validators_1.attractionFiltersSchema)), attractions_controller_1.getAttractions);
/**
 * @swagger
 * /attractions/featured:
 *   get:
 *     summary: Get featured attractions
 *     tags: [Attractions]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of featured attractions to return
 *     responses:
 *       200:
 *         description: Featured attractions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attraction'
 */
router.get('/featured', tenant_middleware_1.optionalTenant, attractions_controller_1.getFeaturedAttractions);
/**
 * @swagger
 * /attractions/{slug}:
 *   get:
 *     summary: Get attraction by slug
 *     tags: [Attractions]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Attraction slug
 *     responses:
 *       200:
 *         description: Attraction details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Attraction'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:slug', auth_middleware_1.optionalAuth, attractions_controller_1.getAttractionBySlug);
/**
 * @swagger
 * /attractions/{id}/reviews:
 *   get:
 *     summary: Get attraction reviews
 *     tags: [Attractions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attraction ID
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
 *     responses:
 *       200:
 *         description: Attraction reviews
 */
router.get('/:id/reviews', (0, validate_middleware_1.validateQuery)(validators_1.paginationSchema), attractions_controller_1.getAttractionReviews);
/**
 * @swagger
 * /attractions/{id}/availability:
 *   get:
 *     summary: Get attraction availability
 *     tags: [Attractions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attraction ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Specific date
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Month (YYYY-MM format)
 *     responses:
 *       200:
 *         description: Availability data
 */
router.get('/:id/availability', (0, validate_middleware_1.validateQuery)(zod_1.z.object({
    date: zod_1.z.string().optional(),
    month: zod_1.z.string().optional(),
})), attractions_controller_1.getAttractionAvailability);
/**
 * @swagger
 * /attractions:
 *   post:
 *     summary: Create attraction
 *     tags: [Attractions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - title
 *               - description
 *               - category
 *             properties:
 *               slug:
 *                 type: string
 *               title:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               priceFrom:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attraction created
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin', 'manager', 'editor'), (0, validate_middleware_1.validate)(validators_1.createAttractionSchema), attractions_controller_1.createAttraction);
/**
 * @swagger
 * /attractions/admin/{id}:
 *   get:
 *     summary: Get attraction by ID (Admin)
 *     tags: [Attractions]
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
 *         description: Attraction details
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/admin/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, attractions_controller_1.getAttractionById);
/**
 * @swagger
 * /attractions/{id}:
 *   patch:
 *     summary: Update attraction
 *     tags: [Attractions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *     responses:
 *       200:
 *         description: Attraction updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin', 'manager', 'editor'), (0, validate_middleware_1.validate)(validators_1.updateAttractionSchema), attractions_controller_1.updateAttraction);
/**
 * @swagger
 * /attractions/{id}:
 *   delete:
 *     summary: Delete attraction
 *     tags: [Attractions]
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
 *         description: Attraction deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin', 'manager'), attractions_controller_1.deleteAttraction);
exports.default = router;
//# sourceMappingURL=attractions.routes.js.map