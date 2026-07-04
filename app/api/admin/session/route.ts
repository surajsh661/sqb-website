import { NextResponse } from 'next/server';
import { isSetup, verifySession } from '@/lib/admin/auth';
import { getSessionToken } from '@/lib/admin/http';
import { storeMode } from '@/lib/admin/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Portal bootstrap: tells the client whether a password exists yet (→ setup vs
// login) and whether this browser is authenticated.
export async function GET(req: Request) {
  const [setup, authed] = await Promise.all([isSetup(), verifySession(getSessionToken(req))]);
  return NextResponse.json({ isSetup: setup, isAuthed: authed, store: storeMode() });
}
