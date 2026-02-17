import { CorsOptions } from 'cors';
import { env } from './env';

// Support comma-separated FRONTEND_URL for multiple origins
// e.g. FRONTEND_URL=https://myapp.vercel.app,https://custom-domain.com
const allowedOrigins = [
  ...env.frontendUrl.split(',').map((u) => u.trim()).filter(Boolean),
  'http://localhost:3000',
  'http://localhost:3001',
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || env.isDev) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
  maxAge: 86400, // 24 hours
};
