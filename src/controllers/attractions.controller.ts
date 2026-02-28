import { Response, NextFunction } from 'express';
import { Attraction } from '../models/Attraction';
import { Review } from '../models/Review';
import { Availability } from '../models/Availability';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';
import { Types } from 'mongoose';

interface AttractionQuery {
  status?: string;
  category?: string;
  'destination.city'?: { $regex: RegExp };
  priceFrom?: { $gte?: number; $lte?: number };
  rating?: { $gte: number };
  badges?: { $in: string[] };
  $text?: { $search: string };
  tenantIds?: { $in: Types.ObjectId[] } | { $size: number };
}

export const getAttractions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      category,
      destination,
      minPrice,
      maxPrice,
      rating,
      badges,
      search,
      status = 'active',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // Build query
    const query: AttractionQuery = {};

    // Only show active attractions for public API
    if (!req.user || req.user.role === 'customer') {
      query.status = 'active';
    } else if (status) {
      query.status = status as string;
    }

    // Filter by tenant context
    if (req.tenant) {
      query.tenantIds = { $in: [req.tenant._id] };
    } else if (req.user && req.user.role !== 'super-admin') {
      // Non-super-admin without explicit tenant context: scope to assigned tenants
      const adminRoles = ['brand-admin', 'manager', 'editor', 'viewer'];
      if (adminRoles.includes(req.user.role) && req.user.assignedTenants?.length > 0) {
        query.tenantIds = { $in: req.user.assignedTenants };
      } else if (adminRoles.includes(req.user.role)) {
        // Admin with no assigned tenants sees nothing
        sendPaginated(res, [], pageNum, limitNum, 0);
        return;
      }
    }

    if (category) {
      query.category = category as string;
    }

    if (destination) {
      query['destination.city'] = { $regex: new RegExp(destination as string, 'i') };
    }

    if (minPrice || maxPrice) {
      query.priceFrom = {};
      if (minPrice) query.priceFrom.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.priceFrom.$lte = parseFloat(maxPrice as string);
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating as string) };
    }

    if (badges) {
      query.badges = { $in: (badges as string).split(',') };
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Build sort
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { priceFrom: 1 };
    else if (sort === 'price-high') sortOption = { priceFrom: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'popularity') sortOption = { reviewCount: -1 };
    else if (sort === 'recommended') sortOption = { featured: -1, rating: -1 };

    // Execute query
    const [attractions, total] = await Promise.all([
      Attraction.find(query)
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Attraction.countDocuments(query),
    ]);

    // Cache for 2 minutes (dynamic based on search params)
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300, stale-while-revalidate=600');

    sendPaginated(res, attractions, pageNum, limitNum, total);
  } catch (error) {
    next(error);
  }
};

export const getAttractionBySlug = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const attraction = await Attraction.findOne({ slug, status: 'active' });

    if (!attraction) {
      sendError(res, 'Attraction not found', 404);
      return;
    }

    // For authenticated admin users (non-super-admin), verify they have access to this attraction's tenants
    if (req.user && req.user.role !== 'super-admin' && req.user.role !== 'customer' && req.user.role !== 'guest') {
      const userTenantIds = (req.user.assignedTenants || []).map((t) => t.toString());
      const attractionTenantIds = (attraction.tenantIds || []).map((t) => t.toString());
      const hasAccess = attractionTenantIds.some((tid) => userTenantIds.includes(tid));
      if (!hasAccess && userTenantIds.length > 0) {
        sendError(res, 'Attraction not found', 404);
        return;
      }
    }

    sendSuccess(res, attraction);
  } catch (error) {
    next(error);
  }
};

export const getAttractionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const attraction = await Attraction.findById(id);

    if (!attraction) {
      sendError(res, 'Attraction not found', 404);
      return;
    }

    // For non-super-admin users, verify they have access to this attraction's tenants
    if (req.user && req.user.role !== 'super-admin') {
      const userTenantIds = (req.user.assignedTenants || []).map((t) => t.toString());
      const attractionTenantIds = (attraction.tenantIds || []).map((t) => t.toString());
      const hasAccess = attractionTenantIds.some((tid) => userTenantIds.includes(tid));
      if (!hasAccess && userTenantIds.length > 0) {
        sendError(res, 'Access denied to this attraction', 403);
        return;
      }
    }

    sendSuccess(res, attraction);
  } catch (error) {
    next(error);
  }
};

export const getAttractionReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [reviews, total] = await Promise.all([
      Review.find({ attractionId: id, status: 'approved' })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ attractionId: id, status: 'approved' }),
    ]);

    // Calculate rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { attractionId: new Types.ObjectId(id), status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingBreakdown.forEach((r) => {
      breakdown[r._id as number] = r.count;
    });

    sendSuccess(res, { reviews, ratingBreakdown: breakdown, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) {
    next(error);
  }
};

