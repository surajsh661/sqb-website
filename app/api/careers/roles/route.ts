import { NextResponse } from 'next/server';
import { getPublicRoles } from '@/lib/careers-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public: the open roles, salary stripped. Edge-cached briefly so edits show
// within ~15s without a KV read per request.
export async function GET() {
  let roles;
  try { roles = await getPublicRoles(); } catch { roles = []; }
  return NextResponse.json(
    { roles },
    { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=45' } },
  );
}
