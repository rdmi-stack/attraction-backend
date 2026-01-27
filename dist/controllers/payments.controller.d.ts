import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../types';
export declare const createPaymentIntent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const handleWebhook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPaymentStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const refundPayment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=payments.controller.d.ts.map