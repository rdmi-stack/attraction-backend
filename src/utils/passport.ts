import crypto from 'crypto';
import { env } from '../config/env';

// Foxes Passport (verify side, Attraction Network). The Foxes support portal mints a
// short-lived signed assertion; we verify it with the SHARED Foxes secret
// (FOXES_PASSPORT_SECRET = Foxes NEXTAUTH_SECRET) and exchange it for THIS platform's
// own native JWT. The two secrets never mix — we only verify here, never sign with it.
//
// SECURITY: bound to aud='attraction' (so a booking/voice/search/foxesconnect assertion
// can't be replayed here), TTL-checked, HMAC compared with timingSafeEqual.

export interface PassportClaims {
  sub: string;
  email: string;
  org: string | null;
  role: string;
  mfa?: boolean;
  aud: string;
  iat: number;
  exp: number;
}

const AUDIENCE = 'attraction';

const fromB64url = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
const b64url = (b: Buffer) => b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function verifyPassportAssertion(token: string): PassportClaims | null {
  const secret = env.foxesPassportSecret;
  if (!secret) return null; // SSO not enabled — fail closed when unset

  const [payloadB64, sigPart] = (token || '').split('.');
  if (!payloadB64 || !sigPart) return null;

  const expected = b64url(crypto.createHmac('sha256', secret).update(payloadB64).digest());
  const a = Buffer.from(sigPart);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let claims: PassportClaims;
  try {
    claims = JSON.parse(fromB64url(payloadB64).toString('utf8'));
  } catch {
    return null;
  }
  if (!claims || claims.aud !== AUDIENCE) return null; // <-- the ONLY per-platform change
  if (typeof claims.exp !== 'number' || Math.floor(Date.now() / 1000) > claims.exp) return null;
  // Sanity bound: never accept an assertion with a TTL larger than ~5 minutes.
  if (typeof claims.iat !== 'number' || claims.exp - claims.iat > 300) return null;
  if (!claims.email || typeof claims.email !== 'string') return null;
  return claims;
}
