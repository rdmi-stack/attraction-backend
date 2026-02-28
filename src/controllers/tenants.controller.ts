import { Response, NextFunction } from 'express';
import { Tenant } from '../models/Tenant';
import { Attraction } from '../models/Attraction';
import { Booking } from '../models/Booking';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';

export const getTenants = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: Record<string, unknown> = {};

    // Non-super-admins can only see their assigned tenants
    if (req.user?.role !== 'super-admin') {
      query._id = { $in: req.user?.assignedTenants ?? [] };
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
      Tenant.find(query)
        .sort({ name: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Tenant.countDocuments(query),
    ]);

    sendPaginated(res, tenants, pageNum, limitNum, total);
  } catch (error) {
    next(error);
  }
};

export const getTenantById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findById(id).lean();

    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    // Get stats
    const [attractionCount, bookingStats, revenue] = await Promise.all([
      Attraction.countDocuments({ tenantIds: tenant._id, status: 'active' }),
      Booking.countDocuments({ tenantId: tenant._id }),
      Booking.aggregate([
        { $match: { tenantId: tenant._id, paymentStatus: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    sendSuccess(res, {
      ...tenant,
      stats: {
        totalAttractions: attractionCount,
        totalBookings: bookingStats,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public endpoint – returns all active + coming_soon tenants (no auth required).
 * Used by the frontend LayoutWrapper for tenant resolution.
 */
export const getPublicTenants = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenants = await Tenant.find({ status: { $in: ['active', 'coming_soon'] } })
      .select('slug name domain logo tagline description theme designMode defaultCurrency defaultLanguage supportedLanguages status seoSettings contactInfo')
      .sort({ name: 1 })
      .lean();

    sendSuccess(res, tenants);
  } catch (error) {
    next(error);
  }
};

/**
 * Public endpoint – returns a single tenant by ID (no auth required).
 * Includes all fields for the admin detail page fallback.
 */
export const getPublicTenantById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id).lean();

    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    sendSuccess(res, tenant);
  } catch (error) {
    next(error);
  }
};

export const getTenantBySlug = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const tenant = await Tenant.findOne({ slug, status: { $in: ['active', 'coming_soon'] } }).lean();

    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    sendSuccess(res, tenant);
  } catch (error) {
    next(error);
  }
};

export const createTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenant = await Tenant.create(req.body);
    sendSuccess(res, tenant, 'Tenant created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    sendSuccess(res, tenant, 'Tenant updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );

    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    sendSuccess(res, null, 'Tenant deactivated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Brand-admin safe endpoint – only allows updating a restricted set of fields.
 * Full tenant update (name, status, slug, domain, etc.) stays super-admin only.
 */
export const updateTenantSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Allow-list of fields brand-admins may change on their own sites
    const allowedFields = [
      'contactInfo',
      'socialLinks',
      'paymentSettings',
      'seoSettings',
      'aiSettings',
      'theme',
      'fonts',
      'designMode',
      'tagline',
      'description',
      'logo',
      'logoDark',
      'favicon',
      'defaultCurrency',
      'defaultLanguage',
      'supportedLanguages',
      'timezone',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      sendError(res, 'No valid fields to update', 400);
      return;
    }

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    sendSuccess(res, tenant, 'Site settings updated successfully');
  } catch (error) {
    next(error);
  }
};

// Dashboard stats for tenant
export const getTenantStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

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

    const [
      totalAttractions,
      totalBookings,
      confirmedBookings,
      revenue,
      dailyBookings,
    ] = await Promise.all([
      Attraction.countDocuments({ tenantIds: id, status: 'active' }),
      Booking.countDocuments({ tenantId: id, createdAt: { $gte: startDate } }),
      Booking.countDocuments({
        tenantId: id,
        status: 'confirmed',
        createdAt: { $gte: startDate },
      }),
      Booking.aggregate([
        {
          $match: {
            tenantId: id,
            paymentStatus: 'succeeded',
            createdAt: { $gte: startDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Booking.aggregate([
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

    sendSuccess(res, {
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
  } catch (error) {
    next(error);
  }
};
