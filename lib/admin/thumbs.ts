// Custom thumbnails saved from /admin → Thumbnails.
//
// Two kinds, keyed by video ID:
//  · 'url'    — a link to an image hosted elsewhere, used as-is.
//  · 'upload' — an image uploaded in the console. The browser shrinks it before
//               sending (≤1280px, JPEG), and the bytes live in the KV store under
//               their own key, served by /api/public/thumb/<id>. `v` versions the
//               URL so a replaced image is never served from a stale cache.
import { adminStore } from './store';

export const THUMBS_KEY = 'content:thumbs';
export const thumbImgKey = (videoId: string) => `thumbs:img:${videoId}`;

/** Upstash's request cap is 1 MB; keep the stored base64 comfortably under it. */
export const MAX_UPLOAD_B64 = 800_000;

export type ThumbEntry = { v: number; kind: 'url' | 'upload'; url?: string };
export type StoredImage = { type: string; b64: string };

export async function loadThumbs(): Promise<Record<string, ThumbEntry>> {
  const raw = await adminStore().get(THUMBS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, ThumbEntry>) : {};
}

export async function saveThumbs(map: Record<string, ThumbEntry>): Promise<void> {
  await adminStore().set(THUMBS_KEY, JSON.stringify(map));
}

/** The public src for each custom thumbnail. */
export function resolveThumbs(map: Record<string, ThumbEntry>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, e] of Object.entries(map)) {
    if (e.kind === 'url' && e.url) out[id] = e.url;
    else if (e.kind === 'upload') out[id] = `/api/public/thumb/${encodeURIComponent(id)}?v=${e.v}`;
  }
  return out;
}

/** Checks the file really is the image type it claims (magic bytes). */
export function imageMatches(type: string, buf: Buffer): boolean {
  if (type === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (type === 'image/png') return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === 'image/webp') return buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}
