// Shared request helpers for the admin API routes.
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE } from './auth';

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
  try { return new URL(origin).hostname.endsWith('.vercel.app'); } catch { return false; }
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
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const id = `${key}:${ip}`;
  const now = Date.now();
  const cur = hits.get(id);
  if (!cur || now - cur.t > windowMs) { hits.set(id, { n: 1, t: now }); return false; }
  cur.n += 1;
  if (hits.size > 5000) hits.clear();
  return cur.n > max;
}
