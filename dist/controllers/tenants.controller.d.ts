import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getTenants: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTenantById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTenantBySlug: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createTenant: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTenant: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteTenant: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTenantStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=tenants.controller.d.ts.map