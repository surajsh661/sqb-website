import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin/auth';
import { getSessionToken, originAllowed, storeUnavailable } from '@/lib/admin/http';
import { adminStore } from '@/lib/admin/store';
import {
  loadThumbs, saveThumbs, resolveThumbs, thumbImgKey, imageMatches, MAX_UPLOAD_B64,
} from '@/lib/admin/thumbs';
import { thumbCatalog, VIDEO_ID_RE } from '@/lib/thumbs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authed = async (req: Request) => verifySession(getSessionToken(req));
const knownIds = () => new Set(thumbCatalog().map((s) => s.videoId));
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

// Guards shared by every write: storage, same-origin, session.
async function guard(req: Request): Promise<NextResponse | null> {
  const down = storeUnavailable();
  if (down) return down;
  if (!originAllowed(req)) return bad('forbidden', 403);
  if (!(await authed(req))) return bad('unauthorized', 401);
  return null;
}

// GET → every video slot, plus its current custom thumbnail (if any).
export async function GET(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!(await authed(req))) return bad('unauthorized', 401);
  const custom = resolveThumbs(await loadThumbs());
  const items = thumbCatalog().map((s) => ({ ...s, custom: custom[s.videoId] || null }));
  return NextResponse.json({ items });
}

// PUT { videoId, url } → use an image link · PUT { videoId, image: dataURL } → upload.
export async function PUT(req: Request) {
  const g = await guard(req);
  if (g) return g;

  let body: { videoId?: unknown; url?: unknown; image?: unknown };
  try { body = await req.json(); } catch { return bad('bad request'); }
  const videoId = typeof body.videoId === 'string' ? body.videoId : '';
  if (!VIDEO_ID_RE.test(videoId) || !knownIds().has(videoId)) return bad('Unknown video.');

  const map = await loadThumbs();

  if (typeof body.url === 'string') {
    const raw = body.url.trim();
    let u: URL;
    try { u = new URL(raw); } catch { return bad('That isn’t a valid link.'); }
    if (u.protocol !== 'https:' || raw.length > 1000) return bad('Use an https:// image link.');
    map[videoId] = { v: Date.now(), kind: 'url', url: u.toString() };
    await adminStore().del(thumbImgKey(videoId));
  } else if (typeof body.image === 'string') {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/.exec(body.image);
    if (!m) return bad('Upload a JPG, PNG or WebP image.');
    if (m[2].length > MAX_UPLOAD_B64) return bad('That image is too large. Try a smaller one.');
    if (!imageMatches(m[1], Buffer.from(m[2], 'base64'))) return bad('That file isn’t a valid image.');
    await adminStore().set(thumbImgKey(videoId), JSON.stringify({ type: m[1], b64: m[2] }));
    map[videoId] = { v: Date.now(), kind: 'upload' };
  } else {
    return bad('Nothing to save.');
  }

  await saveThumbs(map);
  return NextResponse.json({ ok: true, custom: resolveThumbs(map)[videoId] });
}

// DELETE { videoId } → back to the built-in thumbnail.
export async function DELETE(req: Request) {
  const g = await guard(req);
  if (g) return g;
  let body: { videoId?: unknown };
  try { body = await req.json(); } catch { return bad('bad request'); }
  const videoId = typeof body.videoId === 'string' ? body.videoId : '';
  if (!VIDEO_ID_RE.test(videoId)) return bad('Unknown video.');
  const map = await loadThumbs();
  delete map[videoId];
  await saveThumbs(map);
  await adminStore().del(thumbImgKey(videoId));
  return NextResponse.json({ ok: true });
}
