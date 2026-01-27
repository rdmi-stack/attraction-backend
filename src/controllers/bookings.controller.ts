import { Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';
import { Attraction } from '../models/Attraction';
import { User } from '../models/User';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';
import { generateBookingReference } from '../utils/hash';

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attractionId, items, guestDetails, promoCode } = req.body;

    // Verify attraction exists
    const attraction = await Attraction.findById(attractionId);
    if (!attraction) {
      sendError(res, 'Attraction not found', 404);
      return;
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach((item: { totalPrice: number }) => {
      subtotal += item.totalPrice;
    });

    const fees = Math.round(subtotal * 0.05 * 100) / 100; // 5% service fee
    const discount = 0;

    // TODO: Validate promo code
    if (promoCode) {
      // Apply discount logic
    }

    const total = subtotal + fees - discount;

    // Create booking
    const booking = await Booking.create({
      reference: generateBookingReference(),
      userId: req.user?._id,
      tenantId: req.tenant?._id || attraction.tenantIds[0],
      attractionId,
      items,
      guestDetails,
      subtotal,
      fees,
      discount,
      total,
      currency: attraction.currency,
      promoCode,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Update user stats if logged in
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalBookings: 1, totalSpent: total },
      });
    }

    sendSuccess(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getBookingByReference = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({ reference })
      .populate('attractionId', 'title slug images destination')
      .populate('tenantId', 'name logo');

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    // Check authorization - allow if user owns booking, is admin, or guest email matches
    if (req.user) {
      if (
        booking.userId?.toString() !== req.user._id.toString() &&
        !['super-admin', 'brand-admin', 'manager'].includes(req.user.role)
      ) {
        sendError(res, 'Not authorized to view this booking', 403);
        return;
      }
    }

    sendSuccess(res, booking);
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: Record<string, unknown> = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('attractionId', 'title slug images destination')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(query),
    ]);

    sendPaginated(res, bookings, pageNum, limitNum, total);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    // Check authorization
    if (
      req.user &&
      booking.userId?.toString() !== req.user._id.toString() &&
      !['super-admin', 'brand-admin', 'manager'].includes(req.user.role)
    ) {
      sendError(res, 'Not authorized to cancel this booking', 403);
      return;
    }

    // Check if cancellation is allowed
    if (!['pending', 'confirmed'].includes(booking.status)) {
      sendError(res, 'Booking cannot be cancelled', 400);
      return;
    }

    // Update booking status
    booking.status = 'cancelled';
    
    // If payment was made, initiate refund
    if (booking.paymentStatus === 'succeeded') {
      // TODO: Initiate Stripe refund
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    sendSuccess(res, booking, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const getBookingTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('attractionId');

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    // Check authorization
    if (
      req.user &&
      booking.userId?.toString() !== req.user._id.toString() &&
      !['super-admin', 'brand-admin', 'manager'].includes(req.user.role)
    ) {
      sendError(res, 'Not authorized to access this ticket', 403);
      return;
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      sendError(res, 'Ticket not available. Booking is not confirmed.', 400);
      return;
    }

    // Return ticket URL or generate PDF
    if (booking.ticketPdfUrl) {
      sendSuccess(res, { ticketUrl: booking.ticketPdfUrl });
    } else {
      // TODO: Generate PDF ticket
      sendError(res, 'Ticket generation in progress', 202);
    }
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
export const getAllBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate, search } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: Record<string, unknown> = {};

    // Filter by tenant for non-super-admins
    if (req.user?.role !== 'super-admin' && req.tenant) {
      query.tenantId = req.tenant._id;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
      if (endDate) (query.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
    }

    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { 'guestDetails.email': { $regex: search, $options: 'i' } },
        { 'guestDetails.firstName': { $regex: search, $options: 'i' } },
        { 'guestDetails.lastName': { $regex: search, $options: 'i' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('attractionId', 'title slug')
        .populate('userId', 'firstName lastName email')
        .populate('tenantId', 'name slug')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(query),
    ]);

    sendPaginated(res, bookings, pageNum, limitNum, total);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    sendSuccess(res, booking, 'Booking updated successfully');
  } catch (error) {
    next(error);
  }
};

// Dashboard stats
export const getBookingStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query: Record<string, unknown> = {};

    if (req.user?.role !== 'super-admin' && req.tenant) {
      query.tenantId = req.tenant._id;
    }

    const [totalBookings, confirmedBookings, pendingBookings, cancelledBookings, revenue] = await Promise.all([
      Booking.countDocuments(query),
      Booking.countDocuments({ ...query, status: 'confirmed' }),
      Booking.countDocuments({ ...query, status: 'pending' }),
      Booking.countDocuments({ ...query, status: 'cancelled' }),
      Booking.aggregate([
        { $match: { ...query, paymentStatus: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    sendSuccess(res, {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};
