// ─────────────────────────────────────────────────────────────────────────────
// Thumbnail catalog: every video on the site that shows a poster, keyed by its
// video ID (a video uses the same thumbnail wherever it appears). The admin
// console lists these, and the API only accepts thumbnails for IDs in here.
// Client-safe: no server imports.
// ─────────────────────────────────────────────────────────────────────────────
import { SQB_FILMS, SQB_VERTICALS, SQB_AI_LAB, SQB_HERO_FILMS, HERO_POSTERS } from './data';
import { thumbSources } from './video-utils';
import type { VideoType } from './types';

export interface ThumbSlot {
  videoId: string;
  type: VideoType;
  title: string;
  /** Where the video appears, e.g. "Home · Vertical Cinema". */
  where: string[];
  vertical: boolean;
  /** Built-in poster (null when the site resolves it at runtime, e.g. Vimeo). */
  builtIn: string | null;
}

/** IDs are Vimeo/YouTube/Drive/Instagram IDs: letters, digits, - and _. */
export const VIDEO_ID_RE = /^[A-Za-z0-9_-]{3,80}$/;

const titleCase = (s: string) => s.replace(/\s+—\s+.*$/, '').trim();

export function thumbCatalog(): ThumbSlot[] {
  const slots = new Map<string, ThumbSlot>();
  const add = (videoId: string, type: VideoType, title: string, where: string, vertical: boolean, poster?: string) => {
    const cur = slots.get(videoId);
    if (cur) {
      if (!cur.where.includes(where)) cur.where.push(where);
      return;
    }
    slots.set(videoId, {
      videoId, type, title: titleCase(title), where: [where], vertical,
      builtIn: poster || HERO_POSTERS[videoId] || (type === 'vm' ? null : thumbSources({ type, videoId })[vertical ? 1 : 0] || null),
    });
  };

  const heroIds = new Set(SQB_HERO_FILMS.map((f) => f.videoId));
  for (const f of SQB_FILMS) {
    const vertical = (f.genres || []).includes('vertical');
    if (heroIds.has(f.videoId)) add(f.videoId, f.type, f.title, 'Home · Hero', vertical);
    add(f.videoId, f.type, f.title, vertical ? 'Vertical Cinema' : 'Video page · Films', vertical);
  }
  for (const v of SQB_VERTICALS) add(v.videoId, v.type, v.title, 'Home · Vertical Cinema', true);

  const lab = SQB_AI_LAB;
  const labGroups: [string, typeof lab.animated][] = [
    ['AI Lab · AI Micro Dramas', lab.microDramas],
    ['AI Lab · AI Cinematic Films', [lab.featured, ...lab.realistic]],
    ['AI Lab · AI Animation', lab.animated],
    ['AI Lab · Visual Effects and 3D', lab.vfx],
  ];
  for (const [where, items] of labGroups) {
    for (const it of items) add(it.videoId, it.type, it.title, where, !!it.vertical, it.poster);
  }
  return [...slots.values()];
}
