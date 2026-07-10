import { NextResponse } from 'next/server';
import { roleById } from '@/lib/careers';
import { ROLE_BRIEF } from '@/lib/careers-salary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The budget, served only when a candidate proceeds to apply. Kept out of the
// listing HTML, the client bundle and the search index. `noindex` + no-store so
// it is never cached or crawled.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('role') || '';
  if (!roleById(id)) return NextResponse.json({ error: 'Unknown role.' }, { status: 404 });

  const brief = ROLE_BRIEF[id] ?? { salary: null, note: 'Discussed on the first call.' };
  return NextResponse.json(brief, {
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
