// Shared request helpers for the admin API routes.
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE } from './auth';
import { storeReady } from './store';

/** 503 guard: refuse admin work when durable storage isn't configured. */
export function storeUnavailable(): NextResponse | null {
  return storeReady()
    ? null
    : NextResponse.json({ error: 'Admin storage is not configured.' }, { status: 503 });
}

/**
 * Client IP for rate limiting. Prefer `x-real-ip` (set by Vercel, not settable
 * by the client). The left-most `x-forwarded-for` entry is client-supplied and
 * trivially rotated to defeat the limiter, so it's only a last resort.
 */
function clientIp(req: Request): string {
  const real = req.headers.get('x-real-ip')?.trim();
  if (real) return real;
  return (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim() || 'local';
}

// Same-origin guard (anti-CSRF): a browser always sends Origin on POST. Requests
// from another site are rejected; no-Origin (curl/server) still hits the auth gate.
const ALLOWED = new Set([
  'https://sqbpictures.com',
  'https://www.sqbpictures.com',
  'http://localhost:3000',
]);
export function originAllowed(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  if (ALLOWED.has(origin)) return true;
  try {
    // Only THIS project's preview deployments. A blanket "*.vercel.app" would
    // let anyone's Vercel app POST to us.
    const h = new URL(origin).hostname;
    return h.startsWith('sqb-website') && h.endsWith('.vercel.app');
  } catch { return false; }
}

export function getSessionToken(req: Request): string | null {
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

const secure = process.env.NODE_ENV === 'production';
export function withSession(res: NextResponse, token: string): NextResponse {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure, sameSite: 'strict', path: '/', maxAge: SESSION_MAX_AGE,
  });
  return res;
}
export function clearSession(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure, sameSite: 'strict', path: '/', maxAge: 0 });
  return res;
}

// Best-effort per-IP rate limit (in-memory, per instance) — blunts brute force.
const hits = new Map<string, { n: number; t: number }>();
export function rateLimited(req: Request, key: string, max: number, windowMs: number): boolean {
  const id = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const cur = hits.get(id);
  if (!cur || now - cur.t > windowMs) { hits.set(id, { n: 1, t: now }); return false; }
  cur.n += 1;
  // Evict only EXPIRED entries. A blanket clear() would let a flood of junk keys
  // reset the counter of the very offender we're throttling.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now - v.t > windowMs) hits.delete(k);
  }
  return cur.n > max;
}
