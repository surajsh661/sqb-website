import { NextResponse } from 'next/server';
import { consumeResetCode, setPassword, bumpTokenVersion, issueSession, MIN_PASSWORD_LEN } from '@/lib/admin/auth';
import { originAllowed, withSession, rateLimited, storeUnavailable } from '@/lib/admin/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Verifies the emailed code, sets the new password, invalidates every existing
// session (bumpTokenVersion), then logs THIS browser back in.
export async function POST(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (rateLimited(req, 'reset-confirm', 10, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 });
  }
  let body: { code?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }

  const pw = (body.password || '').trim();
  if (pw.length < MIN_PASSWORD_LEN) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LEN} characters.` }, { status: 400 });
  }
  if (!(await consumeResetCode((body.code || '').trim()))) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 });
  }
  await setPassword(pw);
  await bumpTokenVersion();
  return withSession(NextResponse.json({ ok: true }), await issueSession());
}
