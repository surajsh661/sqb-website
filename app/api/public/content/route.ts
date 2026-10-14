import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin/store';
import { loadThumbs, resolveThumbs } from '@/lib/admin/thumbs';
import { applyCaseCopyFixes } from '@/lib/case-copy-fixes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public, read-only: the case-study overrides and custom thumbnails the owner
// saved in /admin. The site merges these onto the base data so edits appear live. Edge-cached
// briefly so updates show within ~20s without hammering the KV command budget.
export async function GET() {
  let overrides: Record<string, unknown> = {};
  let thumbs: Record<string, string> = {};
  try {
    const raw = await adminStore().get('content:overrides');
    if (raw) overrides = applyCaseCopyFixes(JSON.parse(raw));
  } catch {
    /* KV unavailable → serve base content (empty overrides) */
  }
  try {
    thumbs = resolveThumbs(await loadThumbs());
  } catch {
    /* KV unavailable → built-in thumbnails */
  }
  return NextResponse.json(
    { overrides, thumbs },
    // max-age=0: browsers must revalidate, or a visitor's own cached copy keeps
    // showing old edits; the CDN still serves it (s-maxage) to spare the KV budget.
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=20, stale-while-revalidate=60' } },
  );
}
