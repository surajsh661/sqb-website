'use client';
import { useEffect, useState } from 'react';
import { thumbSources, fetchVimeoThumb } from '@/lib/video-utils';
import type { Film } from '@/lib/types';

interface Props {
  film: Pick<Film, 'type' | 'videoId' | 'title'>;
  className?: string;
}

export default function HeroThumb({ film, className }: Props) {
  const [idx, setIdx] = useState(0);
  const [override, setOverride] = useState<string | null>(null);
  const sources = thumbSources(film);

  useEffect(() => {
    if (film.type !== 'vm') return;
    let cancelled = false;
    fetchVimeoThumb(film.videoId).then((url) => {
      if (!cancelled && url) setOverride(url);
    });
    return () => { cancelled = true; };
  }, [film.type, film.videoId]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={override || sources[idx]}
      alt={film.title}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => {
        if (override) setOverride(null);
        else setIdx((i) => Math.min(i + 1, sources.length - 1));
      }}
    />
  );
}
