import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../types';
export interface TokenPayload extends JwtPayload {
    userId: string;
    email: string;
    role: string;
}
export declare const generateAccessToken: (user: IUser) => string;
export declare const generateRefreshToken: (user: IUser) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const decodeToken: (token: string) => TokenPayload | null;
//# sourceMappingURL=jwt.d.ts.map