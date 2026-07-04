import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public, read-only: the case-study overrides the owner saved in /admin. The
// site merges these onto the base film data so edits appear live. Edge-cached
// briefly so updates show within ~20s without hammering the KV command budget.
export async function GET() {
  let overrides: Record<string, unknown> = {};
  try {
    const raw = await adminStore().get('content:overrides');
    if (raw) overrides = JSON.parse(raw);
  } catch {
    /* KV unavailable → serve base content (empty overrides) */
  }
  return NextResponse.json(
    { overrides },
    { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' } },
  );
}
