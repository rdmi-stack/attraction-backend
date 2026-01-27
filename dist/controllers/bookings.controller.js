"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingStats = exports.updateBookingStatus = exports.getAllBookings = exports.getBookingTicket = exports.cancelBooking = exports.getMyBookings = exports.getBookingByReference = exports.createBooking = void 0;
const Booking_1 = require("../models/Booking");
const Attraction_1 = require("../models/Attraction");
const User_1 = require("../models/User");
const response_1 = require("../utils/response");
const hash_1 = require("../utils/hash");
const createBooking = async (req, res, next) => {
    try {
        const { attractionId, items, guestDetails, promoCode } = req.body;
        // Verify attraction exists
        const attraction = await Attraction_1.Attraction.findById(attractionId);
        if (!attraction) {
            (0, response_1.sendError)(res, 'Attraction not found', 404);
            return;
        }
        // Calculate totals
        let subtotal = 0;
        items.forEach((item) => {
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
        const booking = await Booking_1.Booking.create({
            reference: (0, hash_1.generateBookingReference)(),
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
            await User_1.User.findByIdAndUpdate(req.user._id, {
                $inc: { totalBookings: 1, totalSpent: total },
            });
        }
        (0, response_1.sendSuccess)(res, booking, 'Booking created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createBooking = createBooking;
const getBookingByReference = async (req, res, next) => {
    try {
        const { reference } = req.params;
        const booking = await Booking_1.Booking.findOne({ reference })
            .populate('attractionId', 'title slug images destination')
            .populate('tenantId', 'name logo');
        if (!booking) {
            (0, response_1.sendError)(res, 'Booking not found', 404);
            return;
        }
        // Check authorization - allow if user owns booking, is admin, or guest email matches
        if (req.user) {
            if (booking.userId?.toString() !== req.user._id.toString() &&
                !['super-admin', 'brand-admin', 'manager'].includes(req.user.role)) {
                (0, response_1.sendError)(res, 'Not authorized to view this booking', 403);
                return;
            }
        }
        (0, response_1.sendSuccess)(res, booking);
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingByReference = getBookingByReference;
const getMyBookings = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Not authenticated', 401);
            return;
        }
        const { page = 1, limit = 10, status } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const query = { userId: req.user._id };
        if (status) {
            query.status = status;
        }
        const [bookings, total] = await Promise.all([
            Booking_1.Booking.find(query)
                .populate('attractionId', 'title slug images destination')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            Booking_1.Booking.countDocuments(query),
        ]);
        (0, response_1.sendPaginated)(res, bookings, pageNum, limitNum, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getMyBookings = getMyBookings;
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking_1.Booking.findById(id);
        if (!booking) {
            (0, response_1.sendError)(res, 'Booking not found', 404);
            return;
        }
        // Check authorization
        if (req.user &&
            booking.userId?.toString() !== req.user._id.toString() &&
            !['super-admin', 'brand-admin', 'manager'].includes(req.user.role)) {
            (0, response_1.sendError)(res, 'Not authorized to cancel this booking', 403);
            return;
        }
        // Check if cancellation is allowed
        if (!['pending', 'confirmed'].includes(booking.status)) {
            (0, response_1.sendError)(res, 'Booking cannot be cancelled', 400);
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
        (0, response_1.sendSuccess)(res, booking, 'Booking cancelled successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.cancelBooking = cancelBooking;
const getBookingTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking_1.Booking.findById(id).populate('attractionId');
        if (!booking) {
            (0, response_1.sendError)(res, 'Booking not found', 404);
            return;
        }
        // Check authorization
        if (req.user &&
            booking.userId?.toString() !== req.user._id.toString() &&
            !['super-admin', 'brand-admin', 'manager'].includes(req.user.role)) {
            (0, response_1.sendError)(res, 'Not authorized to access this ticket', 403);
            return;
        }
        // Check if booking is confirmed
        if (booking.status !== 'confirmed') {
            (0, response_1.sendError)(res, 'Ticket not available. Booking is not confirmed.', 400);
            return;
        }
        // Return ticket URL or generate PDF
        if (booking.ticketPdfUrl) {
            (0, response_1.sendSuccess)(res, { ticketUrl: booking.ticketPdfUrl });
        }
        else {
            // TODO: Generate PDF ticket
            (0, response_1.sendError)(res, 'Ticket generation in progress', 202);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingTicket = getBookingTicket;
// Admin endpoints
const getAllBookings = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, startDate, endDate, search } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const query = {};
        // Filter by tenant for non-super-admins
        if (req.user?.role !== 'super-admin' && req.tenant) {
            query.tenantId = req.tenant._id;
        }
        if (status) {
            query.status = status;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
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
            Booking_1.Booking.find(query)
                .populate('attractionId', 'title slug')
                .populate('userId', 'firstName lastName email')
                .populate('tenantId', 'name slug')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            Booking_1.Booking.countDocuments(query),
        ]);
        (0, response_1.sendPaginated)(res, bookings, pageNum, limitNum, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBookings = getAllBookings;
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;
        const updates = {};
        if (status)
            updates.status = status;
        if (paymentStatus)
            updates.paymentStatus = paymentStatus;
        const booking = await Booking_1.Booking.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
        if (!booking) {
            (0, response_1.sendError)(res, 'Booking not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, booking, 'Booking updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateBookingStatus = updateBookingStatus;
// Dashboard stats
const getBookingStats = async (req, res, next) => {
    try {
        const query = {};
        if (req.user?.role !== 'super-admin' && req.tenant) {
            query.tenantId = req.tenant._id;
        }
        const [totalBookings, confirmedBookings, pendingBookings, cancelledBookings, revenue] = await Promise.all([
            Booking_1.Booking.countDocuments(query),
            Booking_1.Booking.countDocuments({ ...query, status: 'confirmed' }),
            Booking_1.Booking.countDocuments({ ...query, status: 'pending' }),
            Booking_1.Booking.countDocuments({ ...query, status: 'cancelled' }),
            Booking_1.Booking.aggregate([
                { $match: { ...query, paymentStatus: 'succeeded' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);
        (0, response_1.sendSuccess)(res, {
            totalBookings,
            confirmedBookings,
            pendingBookings,
            cancelledBookings,
            totalRevenue: revenue[0]?.total || 0,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingStats = getBookingStats;
//# sourceMappingURL=bookings.controller.js.map