"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalTenant = exports.requireTenant = exports.resolveTenant = void 0;
const Tenant_1 = require("../models/Tenant");
const response_1 = require("../utils/response");
const resolveTenant = async (req, res, next) => {
    try {
        // Get tenant from header, query, or host
        let tenantIdentifier;
        // Check X-Tenant-ID header first
        if (req.headers['x-tenant-id']) {
            tenantIdentifier = req.headers['x-tenant-id'];
        }
        // Check query parameter
        else if (req.query.tenantId) {
            tenantIdentifier = req.query.tenantId;
        }
        // Try to resolve from host
        else {
            const host = req.headers.host;
            if (host) {
                // Check if it's a subdomain
                const subdomain = host.split('.')[0];
                if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'localhost') {
                    tenantIdentifier = subdomain;
                }
            }
        }
        if (!tenantIdentifier) {
            // No tenant specified, continue without tenant context
            next();
            return;
        }
        // Find tenant by ID, slug, or domain
        const tenant = await Tenant_1.Tenant.findOne({
            $or: [
                { _id: tenantIdentifier },
                { slug: tenantIdentifier },
                { domain: tenantIdentifier },
                { customDomain: tenantIdentifier },
            ],
            status: 'active',
        });
        if (!tenant) {
            (0, response_1.sendError)(res, 'Tenant not found', 404);
            return;
        }
        req.tenant = tenant;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.resolveTenant = resolveTenant;
const requireTenant = (req, res, next) => {
    if (!req.tenant) {
        (0, response_1.sendError)(res, 'Tenant context required', 400);
        return;
    }
    next();
};
exports.requireTenant = requireTenant;
const optionalTenant = async (req, res, next) => {
    try {
        let tenantIdentifier;
        if (req.headers['x-tenant-id']) {
            tenantIdentifier = req.headers['x-tenant-id'];
        }
        else if (req.query.tenantId) {
            tenantIdentifier = req.query.tenantId;
        }
        if (tenantIdentifier) {
            const tenant = await Tenant_1.Tenant.findOne({
                $or: [
                    { _id: tenantIdentifier },
                    { slug: tenantIdentifier },
                    { domain: tenantIdentifier },
                ],
                status: 'active',
            });
            if (tenant) {
                req.tenant = tenant;
            }
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalTenant = optionalTenant;
//# sourceMappingURL=tenant.middleware.js.map