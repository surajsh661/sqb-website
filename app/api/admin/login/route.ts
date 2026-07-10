import { NextResponse } from 'next/server';
import { checkPassword, issueSession, isSetup } from '@/lib/admin/auth';
import { originAllowed, withSession, rateLimited, storeUnavailable } from '@/lib/admin/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (rateLimited(req, 'login', 8, 5 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Wait a few minutes.' }, { status: 429 });
  }
  if (!(await isSetup())) return NextResponse.json({ error: 'not set up' }, { status: 409 });

  let body: { password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }
  if (!(await checkPassword((body.password || '').trim()))) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }
  return withSession(NextResponse.json({ ok: true }), await issueSession());
}
