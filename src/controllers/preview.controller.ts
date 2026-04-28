import { Response, NextFunction, Request } from 'express';
import { Tenant } from '../models/Tenant';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { generatePreviewAccessCode } from '../utils/hash';
import { Types } from 'mongoose';

const adminRoles = ['super-admin', 'brand-admin', 'manager'];

const hasTenantAccess = (req: AuthRequest, tenantId?: unknown): boolean => {
  if (!req.user || !tenantId) return false;
  if (req.user.role === 'super-admin') return true;
  if (!adminRoles.includes(req.user.role)) return false;
  return (req.user.assignedTenants || []).some(
    (assignedTenantId) => assignedTenantId.toString() === String(tenantId)
  );
};

// Normalise codes for comparison (strip whitespace + hyphens, uppercase)
const normalise = (raw: string): string => raw.replace(/[-\s]/g, '').toUpperCase();

/**
 * POST /api/preview/unlock
 * Public. Validates a per-tenant preview access code. Returns minimal tenant
 * metadata on success so the gate page can confirm and redirect. Wrong code
 * returns 401 with no tenant info (don't leak existence).
 */
export const unlockPreview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tenantSlug, code } = req.body as { tenantSlug?: string; code?: string };

    if (!tenantSlug || !code) {
      sendError(res, 'tenantSlug and code are required', 400);
      return;
    }

    const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase().trim() }).select(
      '+previewAccessCode slug name logo theme designMode'
    );

    if (!tenant || !tenant.previewAccessCode) {
      // Generic message — don't reveal whether the tenant exists
      sendError(res, 'Invalid access code', 401);
      return;
    }

    if (normalise(tenant.previewAccessCode) !== normalise(code)) {
      sendError(res, 'Invalid access code', 401);
      return;
    }

    sendSuccess(
      res,
      {
        tenant: {
          slug: tenant.slug,
          name: tenant.name,
          logo: tenant.logo,
          theme: tenant.theme,
          designMode: tenant.designMode,
        },
      },
      'Access granted'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/preview/lookup?slug=<slug>
 * Public. Returns minimal tenant metadata (name, logo) so the gate page can
 * personalise the prompt. Does NOT return the access code or signal whether
 * a code is configured.
 */
export const lookupPreviewTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slug = String(req.query.slug || '').toLowerCase().trim();
    if (!slug) {
      sendError(res, 'slug query param required', 400);
      return;
    }

    const tenant = await Tenant.findOne({ slug }).select(
      'slug name logo tagline theme designMode'
    );
    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    sendSuccess(res, {
      slug: tenant.slug,
      name: tenant.name,
      logo: tenant.logo,
      tagline: tenant.tagline,
      theme: tenant.theme,
      designMode: tenant.designMode,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/preview/admin/code/:tenantId
 * Admin only — returns the actual access code so the team can share it with
 * a client. Tenant-scoped: brand-admin can only fetch their own tenant's code.
 */
export const getPreviewCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tenantId } = req.params;
    if (!Types.ObjectId.isValid(tenantId)) {
      sendError(res, 'Invalid tenant id', 400);
      return;
    }

    if (req.user?.role !== 'super-admin' && !hasTenantAccess(req, tenantId)) {
      sendError(res, 'Access denied', 403);
      return;
    }

    const tenant = await Tenant.findById(tenantId).select(
      '+previewAccessCode previewAccessCodeUpdatedAt slug name'
    );
    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    sendSuccess(res, {
      tenantId: tenant._id.toString(),
      slug: tenant.slug,
      name: tenant.name,
      previewAccessCode: tenant.previewAccessCode || null,
      previewAccessCodeUpdatedAt: tenant.previewAccessCodeUpdatedAt || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/preview/admin/regenerate/:tenantId
 * Admin only — generates a new code, returns it once.
 */
export const regeneratePreviewCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tenantId } = req.params;
    if (!Types.ObjectId.isValid(tenantId)) {
      sendError(res, 'Invalid tenant id', 400);
      return;
    }

    if (req.user?.role !== 'super-admin' && !hasTenantAccess(req, tenantId)) {
      sendError(res, 'Access denied', 403);
      return;
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      sendError(res, 'Tenant not found', 404);
      return;
    }

    const newCode = generatePreviewAccessCode();
    tenant.previewAccessCode = newCode;
    tenant.previewAccessCodeUpdatedAt = new Date();
    await tenant.save();

    sendSuccess(
      res,
      {
        tenantId: tenant._id.toString(),
        previewAccessCode: newCode,
        previewAccessCodeUpdatedAt: tenant.previewAccessCodeUpdatedAt,
      },
      'New preview access code generated'
    );
  } catch (error) {
    next(error);
  }
};
