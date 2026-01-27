import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, errors?: Array<{
    field: string;
    message: string;
}>) => Response;
export declare const sendPaginated: <T>(res: Response, data: T[], page: number, limit: number, total: number, message?: string) => Response;
//# sourceMappingURL=response.d.ts.map