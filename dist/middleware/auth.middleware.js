"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessTenant = exports.requireSuperAdmin = exports.requireAdmin = exports.requireRole = exports.optionalAuth = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
const response_1 = require("../utils/response");
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header or cookies
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            (0, response_1.sendError)(res, 'Authentication required', 401);
            return;
        }
        // Verify token
        const decoded = (0, jwt_1.verifyToken)(token);
        // Find user
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 401);
            return;
        }
        if (user.status !== 'active') {
            (0, response_1.sendError)(res, 'Account is not active', 403);
            return;
        }
        req.user = user;
        next();
    }
    catch {
        (0, response_1.sendError)(res, 'Invalid or expired token', 401);
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await User_1.User.findById(decoded.userId);
            if (user && user.status === 'active') {
                req.user = user;
            }
        }
        next();
    }
    catch {
        // Token is invalid, but we continue without user
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Authentication required', 401);
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, response_1.sendError)(res, 'Insufficient permissions', 403);
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        (0, response_1.sendError)(res, 'Authentication required', 401);
        return;
    }
    const adminRoles = ['super-admin', 'brand-admin', 'manager', 'editor', 'viewer'];
    if (!adminRoles.includes(req.user.role)) {
        (0, response_1.sendError)(res, 'Admin access required', 403);
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        (0, response_1.sendError)(res, 'Authentication required', 401);
        return;
    }
    if (req.user.role !== 'super-admin') {
        (0, response_1.sendError)(res, 'Super admin access required', 403);
        return;
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
// Check if user can access specific tenant
const canAccessTenant = (req, res, next) => {
    if (!req.user) {
        (0, response_1.sendError)(res, 'Authentication required', 401);
        return;
    }
    // Super admins can access all tenants
    if (req.user.role === 'super-admin') {
        next();
        return;
    }
    const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
    if (!tenantId) {
        next();
        return;
    }
    // Check if user is assigned to this tenant
    const hasAccess = req.user.assignedTenants.some((t) => t.toString() === tenantId);
    if (!hasAccess) {
        (0, response_1.sendError)(res, 'Access denied to this tenant', 403);
        return;
    }
    next();
};
exports.canAccessTenant = canAccessTenant;
//# sourceMappingURL=auth.middleware.js.map