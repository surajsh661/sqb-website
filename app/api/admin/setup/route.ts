import { NextResponse } from 'next/server';
import { isSetup, setPassword, issueSession, MIN_PASSWORD_LEN } from '@/lib/admin/auth';
import { originAllowed, withSession, rateLimited, storeUnavailable } from '@/lib/admin/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// First-run password setup. Only works while NO password exists — once set, this
// returns 409 so it can't be used to overwrite the password (reset does that).
export async function POST(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (rateLimited(req, 'setup', 10, 60_000)) return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  if (await isSetup()) return NextResponse.json({ error: 'already set up' }, { status: 409 });

  let body: { password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }
  const pw = (body.password || '').trim();
  if (pw.length < MIN_PASSWORD_LEN) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LEN} characters.` }, { status: 400 });
  }
  await setPassword(pw);
  return withSession(NextResponse.json({ ok: true }), await issueSession());
}
