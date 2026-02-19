import { Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';
import { Attraction } from '../models/Attraction';
import { User } from '../models/User';
import { PromoCode } from '../models/PromoCode';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';
import { generateBookingReference } from '../utils/hash';
import { generateTicketPdf } from '../services/pdf.service';
import { createMockRefund } from '../services/stripe.service';
import { Availability } from '../models/Availability';

const adminRoles = ['super-admin', 'brand-admin', 'manager'];

const hasTenantAccess = (req: AuthRequest, tenantId?: unknown): boolean => {
  if (!req.user || !tenantId) return false;
  if (req.user.role === 'super-admin') return true;
  if (!adminRoles.includes(req.user.role)) return false;

  return (req.user.assignedTenants || []).some(
    (assignedTenantId) => assignedTenantId.toString() === String(tenantId)
  );
};

const canAccessBooking = (req: AuthRequest, ownerId?: unknown, tenantId?: unknown): boolean => {
  if (!req.user) return false;
  if (req.user.role === 'super-admin') return true;

  if (adminRoles.includes(req.user.role)) {
    const isOwner =
      ownerId !== undefined && ownerId !== null && String(ownerId) === req.user._id.toString();
    return isOwner || hasTenantAccess(req, tenantId);
  }

  return ownerId !== undefined && ownerId !== null && String(ownerId) === req.user._id.toString();
};

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

    if (req.tenant && !attraction.tenantIds.some((id) => id.toString() === req.tenant?._id.toString())) {
      sendError(res, 'Attraction not available for this tenant', 403);
      return;
    }

    // Recalculate line items on the server to prevent client-side price tampering.
    const normalizedItems = items.map((item: {
      optionId: string;
      date: string;
      time?: string;
      quantities: { adults: number; children: number; infants: number };
    }) => {
      const option = attraction.pricingOptions.find((o) => o.id === item.optionId);
      if (!option) {
        throw new Error(`INVALID_OPTION:${item.optionId}`);
      }

      const payableGuests = (item.quantities?.adults || 0) + (item.quantities?.children || 0);
      if (payableGuests <= 0) {
        throw new Error('INVALID_QUANTITY');
      }

      const unitPrice = option.price;
      const totalPrice = Math.round(unitPrice * payableGuests * 100) / 100;

      return {
        optionId: option.id,
        optionName: option.name,
        date: item.date,
        time: item.time,
        quantities: item.quantities,
        unitPrice,
        totalPrice,
      };
    });

    const subtotal = normalizedItems.reduce(
      (acc: number, item: { totalPrice: number }) => acc + item.totalPrice,
      0
    );

    const fees = Math.round(subtotal * 0.05 * 100) / 100; // 5% service fee
    let discount = 0;

    // Validate promo code
    if (promoCode) {
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (promo && promo.usageCount < promo.usageLimit && subtotal >= promo.minOrderAmount) {
        if (promo.discountType === 'percentage') {
          discount = Math.round(subtotal * (promo.discountValue / 100) * 100) / 100;
          if (promo.maxDiscount) {
            discount = Math.min(discount, promo.maxDiscount);
          }
        } else {
          discount = promo.discountValue;
        }

        // Increment usage count
        await PromoCode.findByIdAndUpdate(promo._id, { $inc: { usageCount: 1 } });
      }
    }

    const total = subtotal + fees - discount;

    const tenantId = req.tenant?._id || attraction.tenantIds[0];
    if (!tenantId) {
      sendError(res, 'Attraction is not assigned to any tenant', 400);
      return;
    }

    // Create booking
    const booking = await Booking.create({
      reference: generateBookingReference(),
      userId: req.user?._id,
      tenantId,
      attractionId,
      items: normalizedItems,
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

    // Decrement availability for booked slots
    for (const item of items) {
      if (item.date) {
        const bookingDate = new Date(item.date);
        bookingDate.setHours(0, 0, 0, 0);
        const totalGuests = (item.quantities?.adults || 0) + (item.quantities?.children || 0);

        if (item.time) {
          await Availability.findOneAndUpdate(
            { attractionId, date: bookingDate, 'timeSlots.time': item.time },
            { $inc: { 'timeSlots.$.booked': totalGuests } },
            { upsert: false }
          );
        } else {
          await Availability.findOneAndUpdate(
            { attractionId, date: bookingDate },
            { $inc: { allDayBooked: totalGuests } },
            { upsert: false }
          );
        }
      }
    }

    sendSuccess(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('INVALID_OPTION:')) {
      sendError(res, 'Invalid pricing option selected', 400);
      return;
    }
    if (error instanceof Error && error.message === 'INVALID_QUANTITY') {
      sendError(res, 'At least one paid guest is required', 400);
      return;
    }
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

    if (!canAccessBooking(req, booking.userId, booking.tenantId)) {
      sendError(res, 'Not authorized to view this booking', 403);
      return;
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

    if (!canAccessBooking(req, booking.userId, booking.tenantId)) {
      sendError(res, 'Not authorized to cancel this booking', 403);
      return;
    }

    // Check if cancellation is allowed
    if (!['pending', 'confirmed'].includes(booking.status)) {
      sendError(res, 'Booking cannot be cancelled', 400);
      return;
    }

    // If payment was made, process refund
    if (booking.paymentStatus === 'succeeded' && booking.stripePaymentIntentId) {
      createMockRefund(booking.stripePaymentIntentId, Math.round(booking.total * 100));
      booking.paymentStatus = 'refunded';
      booking.status = 'refunded';
    }

    booking.status = 'cancelled';
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

    if (!canAccessBooking(req, booking.userId, booking.tenantId)) {
      sendError(res, 'Not authorized to access this ticket', 403);
      return;
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      sendError(res, 'Ticket not available. Booking is not confirmed.', 400);
      return;
    }

    // Generate and return PDF ticket
    try {
      const attraction = booking.attractionId as any;
      const ticketData = {
        reference: booking.reference,
        attractionTitle: attraction?.title || 'Experience',
        date: booking.items[0]?.date || new Date().toISOString().split('T')[0],
        time: booking.items[0]?.time,
        guestName: `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`,
        email: booking.guestDetails.email,
        items: booking.items.map((item: any) => ({
          optionName: item.optionName,
          quantities: item.quantities,
        })),
        total: booking.total,
        currency: booking.currency,
        meetingPoint: attraction?.meetingPoint,
      };

      const pdfBuffer = await generateTicketPdf(ticketData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.reference}.pdf`);
      res.send(pdfBuffer);
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      sendError(res, 'Failed to generate ticket', 500);
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
    if (req.user?.role !== 'super-admin') {
      if (req.tenant) {
        query.tenantId = req.tenant._id;
      } else {
        query.tenantId = { $in: req.user?.assignedTenants || [] };
      }
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

    const booking = await Booking.findById(id);

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    if (!canAccessBooking(req, booking.userId, booking.tenantId)) {
      sendError(res, 'Not authorized to update this booking', 403);
      return;
    }

    if (status) {
      booking.status = status;
    }
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

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

    if (req.user?.role !== 'super-admin') {
      if (req.tenant) {
        query.tenantId = req.tenant._id;
      } else {
        query.tenantId = { $in: req.user?.assignedTenants || [] };
      }
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
