import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getDestinations: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDestinationBySlug: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getFeaturedDestinations: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createDestination: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateDestination: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteDestination: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=destinations.controller.d.ts.map