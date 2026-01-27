import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getAttractions: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAttractionBySlug: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAttractionById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAttractionReviews: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAttractionAvailability: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createAttraction: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateAttraction: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAttraction: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getFeaturedAttractions: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=attractions.controller.d.ts.map