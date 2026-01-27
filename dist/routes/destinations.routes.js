"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const destinations_controller_1 = require("../controllers/destinations.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const validators_1 = require("../utils/validators");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /destinations:
 *   get:
 *     summary: Get all destinations
 *     tags: [Destinations]
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
 *         name: continent
 *         schema:
 *           type: string
 *         description: Filter by continent
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and country
 *       - in: query
 *         name: includeCount
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include attraction count
 *     responses:
 *       200:
 *         description: List of destinations
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
 *                     $ref: '#/components/schemas/Destination'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', (0, validate_middleware_1.validateQuery)(validators_1.paginationSchema.merge(zod_1.z.object({
    continent: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    includeCount: zod_1.z.enum(['true', 'false']).optional(),
}))), destinations_controller_1.getDestinations);
/**
 * @swagger
 * /destinations/featured:
 *   get:
 *     summary: Get featured destinations
 *     tags: [Destinations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: Featured destinations
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
 *                     $ref: '#/components/schemas/Destination'
 */
router.get('/featured', destinations_controller_1.getFeaturedDestinations);
/**
 * @swagger
 * /destinations/{slug}:
 *   get:
 *     summary: Get destination by slug
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Destination details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Destination'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:slug', destinations_controller_1.getDestinationBySlug);
/**
 * @swagger
 * /destinations:
 *   post:
 *     summary: Create destination (Admin)
 *     tags: [Destinations]
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
 *               - name
 *               - country
 *             properties:
 *               slug:
 *                 type: string
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *               continent:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               highlights:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Destination created
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin', 'manager'), (0, validate_middleware_1.validate)(validators_1.createDestinationSchema), destinations_controller_1.createDestination);
/**
 * @swagger
 * /destinations/{id}:
 *   patch:
 *     summary: Update destination (Admin)
 *     tags: [Destinations]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Destination updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin', 'manager'), (0, validate_middleware_1.validate)(validators_1.updateDestinationSchema), destinations_controller_1.updateDestination);
/**
 * @swagger
 * /destinations/{id}:
 *   delete:
 *     summary: Delete destination (Admin)
 *     tags: [Destinations]
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
 *         description: Destination deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin'), destinations_controller_1.deleteDestination);
exports.default = router;
//# sourceMappingURL=destinations.routes.js.map