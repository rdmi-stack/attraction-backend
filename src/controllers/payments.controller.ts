import { Response, NextFunction, Request } from 'express';
import Stripe from 'stripe';
import { Booking } from '../models/Booking';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';
import { env } from '../config/env';

// Initialize Stripe
const stripe = env.stripeSecretKey 
  ? new Stripe(env.stripeSecretKey, { apiVersion: '2023-10-16' })
  : null;

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!stripe) {
      sendError(res, 'Payment service not configured', 503);
      return;
    }

    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('attractionId', 'title');

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    if (booking.paymentStatus !== 'pending') {
      sendError(res, 'Payment already processed', 400);
      return;
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      metadata: {
        bookingId: booking._id.toString(),
        bookingReference: booking.reference,
      },
      description: `Booking ${booking.reference}`,
    });

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

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!stripe) {
      sendError(res, 'Payment service not configured', 503);
      return;
    }

    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.stripeWebhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      sendError(res, 'Webhook signature verification failed', 400);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await Booking.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            paymentStatus: 'succeeded',
            status: 'confirmed',
            paymentMethod: paymentIntent.payment_method_types[0],
          }
        );

        // TODO: Send confirmation email and generate ticket PDF
        console.log('Payment succeeded for:', paymentIntent.metadata.bookingReference);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await Booking.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { paymentStatus: 'failed' }
        );

        console.log('Payment failed for:', paymentIntent.metadata.bookingReference);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        if (charge.payment_intent) {
          await Booking.findOneAndUpdate(
            { stripePaymentIntentId: charge.payment_intent },
            {
              paymentStatus: 'refunded',
              status: 'refunded',
            }
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

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
      'reference paymentStatus status total currency'
    );

    if (!booking) {
      sendError(res, 'Booking not found', 404);
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
    if (!stripe) {
      sendError(res, 'Payment service not configured', 503);
      return;
    }

    const { bookingId } = req.params;
    const { amount } = req.body; // Optional partial refund amount

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      sendError(res, 'Booking not found', 404);
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

    // Create refund
    const refundAmount = amount
      ? Math.round(amount * 100)
      : Math.round(booking.total * 100);

    await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: refundAmount,
    });

    booking.paymentStatus = 'refunded';
    booking.status = 'refunded';
    await booking.save();

    sendSuccess(res, booking, 'Refund processed successfully');
  } catch (error) {
    next(error);
  }
};
