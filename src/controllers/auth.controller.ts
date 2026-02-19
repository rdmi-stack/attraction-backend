import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { generateRandomToken, hashToken } from '../utils/hash';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';
import { env } from '../config/env';
import { sendPasswordResetEmail } from '../services/email.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, country } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    // Create user
    const user = await User.create({
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
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = hashToken(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    // Set cookies
    res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, path: '/api/auth/refresh' });

    sendSuccess(res, { user, accessToken, refreshToken }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Check status
    if (user.status !== 'active') {
      sendError(res, 'Account is not active. Please contact support.', 403);
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = hashToken(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    // Set cookies
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : COOKIE_OPTIONS.maxAge;
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: cookieMaxAge });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, path: '/api/auth/refresh', maxAge: cookieMaxAge });

    // Remove password from response
    const userResponse = user.toJSON();

    sendSuccess(res, { user: userResponse, accessToken, refreshToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user) {
      // Clear refresh token
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      sendError(res, 'Refresh token required', 401);
      return;
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    // Find user with refresh token
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || !user.refreshToken) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    // Verify stored token matches
    const hashedToken = hashToken(token);
    if (user.refreshToken !== hashedToken) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token
    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    // Set cookies
    res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
    res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, path: '/api/auth/refresh' });

    sendSuccess(res, { accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const user = await User.findById(req.user._id)
      .populate('wishlist', 'slug title images priceFrom currency')
      .populate('assignedTenants', 'name slug logo');

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      sendSuccess(res, null, 'If the email exists, a password reset link will be sent');
      return;
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(
      user.email,
      resetToken,
      `${user.firstName} ${user.lastName}`.trim()
    );

    sendSuccess(res, null, 'If the email exists, a password reset link will be sent');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      sendError(res, 'Invalid or expired reset token', 400);
      return;
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();

    sendSuccess(res, null, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'country', 'avatar', 'language', 'currency'];
    const updates: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
