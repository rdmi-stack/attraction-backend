"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.inviteUser = exports.getUserById = exports.getUsers = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = exports.getProfile = void 0;
const User_1 = require("../models/User");
const Attraction_1 = require("../models/Attraction");
const response_1 = require("../utils/response");
const hash_1 = require("../utils/hash");
// User Profile Endpoints
const getProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Not authenticated', 401);
            return;
        }
        const user = await User_1.User.findById(req.user._id)
            .populate('wishlist', 'slug title images priceFrom currency destination')
            .lean();
        (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const getWishlist = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Not authenticated', 401);
            return;
        }
        const user = await User_1.User.findById(req.user._id)
            .populate({
            path: 'wishlist',
            match: { status: 'active' },
            select: 'slug title images priceFrom currency destination rating reviewCount badges',
        })
            .lean();
        (0, response_1.sendSuccess)(res, user?.wishlist || []);
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlist = getWishlist;
const addToWishlist = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Not authenticated', 401);
            return;
        }
        const { attractionId } = req.params;
        // Verify attraction exists
        const attraction = await Attraction_1.Attraction.findById(attractionId);
        if (!attraction) {
            (0, response_1.sendError)(res, 'Attraction not found', 404);
            return;
        }
        // Add to wishlist if not already there
        await User_1.User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: attractionId } });
        (0, response_1.sendSuccess)(res, null, 'Added to wishlist');
    }
    catch (error) {
        next(error);
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Not authenticated', 401);
            return;
        }
        const { attractionId } = req.params;
        await User_1.User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: attractionId } });
        (0, response_1.sendSuccess)(res, null, 'Removed from wishlist');
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromWishlist = removeFromWishlist;
// Admin User Management
const getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, status, search } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const query = {};
        if (role) {
            query.role = role;
        }
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
            ];
        }
        const [users, total] = await Promise.all([
            User_1.User.find(query)
                .populate('assignedTenants', 'name slug')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
            User_1.User.countDocuments(query),
        ]);
        (0, response_1.sendPaginated)(res, users, pageNum, limitNum, total);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id)
            .populate('assignedTenants', 'name slug')
            .lean();
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const inviteUser = async (req, res, next) => {
    try {
        const { email, firstName, lastName, role, assignedTenants } = req.body;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            (0, response_1.sendError)(res, 'User with this email already exists', 409);
            return;
        }
        // Generate temporary password
        const tempPassword = (0, hash_1.generateRandomToken)(16);
        // Create user with pending status
        const user = await User_1.User.create({
            email: email.toLowerCase(),
            password: tempPassword,
            firstName,
            lastName,
            role,
            status: 'pending',
            assignedTenants,
            passwordResetToken: (0, hash_1.hashToken)(tempPassword),
            passwordResetExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        // TODO: Send invitation email with reset link
        console.log('Invitation token (dev only):', tempPassword);
        (0, response_1.sendSuccess)(res, user, 'User invited successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.inviteUser = inviteUser;
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, role, status, assignedTenants } = req.body;
        const updates = {};
        if (firstName !== undefined)
            updates.firstName = firstName;
        if (lastName !== undefined)
            updates.lastName = lastName;
        if (role !== undefined)
            updates.role = role;
        if (status !== undefined)
            updates.status = status;
        if (assignedTenants !== undefined)
            updates.assignedTenants = assignedTenants;
        const user = await User_1.User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).populate('assignedTenants', 'name slug');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, user, 'User updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Don't allow deleting yourself
        if (req.user?._id.toString() === id) {
            (0, response_1.sendError)(res, 'Cannot delete your own account', 400);
            return;
        }
        const user = await User_1.User.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, null, 'User deactivated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=users.controller.js.map