export const getAttractionAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, month } = req.query;

    const attraction = await Attraction.findById(id);

    if (!attraction) {
      sendError(res, 'Attraction not found', 404);
      return;
    }

    // Calculate date range
    const startDate = date ? new Date(date as string) : new Date();
    startDate.setHours(0, 0, 0, 0);

    let endDate: Date;
    if (month) {
      const monthDate = new Date(month as string);
      endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    } else {
      endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    endDate.setHours(23, 59, 59, 999);

    // Query real availability from database
    const availabilityRecords = await Availability.find({
      attractionId: id,
      date: { $gte: startDate, $lte: endDate },
      isBlocked: false,
    }).sort({ date: 1 }).lean();

    // Build a map of existing availability
    const availMap = new Map<string, typeof availabilityRecords[0]>();
    for (const record of availabilityRecords) {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      availMap.set(dateStr, record);
    }

    // Generate response for each day in range
    const availability: Array<{
      date: string;
      available: boolean;
      timeSlots?: Array<{ time: string; available: boolean; spotsLeft: number }>;
    }> = [];

    const defaultCapacity = 25; // Default capacity when no availability record exists
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const record = availMap.get(dateStr);

      if (record) {
        // Use real data from database
        if (record.timeSlots && record.timeSlots.length > 0) {
          availability.push({
            date: dateStr,
            available: record.timeSlots.some((s) => s.capacity - s.booked > 0),
            timeSlots: record.timeSlots.map((s) => ({
              time: s.time,
              available: s.capacity - s.booked > 0,
              spotsLeft: Math.max(0, s.capacity - s.booked),
            })),
          });
        } else {
          const spotsLeft = (record.allDayCapacity || defaultCapacity) - (record.allDayBooked || 0);
          availability.push({
            date: dateStr,
            available: spotsLeft > 0,
          });
        }
      } else {
        // No record — generate default availability
        if (attraction.availability?.type === 'time-slots') {
          availability.push({
            date: dateStr,
            available: true,
            timeSlots: [
              { time: '09:00', available: true, spotsLeft: defaultCapacity },
              { time: '10:00', available: true, spotsLeft: defaultCapacity },
              { time: '11:00', available: true, spotsLeft: defaultCapacity },
              { time: '14:00', available: true, spotsLeft: defaultCapacity },
              { time: '15:00', available: true, spotsLeft: defaultCapacity },
              { time: '16:00', available: true, spotsLeft: defaultCapacity },
            ],
          });
        } else {
          availability.push({
            date: dateStr,
            available: true,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    sendSuccess(res, { availability });
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
export const createAttraction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Non-super-admins can only assign attractions to their own tenants
    if (req.user?.role !== 'super-admin' && req.body.tenantIds?.length) {
      const assignedSet = new Set((req.user?.assignedTenants || []).map((t: Types.ObjectId) => t.toString()));
      const unauthorized = req.body.tenantIds.filter((id: string) => !assignedSet.has(id));
      if (unauthorized.length > 0) {
        sendError(res, 'Cannot assign attraction to a tenant you do not manage', 403);
        return;
      }
    }

    const attractionData = {
      ...req.body,
      createdBy: req.user?._id,
    };

    const attraction = await Attraction.create(attractionData);

    sendSuccess(res, attraction, 'Attraction created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateAttraction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Non-super-admins can only update attractions in their assigned tenants
    if (req.user?.role !== 'super-admin') {
      const existing = await Attraction.findById(id);
      if (!existing) {
        sendError(res, 'Attraction not found', 404);
        return;
      }
      const assignedSet = new Set((req.user?.assignedTenants || []).map((t: Types.ObjectId) => t.toString()));
      const hasAccess = existing.tenantIds?.some((tid: Types.ObjectId) => assignedSet.has(tid.toString()));
      if (!hasAccess) {
        sendError(res, 'Access denied to this attraction', 403);
        return;
      }
    }

    const attraction = await Attraction.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!attraction) {
      sendError(res, 'Attraction not found', 404);
      return;
    }

    sendSuccess(res, attraction, 'Attraction updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAttraction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Non-super-admins can only delete attractions in their assigned tenants
    if (req.user?.role !== 'super-admin') {
      const existing = await Attraction.findById(id);
      if (!existing) {
        sendError(res, 'Attraction not found', 404);
        return;
      }
      const assignedSet = new Set((req.user?.assignedTenants || []).map((t: Types.ObjectId) => t.toString()));
      const hasAccess = existing.tenantIds?.some((tid: Types.ObjectId) => assignedSet.has(tid.toString()));
      if (!hasAccess) {
        sendError(res, 'Access denied to this attraction', 403);
        return;
      }
    }

    const attraction = await Attraction.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );

    if (!attraction) {
      sendError(res, 'Attraction not found', 404);
      return;
    }

    sendSuccess(res, null, 'Attraction archived successfully');
  } catch (error) {
    next(error);
  }
};

// Featured attractions
export const getFeaturedAttractions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 6 } = req.query;

    const query: Record<string, unknown> = {
      status: 'active',
      featured: true,
    };

    // Scope to tenant context or user's assigned tenants
    if (req.tenant) {
      query.tenantIds = { $in: [req.tenant._id] };
    } else if (req.user && req.user.role !== 'super-admin') {
      const adminRoles = ['brand-admin', 'manager', 'editor', 'viewer'];
      if (adminRoles.includes(req.user.role) && req.user.assignedTenants?.length > 0) {
        query.tenantIds = { $in: req.user.assignedTenants };
      }
    }

    const attractions = await Attraction.find(query)
      .sort({ sortOrder: 1, rating: -1 })
      .limit(parseInt(limit as string, 10))
      .lean();

    // Cache for 10 minutes (featured attractions change less frequently)
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=1200');

    sendSuccess(res, attractions);
  } catch (error) {
    next(error);
  }
};
