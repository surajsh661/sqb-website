'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import HeroThumb from './HeroThumb';
import type { Film } from '@/lib/types';

// Single-screen cinema hero. One big video plays centred on a dark stage,
// ambient glow bleeds out from behind it; bottom-left carries the current
// film's title + meta, bottom-right shows the next-up film with a pair of
// up/down arrows. Click the screen to open the case study. Arrow keys
// navigate.

// Map videoId to a deterministic random-feeling start offset (5–30s) so each
// video opens mid-clip rather than at t=0. Hash-based so the URL stays
// stable across re-renders (otherwise the iframe would reload).
function startOffsetSeconds(videoId: string): number {
  let h = 0;
  for (let i = 0; i < videoId.length; i++) h = (h << 5) - h + videoId.charCodeAt(i);
  return 5 + (Math.abs(h) % 26);
}

function videoSrc(film: Film) {
  const t = startOffsetSeconds(film.videoId);
  if (film.type === 'vm') {
    return `https://player.vimeo.com/video/${film.videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&dnt=1&autopause=0&playsinline=1&transparent=0#t=${t}s`;
  }
  if (film.type === 'gd') {
    return `https://drive.google.com/file/d/${film.videoId}/preview`;
  }
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  return `https://www.youtube-nocookie.com/embed/${film.videoId}?autoplay=1&mute=1&loop=1&playlist=${film.videoId}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&enablejsapi=1&origin=${origin}&start=${t}`;
}

interface Props {
  films: Film[];
  onPick: (film: Film) => void;
  showCursorHint?: boolean;
}

export default function Hero({ films, onPick }: Props) {
  const N = films.length;
  const [activeIdx, setActiveIdx] = useState(0);
  const paused = useRef(false);

  const current = films[activeIdx];
  const next = films[(activeIdx + 1) % N];

  const advance = useCallback(() => setActiveIdx((i) => (i + 1) % N), [N]);
  const back = useCallback(() => setActiveIdx((i) => (i - 1 + N) % N), [N]);

  // Auto-advance every 8s unless the user is hovering the nav (paused).
  useEffect(() => {
    if (N <= 1) return;
    const id = window.setInterval(() => {
      if (!paused.current) advance();
    }, 8000);
    return () => clearInterval(id);
  }, [advance, N]);

  // Arrow keys navigate; Enter opens the case study.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack keys while focus is inside an input/textarea.
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || (t as HTMLElement).isContentEditable)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        advance();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, back]);

  return (
    <section className="hero hx" data-screen-label="01 Hero">
      {/* Ambient glow — blown-up & blurred frame of the centred film, painted
          behind the screen for the "lights bleeding into the room" feel. */}
      <div className="hx-ambient" aria-hidden="true">
        <div className="hx-ambient-img" key={current.id}>
          <HeroThumb film={current} className="hx-ambient-img-inner" />
        </div>
        <div className="hx-ambient-grain" />
      </div>

      {/* The cinema screen. */}
      <button
        type="button"
        className="hx-screen"
        onClick={() => onPick(current)}
        aria-label={`Open ${current.title}`}
      >
        <div className="hx-screen-inner">
          {films.map((film, i) => (
            <div
              key={film.id}
              className={'hx-slide' + (i === activeIdx ? ' active' : '')}
              aria-hidden={i !== activeIdx}
            >
              <HeroThumb film={film} className="hx-poster" />
              {i === activeIdx && film.type !== 'gd' && (
                <iframe
                  key={film.videoId}
                  className="hx-video"
                  src={videoSrc(film)}
                  title={film.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  loading="eager"
                  frameBorder={0}
                />
              )}
              {i === activeIdx && film.type === 'gd' && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  className="hx-video"
                  src={`https://drive.google.com/uc?export=download&id=${film.videoId}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
              )}
              <div className="hx-shade" />
            </div>
          ))}
        </div>
      </button>

      {/* Bottom-left title block. */}
      <div className="hx-title">
        <div className="hx-cat">
          <span className="dot" /> {current.category}
        </div>
        <h1 className="hx-title-main" key={current.id}>
          {current.title}
        </h1>
        <div className="hx-meta">
          <span className="hx-meta-rec">REC</span>
          <span>{current.year}</span>
          <span>{current.runtime}</span>
          <span className="hx-meta-num">
            {String(activeIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </span>
          {current.client && <span>★ {current.client.toUpperCase()}</span>}
        </div>
      </div>

      {/* Bottom-right next-up + nav arrows. */}
      <div
        className="hx-next"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        <div className="hx-next-info">
          <div className="hx-next-label">NEXT</div>
          <div className="hx-next-title" key={next.id}>{next.title}</div>
        </div>
        <div className="hx-nav">
          <button type="button" onClick={back} aria-label="Previous film">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button type="button" onClick={advance} aria-label="Next film">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
