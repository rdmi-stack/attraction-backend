"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantStats = exports.deleteTenant = exports.updateTenant = exports.createTenant = exports.getTenantBySlug = exports.getTenantById = exports.getTenants = void 0;
const Tenant_1 = require("../models/Tenant");
const Attraction_1 = require("../models/Attraction");
const Booking_1 = require("../models/Booking");
const response_1 = require("../utils/response");
const getTenants = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const query = {};
        // Non-super-admins can only see their assigned tenants
        if (req.user?.role !== 'super-admin' && req.user?.assignedTenants.length) {
            query._id = { $in: req.user.assignedTenants };
        }
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { domain: { $regex: search, $options: 'i' } },
            ];
        }
        const [tenants, total] = await Promise.all([
            Tenant_1.Tenant.find(query)
                .sort({ name: 1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            Tenant_1.Tenant.countDocuments(query),
        ]);
        (0, response_1.sendPaginated)(res, tenants, pageNum, limitNum, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getTenants = getTenants;
const getTenantById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenant = await Tenant_1.Tenant.findById(id).lean();
        if (!tenant) {
            (0, response_1.sendError)(res, 'Tenant not found', 404);
            return;
        }
        // Get stats
        const [attractionCount, bookingStats, revenue] = await Promise.all([
            Attraction_1.Attraction.countDocuments({ tenantIds: tenant._id, status: 'active' }),
            Booking_1.Booking.countDocuments({ tenantId: tenant._id }),
            Booking_1.Booking.aggregate([
                { $match: { tenantId: tenant._id, paymentStatus: 'succeeded' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);
        (0, response_1.sendSuccess)(res, {
            ...tenant,
            stats: {
                totalAttractions: attractionCount,
                totalBookings: bookingStats,
                totalRevenue: revenue[0]?.total || 0,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTenantById = getTenantById;
const getTenantBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const tenant = await Tenant_1.Tenant.findOne({ slug, status: 'active' }).lean();
        if (!tenant) {
            (0, response_1.sendError)(res, 'Tenant not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, tenant);
    }
    catch (error) {
        next(error);
    }
};
exports.getTenantBySlug = getTenantBySlug;
const createTenant = async (req, res, next) => {
    try {
        const tenant = await Tenant_1.Tenant.create(req.body);
        (0, response_1.sendSuccess)(res, tenant, 'Tenant created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createTenant = createTenant;
const updateTenant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenant = await Tenant_1.Tenant.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
        if (!tenant) {
            (0, response_1.sendError)(res, 'Tenant not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, tenant, 'Tenant updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateTenant = updateTenant;
const deleteTenant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tenant = await Tenant_1.Tenant.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
        if (!tenant) {
            (0, response_1.sendError)(res, 'Tenant not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, null, 'Tenant deactivated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTenant = deleteTenant;
// Dashboard stats for tenant
const getTenantStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { period = '30d' } = req.query;
        // Calculate date range
        const now = new Date();
        let startDate;
        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        const [totalAttractions, totalBookings, confirmedBookings, revenue, dailyBookings,] = await Promise.all([
            Attraction_1.Attraction.countDocuments({ tenantIds: id, status: 'active' }),
            Booking_1.Booking.countDocuments({ tenantId: id, createdAt: { $gte: startDate } }),
            Booking_1.Booking.countDocuments({
                tenantId: id,
                status: 'confirmed',
                createdAt: { $gte: startDate },
            }),
            Booking_1.Booking.aggregate([
                {
                    $match: {
                        tenantId: id,
                        paymentStatus: 'succeeded',
                        createdAt: { $gte: startDate },
                    },
                },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Booking_1.Booking.aggregate([
                {
                    $match: {
                        tenantId: id,
                        createdAt: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        bookings: { $sum: 1 },
                        revenue: { $sum: '$total' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);
        (0, response_1.sendSuccess)(res, {
            overview: {
                totalAttractions,
                totalBookings,
                confirmedBookings,
                totalRevenue: revenue[0]?.total || 0,
                conversionRate: totalBookings > 0
                    ? ((confirmedBookings / totalBookings) * 100).toFixed(2)
                    : 0,
            },
            dailyData: dailyBookings.map((d) => ({
                date: d._id,
                bookings: d.bookings,
                revenue: d.revenue,
            })),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTenantStats = getTenantStats;
//# sourceMappingURL=tenants.controller.js.map