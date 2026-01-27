"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDestination = exports.updateDestination = exports.createDestination = exports.getFeaturedDestinations = exports.getDestinationBySlug = exports.getDestinations = void 0;
const Destination_1 = require("../models/Destination");
const Attraction_1 = require("../models/Attraction");
const response_1 = require("../utils/response");
const getDestinations = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, continent, search, includeCount = 'true' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const query = { isActive: true };
        if (continent) {
            query.continent = continent;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } },
            ];
        }
        const [destinations, total] = await Promise.all([
            Destination_1.Destination.find(query)
                .sort({ sortOrder: 1, name: 1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            Destination_1.Destination.countDocuments(query),
        ]);
        if (includeCount === 'true') {
            // Get attraction counts
            const counts = await Attraction_1.Attraction.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: '$destination.city', count: { $sum: 1 } } },
            ]);
            const countMap = new Map(counts.map((c) => [c._id, c.count]));
            const destinationsWithCount = destinations.map((dest) => ({
                ...dest,
                attractionCount: countMap.get(dest.name) || 0,
            }));
            (0, response_1.sendPaginated)(res, destinationsWithCount, pageNum, limitNum, total);
        }
        else {
            (0, response_1.sendPaginated)(res, destinations, pageNum, limitNum, total);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getDestinations = getDestinations;
const getDestinationBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const destination = await Destination_1.Destination.findOne({ slug, isActive: true }).lean();
        if (!destination) {
            (0, response_1.sendError)(res, 'Destination not found', 404);
            return;
        }
        // Get attraction count and stats
        const [attractionCount, ratingStats, priceStats] = await Promise.all([
            Attraction_1.Attraction.countDocuments({
                'destination.city': destination.name,
                status: 'active',
            }),
            Attraction_1.Attraction.aggregate([
                { $match: { 'destination.city': destination.name, status: 'active' } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: '$reviewCount' },
                    },
                },
            ]),
            Attraction_1.Attraction.aggregate([
                { $match: { 'destination.city': destination.name, status: 'active' } },
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: '$priceFrom' },
                    },
                },
            ]),
        ]);
        // Get popular attractions
        const popularAttractions = await Attraction_1.Attraction.find({
            'destination.city': destination.name,
            status: 'active',
        })
            .sort({ reviewCount: -1 })
            .limit(5)
            .select('title slug')
            .lean();
        (0, response_1.sendSuccess)(res, {
            ...destination,
            attractionCount,
            averageRating: ratingStats[0]?.averageRating || 0,
            reviewCount: ratingStats[0]?.totalReviews || 0,
            priceFrom: priceStats[0]?.minPrice || 0,
            popularAttractions: popularAttractions.map((a) => a.title),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDestinationBySlug = getDestinationBySlug;
const getFeaturedDestinations = async (req, res, next) => {
    try {
        const { limit = 6 } = req.query;
        const destinations = await Destination_1.Destination.find({ isActive: true })
            .sort({ sortOrder: 1 })
            .limit(parseInt(limit, 10))
            .lean();
        // Get attraction counts
        const counts = await Attraction_1.Attraction.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$destination.city', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(counts.map((c) => [c._id, c.count]));
        const destinationsWithCount = destinations.map((dest) => ({
            ...dest,
            attractionCount: countMap.get(dest.name) || 0,
        }));
        (0, response_1.sendSuccess)(res, destinationsWithCount);
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturedDestinations = getFeaturedDestinations;
// Admin endpoints
const createDestination = async (req, res, next) => {
    try {
        const destination = await Destination_1.Destination.create(req.body);
        (0, response_1.sendSuccess)(res, destination, 'Destination created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createDestination = createDestination;
const updateDestination = async (req, res, next) => {
    try {
        const { id } = req.params;
        const destination = await Destination_1.Destination.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
        if (!destination) {
            (0, response_1.sendError)(res, 'Destination not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, destination, 'Destination updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateDestination = updateDestination;
const deleteDestination = async (req, res, next) => {
    try {
        const { id } = req.params;
        const destination = await Destination_1.Destination.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!destination) {
            (0, response_1.sendError)(res, 'Destination not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, null, 'Destination deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDestination = deleteDestination;
//# sourceMappingURL=destinations.controller.js.map