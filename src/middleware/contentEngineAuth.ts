import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { env } from '../config';
import { sendError } from '../utils/response';

/**
 * Bearer-token auth for the foxes-content-engine publishing bridge. Validates
 * Authorization against CONTENT_ENGINE_API_KEY with a timing-safe compare —
 * separate from the user JWT auth (no DB lookup, static shared secret).
 */
export const authenticateContentEngine = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const expected = env.contentEngineApiKey;
  if (!expected) {
    sendError(res, 'Content engine not configured (missing CONTENT_ENGINE_API_KEY)', 503);
    return;
  }
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    sendError(res, 'Missing bearer token', 401);
    return;
  }
  const presented = header.slice(7).trim();
  if (
    presented.length !== expected.length ||
    !timingSafeEqual(Buffer.from(presented), Buffer.from(expected))
  ) {
    sendError(res, 'Invalid token', 401);
    return;
  }
  next();
};
