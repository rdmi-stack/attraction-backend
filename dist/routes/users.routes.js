"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const validators_1 = require("../utils/validators");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', auth_middleware_1.authenticate, users_controller_1.getProfile);
/**
 * @swagger
 * /users/wishlist:
 *   get:
 *     summary: Get user wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist attractions
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/wishlist', auth_middleware_1.authenticate, users_controller_1.getWishlist);
/**
 * @swagger
 * /users/wishlist/{attractionId}:
 *   post:
 *     summary: Add attraction to wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attractionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Added to wishlist
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/wishlist/:attractionId', auth_middleware_1.authenticate, users_controller_1.addToWishlist);
/**
 * @swagger
 * /users/wishlist/{attractionId}:
 *   delete:
 *     summary: Remove attraction from wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attractionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed from wishlist
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/wishlist/:attractionId', auth_middleware_1.authenticate, users_controller_1.removeFromWishlist);
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
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
 *         description: List of users
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, validate_middleware_1.validateQuery)(validators_1.paginationSchema.merge(zod_1.z.object({
    role: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
    search: zod_1.z.string().optional(),
}))), users_controller_1.getUsers);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Admin)
 *     tags: [Users]
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
 *         description: User details
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, users_controller_1.getUserById);
/**
 * @swagger
 * /users/invite:
 *   post:
 *     summary: Invite new user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super-admin, brand-admin, manager, editor, viewer]
 *               assignedTenants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: User invited
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/invite', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin'), (0, validate_middleware_1.validate)(zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    role: zod_1.z.enum(['super-admin', 'brand-admin', 'manager', 'editor', 'viewer']),
    assignedTenants: zod_1.z.array(zod_1.z.string()).optional(),
})), users_controller_1.inviteUser);
/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user (Admin)
 *     tags: [Users]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super-admin, brand-admin, manager, editor, viewer]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, suspended]
 *               assignedTenants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('super-admin', 'brand-admin'), (0, validate_middleware_1.validate)(zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    role: zod_1.z.enum(['super-admin', 'brand-admin', 'manager', 'editor', 'viewer']).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
    assignedTenants: zod_1.z.array(zod_1.z.string()).optional(),
})), users_controller_1.updateUser);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Super Admin)
 *     tags: [Users]
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
 *         description: User deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireSuperAdmin, users_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.routes.js.map