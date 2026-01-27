"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.me = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const hash_1 = require("../utils/hash");
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_1.env.isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phone, country } = req.body;
        // Check if user exists
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            (0, response_1.sendError)(res, 'Email already registered', 409);
            return;
        }
        // Create user
        const user = await User_1.User.create({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            phone,
            country,
            role: 'customer',
            status: 'active',
        });
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        // Save refresh token
        user.refreshToken = (0, hash_1.hashToken)(refreshToken);
        user.lastLogin = new Date();
        await user.save();
        // Set cookies
        res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
        res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, path: '/api/auth/refresh' });
        (0, response_1.sendSuccess)(res, { user, accessToken }, 'Registration successful', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password, rememberMe } = req.body;
        // Find user with password
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            (0, response_1.sendError)(res, 'Invalid email or password', 401);
            return;
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            (0, response_1.sendError)(res, 'Invalid email or password', 401);
            return;
        }
        // Check status
        if (user.status !== 'active') {
            (0, response_1.sendError)(res, 'Account is not active. Please contact support.', 403);
            return;
        }
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        // Save refresh token
        user.refreshToken = (0, hash_1.hashToken)(refreshToken);
        user.lastLogin = new Date();
        await user.save();
        // Set cookies
        const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : COOKIE_OPTIONS.maxAge;
        res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: cookieMaxAge });
        res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, path: '/api/auth/refresh', maxAge: cookieMaxAge });
        // Remove password from response
        const userResponse = user.toJSON();
        (0, response_1.sendSuccess)(res, { user: userResponse, accessToken }, 'Login successful');
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        if (req.user) {
            // Clear refresh token
            await User_1.User.findByIdAndUpdate(req.user._id, { refreshToken: null });
        }
        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
        (0, response_1.sendSuccess)(res, null, 'Logout successful');
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.body.refreshToken;
        if (!token) {
            (0, response_1.sendError)(res, 'Refresh token required', 401);
            return;
        }
        // Verify token
        let decoded;
        try {
            decoded = (0, jwt_1.verifyToken)(token);
        }
        catch {
            (0, response_1.sendError)(res, 'Invalid refresh token', 401);
            return;
        }
        // Find user with refresh token
        const user = await User_1.User.findById(decoded.userId).select('+refreshToken');
        if (!user || !user.refreshToken) {
            (0, response_1.sendError)(res, 'Invalid refresh token', 401);
            return;
        }
        // Verify stored token matches
        const hashedToken = (0, hash_1.hashToken)(token);
        if (user.refreshToken !== hashedToken) {
            (0, response_1.sendError)(res, 'Invalid refresh token', 401);
            return;
        }
        // Generate new tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user);
        // Update refresh token
        user.refreshToken = (0, hash_1.hashToken)(newRefreshToken);
        await user.save();
        // Set cookies
        res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
        res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, path: '/api/auth/refresh' });
        (0, response_1.sendSuccess)(res, { accessToken }, 'Token refreshed');
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const me = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Not authenticated', 401);
            return;
        }
        const user = await User_1.User.findById(req.user._id)
            .populate('wishlist', 'slug title images priceFrom currency')
            .populate('assignedTenants', 'name slug logo');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, user, 'User retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        // Always return success to prevent email enumeration
        if (!user) {
            (0, response_1.sendSuccess)(res, null, 'If the email exists, a password reset link will be sent');
            return;
        }
        // Generate reset token
        const resetToken = (0, hash_1.generateRandomToken)();
        user.passwordResetToken = (0, hash_1.hashToken)(resetToken);
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();
        // TODO: Send email with reset link
        // await emailService.sendPasswordReset(user.email, resetToken);
        console.log('Password reset token (dev only):', resetToken);
        (0, response_1.sendSuccess)(res, null, 'If the email exists, a password reset link will be sent');
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const hashedToken = (0, hash_1.hashToken)(token);
        const user = await User_1.User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
        }).select('+passwordResetToken +passwordResetExpires');
        if (!user) {
            (0, response_1.sendError)(res, 'Invalid or expired reset token', 400);
            return;
        }
        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.refreshToken = undefined; // Invalidate all sessions
        await user.save();
        (0, response_1.sendSuccess)(res, null, 'Password reset successful');
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Not authenticated', 401);
            return;
        }
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.User.findById(req.user._id).select('+password');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            (0, response_1.sendError)(res, 'Current password is incorrect', 400);
            return;
        }
        // Update password
        user.password = newPassword;
        await user.save();
        (0, response_1.sendSuccess)(res, null, 'Password changed successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
const updateProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'Not authenticated', 401);
            return;
        }
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'country', 'avatar', 'language', 'currency'];
        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }
        const user = await User_1.User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, user, 'Profile updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=auth.controller.js.map