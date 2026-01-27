"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPayment = exports.getPaymentStatus = exports.handleWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const Booking_1 = require("../models/Booking");
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
// Initialize Stripe
const stripe = env_1.env.stripeSecretKey
    ? new stripe_1.default(env_1.env.stripeSecretKey, { apiVersion: '2023-10-16' })
    : null;
const createPaymentIntent = async (req, res, next) => {
    try {
        if (!stripe) {
            (0, response_1.sendError)(res, 'Payment service not configured', 503);
            return;
        }
        const { bookingId } = req.body;
        const booking = await Booking_1.Booking.findById(bookingId).populate('attractionId', 'title');
        if (!booking) {
            (0, response_1.sendError)(res, 'Booking not found', 404);
            return;
        }
        if (booking.paymentStatus !== 'pending') {
            (0, response_1.sendError)(res, 'Payment already processed', 400);
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
        (0, response_1.sendSuccess)(res, {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: booking.total,
            currency: booking.currency,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPaymentIntent = createPaymentIntent;
const handleWebhook = async (req, res, next) => {
    try {
        if (!stripe) {
            (0, response_1.sendError)(res, 'Payment service not configured', 503);
            return;
        }
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, env_1.env.stripeWebhookSecret);
        }
        catch (err) {
            console.error('Webhook signature verification failed:', err);
            (0, response_1.sendError)(res, 'Webhook signature verification failed', 400);
            return;
        }
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                await Booking_1.Booking.findOneAndUpdate({ stripePaymentIntentId: paymentIntent.id }, {
                    paymentStatus: 'succeeded',
                    status: 'confirmed',
                    paymentMethod: paymentIntent.payment_method_types[0],
                });
                // TODO: Send confirmation email and generate ticket PDF
                console.log('Payment succeeded for:', paymentIntent.metadata.bookingReference);
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                await Booking_1.Booking.findOneAndUpdate({ stripePaymentIntentId: paymentIntent.id }, { paymentStatus: 'failed' });
                console.log('Payment failed for:', paymentIntent.metadata.bookingReference);
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object;
                if (charge.payment_intent) {
                    await Booking_1.Booking.findOneAndUpdate({ stripePaymentIntentId: charge.payment_intent }, {
                        paymentStatus: 'refunded',
                        status: 'refunded',
                    });
                }
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        next(error);
    }
};
exports.handleWebhook = handleWebhook;
const getPaymentStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking_1.Booking.findById(bookingId).select('reference paymentStatus status total currency');
        if (!booking) {
            (0, response_1.sendError)(res, 'Booking not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, {
            reference: booking.reference,
            paymentStatus: booking.paymentStatus,
            bookingStatus: booking.status,
            amount: booking.total,
            currency: booking.currency,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentStatus = getPaymentStatus;
const refundPayment = async (req, res, next) => {
    try {
        if (!stripe) {
            (0, response_1.sendError)(res, 'Payment service not configured', 503);
            return;
        }
        const { bookingId } = req.params;
        const { amount } = req.body; // Optional partial refund amount
        const booking = await Booking_1.Booking.findById(bookingId);
        if (!booking) {
            (0, response_1.sendError)(res, 'Booking not found', 404);
            return;
        }
        if (!booking.stripePaymentIntentId) {
            (0, response_1.sendError)(res, 'No payment found for this booking', 400);
            return;
        }
        if (booking.paymentStatus !== 'succeeded') {
            (0, response_1.sendError)(res, 'Payment cannot be refunded', 400);
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
        (0, response_1.sendSuccess)(res, booking, 'Refund processed successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.refundPayment = refundPayment;
//# sourceMappingURL=payments.controller.js.map