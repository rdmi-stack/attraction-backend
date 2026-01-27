"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryBySlug = exports.getCategories = void 0;
const Category_1 = require("../models/Category");
const Attraction_1 = require("../models/Attraction");
const response_1 = require("../utils/response");
const getCategories = async (req, res, next) => {
    try {
        const { includeCount = 'true' } = req.query;
        const categories = await Category_1.Category.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        if (includeCount === 'true') {
            // Get attraction counts for each category
            const counts = await Attraction_1.Attraction.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]);
            const countMap = new Map(counts.map((c) => [c._id, c.count]));
            const categoriesWithCount = categories.map((cat) => ({
                ...cat,
                count: countMap.get(cat.slug) || 0,
            }));
            (0, response_1.sendSuccess)(res, categoriesWithCount);
        }
        else {
            (0, response_1.sendSuccess)(res, categories);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const getCategoryBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await Category_1.Category.findOne({ slug, isActive: true }).lean();
        if (!category) {
            (0, response_1.sendError)(res, 'Category not found', 404);
            return;
        }
        // Get attraction count
        const count = await Attraction_1.Attraction.countDocuments({
            category: slug,
            status: 'active',
        });
        (0, response_1.sendSuccess)(res, { ...category, count });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
// Admin endpoints
const createCategory = async (req, res, next) => {
    try {
        const category = await Category_1.Category.create(req.body);
        (0, response_1.sendSuccess)(res, category, 'Category created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category_1.Category.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
        if (!category) {
            (0, response_1.sendError)(res, 'Category not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, category, 'Category updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if category has attractions
        const category = await Category_1.Category.findById(id);
        if (!category) {
            (0, response_1.sendError)(res, 'Category not found', 404);
            return;
        }
        const attractionCount = await Attraction_1.Attraction.countDocuments({
            category: category.slug,
        });
        if (attractionCount > 0) {
            (0, response_1.sendError)(res, 'Cannot delete category with attractions', 400);
            return;
        }
        await Category_1.Category.findByIdAndDelete(id);
        (0, response_1.sendSuccess)(res, null, 'Category deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categories.controller.js.map