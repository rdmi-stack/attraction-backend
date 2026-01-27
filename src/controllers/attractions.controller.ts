import { Response, NextFunction } from 'express';
import { Attraction } from '../models/Attraction';
import { Review } from '../models/Review';
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

    // Filter by tenant if tenant context exists
    if (req.tenant) {
      query.tenantIds = { $in: [req.tenant._id] };
    }
    // When no tenant context, show all attractions (for development/global access)

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

    // Generate availability data (simplified - in production, this would check actual inventory)
    const availability: Array<{
      date: string;
      available: boolean;
      timeSlots?: Array<{ time: string; available: boolean; spotsLeft: number }>;
    }> = [];

    const startDate = date ? new Date(date as string) : new Date();
    const endDate = month
      ? new Date(new Date(month as string).getFullYear(), new Date(month as string).getMonth() + 1, 0)
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayAvailability: {
        date: string;
        available: boolean;
        timeSlots?: Array<{ time: string; available: boolean; spotsLeft: number }>;
      } = {
        date: dateStr,
        available: true,
      };

      if (attraction.availability.type === 'time-slots') {
        dayAvailability.timeSlots = [
          { time: '09:00', available: true, spotsLeft: Math.floor(Math.random() * 20) + 5 },
          { time: '10:00', available: true, spotsLeft: Math.floor(Math.random() * 20) + 5 },
          { time: '11:00', available: true, spotsLeft: Math.floor(Math.random() * 20) + 5 },
          { time: '14:00', available: true, spotsLeft: Math.floor(Math.random() * 20) + 5 },
          { time: '15:00', available: true, spotsLeft: Math.floor(Math.random() * 20) + 5 },
          { time: '16:00', available: true, spotsLeft: Math.floor(Math.random() * 20) + 5 },
        ];
      }

      availability.push(dayAvailability);
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

    const attractions = await Attraction.find({
      status: 'active',
      featured: true,
    })
      .sort({ sortOrder: 1, rating: -1 })
      .limit(parseInt(limit as string, 10))
      .lean();

    sendSuccess(res, attractions);
  } catch (error) {
    next(error);
  }
};
