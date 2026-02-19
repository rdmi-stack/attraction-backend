import { Response, NextFunction, Request } from 'express';
import { Booking } from '../models/Booking';
import { Attraction } from '../models/Attraction';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';
import { createMockPaymentIntent, confirmMockPayment, createMockRefund } from '../services/stripe.service';
import { generateTicketPdf } from '../services/pdf.service';
import { sendBookingConfirmation } from '../services/email.service';

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

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('attractionId', 'title');

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    if (!canAccessBooking(req, booking.userId, booking.tenantId)) {
      sendError(res, 'Not authorized to process payment for this booking', 403);
      return;
    }

    if (booking.paymentStatus !== 'pending') {
      sendError(res, 'Payment already processed', 400);
      return;
    }

    // Create mock PaymentIntent
    const paymentIntent = createMockPaymentIntent(
      Math.round(booking.total * 100),
      booking.currency.toLowerCase(),
      {
        bookingId: booking._id.toString(),
        bookingReference: booking.reference,
      }
    );

    // Update booking with payment intent ID
    booking.stripePaymentIntentId = paymentIntent.id;
    booking.paymentStatus = 'processing';
    await booking.save();

    sendSuccess(res, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.total,
      currency: booking.currency,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('attractionId', 'title slug images destination meetingPoint');

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    if (booking.paymentStatus !== 'processing' && booking.paymentStatus !== 'pending') {
      sendError(res, 'Payment cannot be confirmed', 400);
      return;
    }

    // Mock payment confirmation - immediately succeeds
    booking.paymentStatus = 'succeeded';
    booking.status = 'confirmed';
    booking.paymentMethod = 'card';

    if (!booking.stripePaymentIntentId) {
      booking.stripePaymentIntentId = `pi_mock_auto_${Date.now()}`;
    }

    await booking.save();

    // Generate ticket PDF and send confirmation email
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

      // Send confirmation email with PDF attachment
      await sendBookingConfirmation(
        booking.guestDetails.email,
        {
          reference: booking.reference,
          attractionTitle: attraction?.title || 'Experience',
          date: booking.items[0]?.date || '',
          time: booking.items[0]?.time,
          guestName: `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`,
          total: booking.total,
          currency: booking.currency,
        },
        pdfBuffer
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the payment if email fails
    }

    sendSuccess(res, {
      reference: booking.reference,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
      amount: booking.total,
      currency: booking.currency,
    }, 'Payment confirmed successfully');
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Mock webhook handler - in production, this would verify Stripe webhook signatures
  // For now, we handle payments via the confirmPayment endpoint directly
  try {
    // Mock webhook handler - payments are handled via confirmPayment endpoint
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).select(
      'reference paymentStatus status total currency userId tenantId'
    );

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    if (!canAccessBooking(req, booking.userId, booking.tenantId)) {
      sendError(res, 'Not authorized to view this payment', 403);
      return;
    }

    sendSuccess(res, {
      reference: booking.reference,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
      amount: booking.total,
      currency: booking.currency,
    });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { amount } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!hasTenantAccess(req, booking.tenantId)) {
      sendError(res, 'Not authorized to refund this booking', 403);
      return;
    }

    if (!booking.stripePaymentIntentId) {
      sendError(res, 'No payment found for this booking', 400);
      return;
    }

    if (booking.paymentStatus !== 'succeeded') {
      sendError(res, 'Payment cannot be refunded', 400);
      return;
    }

    // Create mock refund
    const refundAmount = amount
      ? Math.round(amount * 100)
      : Math.round(booking.total * 100);

    createMockRefund(booking.stripePaymentIntentId, refundAmount);

    booking.paymentStatus = 'refunded';
    booking.status = 'refunded';
    await booking.save();

    sendSuccess(res, booking, 'Refund processed successfully');
  } catch (error) {
    next(error);
  }
};
