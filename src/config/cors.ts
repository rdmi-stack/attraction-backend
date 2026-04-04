import { CorsOptions } from 'cors';
import { env } from './env';

// Support comma-separated FRONTEND_URL for multiple origins
// e.g. FRONTEND_URL=https://myapp.vercel.app,https://custom-domain.com
const allowedOrigins = [
  ...env.frontendUrl.split(',').map((u) => u.trim()).filter(Boolean),
  'http://localhost:3000',
  'http://localhost:3001',
];

// Patterns for dynamic subdomain matching + custom tenant domains
const allowedPatterns = [
  /\.netlify\.app$/,
  /\.foxesnetwork\.com$/,
  /\.up\.railway\.app$/,
  // Custom tenant domains (Fouad's client brands)
  /^makadihorseclub\.com$/,
  /^cairotourfromhurghada\.com$/,
  /^cairotourspackages\.com$/,
  /^parasailinghurghada\.com$/,
  /^luxortourfromhurghada\.com$/,
  /^horseridinghurghada\.com$/,
  /^hurghadasnorkeling\.com$/,
  /^pyramidsexcursions\.com$/,
  /^hurghadaprivatesafari\.com$/,
  /^makadibaysafari\.com$/,
  /^safariredsea\.com$/,
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check pattern match (subdomains)
    try {
      const hostname = new URL(origin).hostname;
      if (allowedPatterns.some((pattern) => pattern.test(hostname))) {
        return callback(null, true);
      }
    } catch {
      // Invalid URL, reject
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Tenant-Slug'],
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
  maxAge: 86400, // 24 hours
};
