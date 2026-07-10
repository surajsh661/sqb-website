import { NextResponse } from 'next/server';
import { clearSession, originAllowed } from '@/lib/admin/http';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // Without this a cross-site page could force-log-out the admin (nuisance CSRF).
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  return clearSession(NextResponse.json({ ok: true }));
}
