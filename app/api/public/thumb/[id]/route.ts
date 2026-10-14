import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin/store';
import { thumbImgKey, type StoredImage } from '@/lib/admin/thumbs';
import { VIDEO_ID_RE } from '@/lib/thumbs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Serves a thumbnail uploaded in /admin. The site always requests it with a
// ?v=<version> that changes on every upload, so it can be cached for a year.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!VIDEO_ID_RE.test(id)) return new NextResponse('Not found', { status: 404 });
  let img: StoredImage | null = null;
  try {
    const raw = await adminStore().get(thumbImgKey(id));
    if (raw) img = JSON.parse(raw) as StoredImage;
  } catch { /* KV unavailable */ }
  if (!img) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(Buffer.from(img.b64, 'base64'), {
    headers: {
      'Content-Type': img.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
