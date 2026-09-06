import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ─────────────────────────────────────────────────────────────────────────────
// Crash sink. The browser posts here when a page throws; we write it to the
// server log, which lands in Vercel → Project → Logs (searchable, retained,
// no third-party account and no cost).
//
// Kept deliberately dumb: it stores nothing, sends nothing onward, and answers
// 204 no matter what. A crash reporter that can itself fail loudly, or that
// can be used to spam an inbox, is worse than no crash reporter.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  'https://sqbpictures.com',
  'https://www.sqbpictures.com',
  'http://localhost:3000',
]);
const originAllowed = (req: Request) => {
  const origin = req.headers.get('origin');
  if (!origin) return true; // beacons/no-origin: still gated by the rate limit
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const h = new URL(origin).hostname;
    return h.startsWith('sqb-website') && h.endsWith('.vercel.app');
  } catch { return false; }
};

const clientIp = (req: Request) =>
  req.headers.get('x-real-ip')?.trim() ||
  (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim() ||
  'unknown';

// A crashing page can fire in a loop — cap hard so one bad browser can't flood
// the logs (or the function's execution budget).
const hits = new Map<string, { n: number; t: number }>();
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 10;
const rateLimited = (req: Request) => {
  const ip = clientIp(req);
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.t > RATE_WINDOW_MS) { hits.set(ip, { n: 1, t: now }); return false; }
  cur.n += 1;
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now - v.t > RATE_WINDOW_MS) hits.delete(k);
  }
  return cur.n > RATE_MAX;
};

const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '');

export async function POST(req: Request) {
  // Always 204: the client must never retry, branch, or surface a failure here.
  if (!originAllowed(req) || rateLimited(req)) return new NextResponse(null, { status: 204 });

  try {
    const b = (await req.json()) as Record<string, unknown>;
    const message = str(b.message, 500).trim();
    if (!message) return new NextResponse(null, { status: 204 });

    console.error('[client-crash]', JSON.stringify({
      message,
      source: str(b.source, 60) || 'window',       // window | promise | react | global
      page: str(b.page, 300),
      stack: str(b.stack, 2000),
      ua: str(req.headers.get('user-agent'), 300),
      at: new Date().toISOString(),
    }));
  } catch { /* malformed body — nothing to report */ }

  return new NextResponse(null, { status: 204 });
}
