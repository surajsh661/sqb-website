'use client';
import { useEffect, useState } from 'react';
import { thumbSources, fetchVimeoThumb } from '@/lib/video-utils';
import { HERO_POSTERS } from '@/lib/data';
import { useThumbs } from '@/lib/useOverrides';
import type { Film } from '@/lib/types';

interface Props {
  film: Pick<Film, 'type' | 'videoId' | 'title'>;
  className?: string;
  /** Mark the above-the-fold poster (the centred hero film) so the browser
   *  fetches it at top priority — it IS the page's LCP element. */
  priority?: boolean;
  /** Show the built-in poster only (the admin console previews it this way). */
  noCustom?: boolean;
}

export default function HeroThumb({ film, className, priority, noCustom }: Props) {
  // A thumbnail set in /admin wins. If it fails to load, fall back to the
  // built-in poster rather than showing a broken image.
  const custom = useThumbs()[film.videoId];
  const [customFailed, setCustomFailed] = useState(false);
  const useCustom = !noCustom && !!custom && !customFailed;
  const [idx, setIdx] = useState(0);
  // A baked-in official poster (hero films) shows instantly — no oembed fetch,
  // no third-party proxy. Falls back to the deterministic thumbnail sources.
  const preset = HERO_POSTERS[film.videoId];
  const [override, setOverride] = useState<string | null>(preset || null);
  const sources = thumbSources(film);

  useEffect(() => {
    if (preset) return; // official poster already baked in — skip the round-trip
    if (film.type !== 'vm') return;
    let cancelled = false;
    fetchVimeoThumb(film.videoId).then((url) => {
      if (!cancelled && url) setOverride(url);
    });
    return () => { cancelled = true; };
  }, [film.type, film.videoId, preset]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={useCustom ? custom : (override || sources[idx])}
      alt={film.title}
      referrerPolicy="no-referrer"
      className={className}
      fetchPriority={priority ? 'high' : undefined}
      loading={priority ? 'eager' : undefined}
      /* decorative thumbnail — never native-draggable. Without this, starting a
         drag on a barrel/hero card "picks up" the image (browser drag ghost)
         and steals the pointer events from the spin/swipe handlers. */
      draggable={false}
      onError={() => {
        if (useCustom) setCustomFailed(true);
        else if (override) setOverride(null);
        else setIdx((i) => Math.min(i + 1, sources.length - 1));
      }}
    />
  );
}
