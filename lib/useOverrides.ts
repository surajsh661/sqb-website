'use client';
import { useEffect, useState } from 'react';
import type { Film } from './types';

// Edits saved in /admin, applied to the public site: case-study overrides and
// custom thumbnails (video ID → image src). Fetched once per page load and
// cached in module scope so every component shares one request.
type Overrides = Record<string, Partial<Film>>;
type Thumbs = Record<string, string>;
type Content = { overrides: Overrides; thumbs: Thumbs };

const EMPTY: Content = { overrides: {}, thumbs: {} };
let cache: Content | null = null;
let inflight: Promise<Content> | null = null;

async function load(): Promise<Content> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetch('/api/public/content')
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((d) => {
        cache = { overrides: (d.overrides || {}) as Overrides, thumbs: (d.thumbs || {}) as Thumbs };
        return cache;
      })
      .catch(() => EMPTY);
  }
  return inflight;
}

function useContent(): Content {
  const [c, setC] = useState<Content>(cache || EMPTY);
  useEffect(() => {
    let alive = true;
    load().then((v) => { if (alive) setC(v); });
    return () => { alive = false; };
  }, []);
  return c;
}

export function useOverrides(): Overrides {
  return useContent().overrides;
}

/** Custom thumbnails set in /admin → Thumbnails, keyed by video ID. */
export function useThumbs(): Thumbs {
  return useContent().thumbs;
}

/** Overlay a film's saved edits onto its base data (id-matched). */
export function mergeFilm<T extends Film | null>(film: T, overrides: Overrides): T {
  if (!film) return film;
  const o = overrides[film.id];
  return o ? ({ ...film, ...o } as T) : film;
}
