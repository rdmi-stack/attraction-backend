"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenants_controller_1 = require("../controllers/tenants.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const validators_1 = require("../utils/validators");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /tenants/by-slug/{slug}:
 *   get:
 *     summary: Get tenant by slug
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/by-slug/:slug', tenants_controller_1.getTenantBySlug);
/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Get all tenants (Admin)
 *     tags: [Tenants]
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
 *           enum: [active, inactive, pending, suspended]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tenants
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validate_middleware_1.validateQuery)(validators_1.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
    search: zod_1.z.string().optional(),
}))), tenants_controller_1.getTenants);
/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     summary: Get tenant by ID (Admin)
 *     tags: [Tenants]
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
 *         description: Tenant details
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_middleware_1.canAccessTenant, tenants_controller_1.getTenantById);
/**
 * @swagger
 * /tenants/{id}/stats:
 *   get:
 *     summary: Get tenant statistics (Admin)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *     responses:
 *       200:
 *         description: Tenant statistics
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id/stats', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_middleware_1.canAccessTenant, (0, validate_middleware_1.validateQuery)(zod_1.z.object({ period: zod_1.z.enum(['7d', '30d', '90d']).optional() })), tenants_controller_1.getTenantStats);
/**
 * @swagger
 * /tenants:
 *   post:
 *     summary: Create tenant (Super Admin)
 *     tags: [Tenants]
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
 *               - domain
 *             properties:
 *               slug:
 *                 type: string
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *               logo:
 *                 type: string
 *               tagline:
 *                 type: string
 *               description:
 *                 type: string
 *               theme:
 *                 type: object
 *                 properties:
 *                   primaryColor:
 *                     type: string
 *                   secondaryColor:
 *                     type: string
 *     responses:
 *       201:
 *         description: Tenant created
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.requireSuperAdmin, (0, validate_middleware_1.validate)(validators_1.createTenantSchema), tenants_controller_1.createTenant);
/**
 * @swagger
 * /tenants/{id}:
 *   patch:
 *     summary: Update tenant (Super Admin)
 *     tags: [Tenants]
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
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, suspended]
 *     responses:
 *       200:
 *         description: Tenant updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireSuperAdmin, (0, validate_middleware_1.validate)(validators_1.updateTenantSchema), tenants_controller_1.updateTenant);
/**
 * @swagger
 * /tenants/{id}:
 *   delete:
 *     summary: Delete tenant (Super Admin)
 *     tags: [Tenants]
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
 *         description: Tenant deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireSuperAdmin, tenants_controller_1.deleteTenant);
exports.default = router;
//# sourceMappingURL=tenants.routes.js.map