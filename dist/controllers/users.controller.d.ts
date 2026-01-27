import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getWishlist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addToWishlist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const removeFromWishlist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const inviteUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=users.controller.d.ts.map