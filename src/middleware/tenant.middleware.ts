import { Response, NextFunction } from 'express';
import { Tenant } from '../models/Tenant';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';

export const resolveTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get tenant from header, query, or host
    let tenantIdentifier: string | undefined;

    // Check X-Tenant-ID header first
    if (req.headers['x-tenant-id']) {
      tenantIdentifier = req.headers['x-tenant-id'] as string;
    }
    // Check query parameter
    else if (req.query.tenantId) {
      tenantIdentifier = req.query.tenantId as string;
    }
    // Try to resolve from host
    else {
      const host = req.headers.host;
      if (host) {
        // Check if it's a subdomain
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'localhost') {
          tenantIdentifier = subdomain;
        }
      }
    }

    if (!tenantIdentifier) {
      // No tenant specified, continue without tenant context
      next();
      return;
    }

    // Find tenant by ID, slug, or domain
    const tenant = await Tenant.findOne({
      $or: [
        { _id: tenantIdentifier },
        { slug: tenantIdentifier },
        { domain: tenantIdentifier },
        { customDomain: tenantIdentifier },
      ],
      status: 'active',
    });

    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireTenant = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenant) {
    sendError(res, 'Tenant context required', 400);
    return;
  }
  next();
};

export const optionalTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let tenantIdentifier: string | undefined;

    if (req.headers['x-tenant-id']) {
      tenantIdentifier = req.headers['x-tenant-id'] as string;
    } else if (req.query.tenantId) {
      tenantIdentifier = req.query.tenantId as string;
    }

    if (tenantIdentifier) {
      const tenant = await Tenant.findOne({
        $or: [
          { _id: tenantIdentifier },
          { slug: tenantIdentifier },
          { domain: tenantIdentifier },
        ],
        status: 'active',
      });

      if (tenant) {
        req.tenant = tenant;
      }
    }

    next();
  } catch {
    next();
  }
};
