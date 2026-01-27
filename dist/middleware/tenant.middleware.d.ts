import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const resolveTenant: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireTenant: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalTenant: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=tenant.middleware.d.ts.map