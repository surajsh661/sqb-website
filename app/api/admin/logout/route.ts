import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/admin/http';

export const runtime = 'nodejs';

export async function POST() {
  return clearSession(NextResponse.json({ ok: true }));
}
