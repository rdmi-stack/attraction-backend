import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getCategories: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCategoryBySlug: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createCategory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCategory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCategory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=categories.controller.d.ts.map