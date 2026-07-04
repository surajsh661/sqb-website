'use client';
import { useEffect, useState } from 'react';
import type { Film } from './types';

// Case-study edits saved in /admin, applied to the public site. Fetched once
// per page load and cached in module scope so every component shares one request.
type Overrides = Record<string, Partial<Film>>;

let cache: Overrides | null = null;
let inflight: Promise<Overrides> | null = null;

async function load(): Promise<Overrides> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetch('/api/public/content')
      .then((r) => (r.ok ? r.json() : { overrides: {} }))
      .then((d) => { cache = (d.overrides || {}) as Overrides; return cache; })
      .catch(() => ({} as Overrides));
  }
  return inflight;
}

export function useOverrides(): Overrides {
  const [ov, setOv] = useState<Overrides>(cache || {});
  useEffect(() => {
    let alive = true;
    load().then((o) => { if (alive) setOv(o); });
    return () => { alive = false; };
  }, []);
  return ov;
}

/** Overlay a film's saved edits onto its base data (id-matched). */
export function mergeFilm<T extends Film | null>(film: T, overrides: Overrides): T {
  if (!film) return film;
  const o = overrides[film.id];
  return o ? ({ ...film, ...o } as T) : film;
}
