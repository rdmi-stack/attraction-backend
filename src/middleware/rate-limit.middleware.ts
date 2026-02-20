import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const isLocalAddress = (ip?: string): boolean => {
  if (!ip) return false;
  const normalized = ip.replace('::ffff:', '');
  return normalized === '127.0.0.1' || normalized === '::1';
};

const shouldSkipRateLimit = (ip?: string): boolean =>
  env.nodeEnv !== 'production' && isLocalAddress(ip);

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs, // 15 minutes by default
  max: env.rateLimitMaxRequests, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => shouldSkipRateLimit(req.ip),
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => shouldSkipRateLimit(req.ip),
});

// Limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => shouldSkipRateLimit(req.ip),
});

// Limiter for creating bookings
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 bookings per minute
  message: {
    success: false,
    error: 'Too many booking attempts, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => shouldSkipRateLimit(req.ip),
});

// Limiter for search endpoints
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  message: {
    success: false,
    error: 'Too many search requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => shouldSkipRateLimit(req.ip),
});
