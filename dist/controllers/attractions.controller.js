"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeaturedAttractions = exports.deleteAttraction = exports.updateAttraction = exports.createAttraction = exports.getAttractionAvailability = exports.getAttractionReviews = exports.getAttractionById = exports.getAttractionBySlug = exports.getAttractions = void 0;
const Attraction_1 = require("../models/Attraction");
const Review_1 = require("../models/Review");
const response_1 = require("../utils/response");
const mongoose_1 = require("mongoose");
const getAttractions = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', category, destination, minPrice, maxPrice, rating, badges, search, status = 'active', } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        // Build query
        const query = {};
        // Only show active attractions for public API
        if (!req.user || req.user.role === 'customer') {
            query.status = 'active';
        }
        else if (status) {
            query.status = status;
        }
        // Filter by tenant if tenant context exists
        if (req.tenant) {
            query.tenantIds = { $in: [req.tenant._id] };
        }
        // When no tenant context, show all attractions (for development/global access)
        if (category) {
            query.category = category;
        }
        if (destination) {
            query['destination.city'] = { $regex: new RegExp(destination, 'i') };
        }
        if (minPrice || maxPrice) {
            query.priceFrom = {};
            if (minPrice)
                query.priceFrom.$gte = parseFloat(minPrice);
            if (maxPrice)
                query.priceFrom.$lte = parseFloat(maxPrice);
        }
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }
        if (badges) {
            query.badges = { $in: badges.split(',') };
        }
        if (search) {
            query.$text = { $search: search };
        }
        // Build sort
        let sortOption = { createdAt: -1 };
        if (sort === 'price-low')
            sortOption = { priceFrom: 1 };
        else if (sort === 'price-high')
            sortOption = { priceFrom: -1 };
        else if (sort === 'rating')
            sortOption = { rating: -1 };
        else if (sort === 'popularity')
            sortOption = { reviewCount: -1 };
        else if (sort === 'recommended')
            sortOption = { featured: -1, rating: -1 };
        // Execute query
        const [attractions, total] = await Promise.all([
            Attraction_1.Attraction.find(query)
                .sort(sortOption)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            Attraction_1.Attraction.countDocuments(query),
        ]);
        (0, response_1.sendPaginated)(res, attractions, pageNum, limitNum, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getAttractions = getAttractions;
const getAttractionBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const attraction = await Attraction_1.Attraction.findOne({ slug, status: 'active' });
        if (!attraction) {
            (0, response_1.sendError)(res, 'Attraction not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, attraction);
    }
    catch (error) {
        next(error);
    }
};
exports.getAttractionBySlug = getAttractionBySlug;
const getAttractionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attraction = await Attraction_1.Attraction.findById(id);
        if (!attraction) {
            (0, response_1.sendError)(res, 'Attraction not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, attraction);
    }
    catch (error) {
        next(error);
    }
};
exports.getAttractionById = getAttractionById;
const getAttractionReviews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const [reviews, total] = await Promise.all([
            Review_1.Review.find({ attractionId: id, status: 'approved' })
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            Review_1.Review.countDocuments({ attractionId: id, status: 'approved' }),
        ]);
        // Calculate rating breakdown
        const ratingBreakdown = await Review_1.Review.aggregate([
            { $match: { attractionId: new mongoose_1.Types.ObjectId(id), status: 'approved' } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
        ]);
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratingBreakdown.forEach((r) => {
            breakdown[r._id] = r.count;
        });
        (0, response_1.sendSuccess)(res, { reviews, ratingBreakdown: breakdown, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (error) {
        next(error);
    }
};
exports.getAttractionReviews = getAttractionReviews;
const getAttractionAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date, month } = req.query;
        const attraction = await Attraction_1.Attraction.findById(id);
        if (!attraction) {
            (0, response_1.sendError)(res, 'Attraction not found', 404);
            return;
        }
        // Generate availability data (simplified - in production, this would check actual inventory)
        const availability = [];
        const startDate = date ? new Date(date) : new Date();
        const endDate = month
            ? new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0)
            : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayAvailability = {
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
        (0, response_1.sendSuccess)(res, { availability });
    }
    catch (error) {
        next(error);
    }
};
exports.getAttractionAvailability = getAttractionAvailability;
// Admin endpoints
const createAttraction = async (req, res, next) => {
    try {
        const attractionData = {
            ...req.body,
            createdBy: req.user?._id,
        };
        const attraction = await Attraction_1.Attraction.create(attractionData);
        (0, response_1.sendSuccess)(res, attraction, 'Attraction created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createAttraction = createAttraction;
const updateAttraction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attraction = await Attraction_1.Attraction.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
        if (!attraction) {
            (0, response_1.sendError)(res, 'Attraction not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, attraction, 'Attraction updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateAttraction = updateAttraction;
const deleteAttraction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attraction = await Attraction_1.Attraction.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
        if (!attraction) {
            (0, response_1.sendError)(res, 'Attraction not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, null, 'Attraction archived successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAttraction = deleteAttraction;
// Featured attractions
const getFeaturedAttractions = async (req, res, next) => {
    try {
        const { limit = 6 } = req.query;
        const attractions = await Attraction_1.Attraction.find({
            status: 'active',
            featured: true,
        })
            .sort({ sortOrder: 1, rating: -1 })
            .limit(parseInt(limit, 10))
            .lean();
        (0, response_1.sendSuccess)(res, attractions);
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturedAttractions = getFeaturedAttractions;
//# sourceMappingURL=attractions.controller.js.map