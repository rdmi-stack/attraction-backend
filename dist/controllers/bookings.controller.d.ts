import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const createBooking: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getBookingByReference: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyBookings: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelBooking: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getBookingTicket: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllBookings: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateBookingStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getBookingStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=bookings.controller.d.ts.map