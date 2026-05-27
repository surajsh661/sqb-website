'use client';
import { useEffect, useRef, useState } from 'react';
import HeroThumb from './HeroThumb';
import type { Film } from '@/lib/types';

function videoSrc(film: Film, muted: boolean) {
  if (film.type === 'vm') {
    return `https://player.vimeo.com/video/${film.videoId}?background=1&autoplay=1&loop=1&muted=${muted ? 1 : 0}&controls=0&dnt=1&autopause=0&playsinline=1&transparent=0`;
  }
  if (film.type === 'gd') return `https://drive.google.com/file/d/${film.videoId}/preview`;
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  return `https://www.youtube-nocookie.com/embed/${film.videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${film.videoId}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&enablejsapi=1&origin=${origin}`;
}

function VideoCell({
  film, delta, isCenterAudio, onClick,
}: { film: Film; delta: number; isCenterAudio: boolean; onClick: () => void }) {
  const dist = Math.abs(delta);
  const dir = Math.sign(delta) || 0;
  const rot = Math.max(-46, Math.min(46, -dir * Math.min(dist, 1.6) * 32));
  const scale = 1 - Math.min(dist, 1.8) * 0.04;
  const blur = Math.min(dist * 7, 11);
  const sat = 1 + Math.min(dist, 1) * 0.2;
  const bright = 1 - Math.min(dist, 1.5) * 0.28;
  const opacity = dist < 0.05 ? 1 : Math.max(0.42, 1 - dist * 0.3);
  const isCenter = dist < 0.5;
  const transformOrigin = dir < 0 ? 'right center' : dir > 0 ? 'left center' : 'center';
  const cellTransform = `perspective(900px) rotateY(${rot}deg) scale(${scale})`;
  const filt = dist < 0.12 ? 'none' : `blur(${blur}px) saturate(${sat}) brightness(${bright})`;
  const isDrive = film.type === 'gd';
  const muted = !(isCenter && isCenterAudio);

  return (
    <div
      className={'video-cell' + (isCenter ? ' center' : '')}
      style={{
        transform: cellTransform,
        transformOrigin,
        filter: filt,
        opacity,
        zIndex: isCenter ? 3 : dist < 1 ? 2 : 1,
      }}
      onClick={onClick}
    >
      <div className="frame">
        <HeroThumb film={film} className="frame-poster" />
        {!isDrive && (
          <iframe
            key={film.videoId + '-' + (isCenter ? (isCenterAudio ? 'on' : 'off') : 'm')}
            className="frame-video"
            src={videoSrc(film, muted)}
            title={film.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            loading="eager"
            frameBorder={0}
          />
        )}
        {isDrive && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            className="frame-video"
            src={`https://drive.google.com/uc?export=download&id=${film.videoId}`}
            autoPlay
            muted={muted}
            loop
            playsInline
            preload="auto"
          />
        )}
        <div className="frame-tint" />
      </div>
    </div>
  );
}

interface Props {
  films: Film[];
  onPick: (film: Film) => void;
  tagline: string;
  showCursorHint: boolean;
}

export default function Hero({ films, onPick, tagline, showCursorHint }: Props) {
  const N = films.length;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const [containerW, setContainerW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1600,
  );

  const cursorX = useRef(0.5);
  const insideZone = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = zoneRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside =
        e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right;
      insideZone.current = inside;
      if (inside) cursorX.current = (e.clientX - r.left) / r.width;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const manualTarget = useRef<number | null>(null);
  const manualUntil = useRef(0);

  const [snapFloat, setSnapFloat] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      let targetIdx: number;
      if (manualTarget.current !== null && performance.now() < manualUntil.current) {
        targetIdx = manualTarget.current;
      } else {
        manualTarget.current = null;
        targetIdx = Math.floor(cursorX.current * N);
        if (targetIdx < 0) targetIdx = 0;
        if (targetIdx >= N) targetIdx = N - 1;
      }
      setSnapFloat((prev) => {
        const raw = targetIdx - prev;
        const wrapped = ((raw % N) + N + N / 2) % N - N / 2;
        return prev + wrapped * 0.18;
      });
      const wrappedIdx = ((Math.round(targetIdx) % N) + N) % N;
      setActiveIdx(wrappedIdx);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [N]);

  useEffect(() => {
    const onResize = () => setContainerW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const vw = containerW;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const cellW = Math.min(vw * 0.6, (vh * 0.68 * 16) / 9);
  const cellH = (cellW * 9) / 16;

  useEffect(() => {
    document.documentElement.style.setProperty('--sqb-cellW', cellW + 'px');
    document.documentElement.style.setProperty('--sqb-cellH', cellH + 'px');
  }, [cellW, cellH]);

  // Keepalive ping for muted iframes
  useEffect(() => {
    const ping = () => {
      document.querySelectorAll('iframe.frame-video').forEach((f) => {
        const iframe = f as HTMLIFrameElement;
        try {
          const src = iframe.src || '';
          if (src.includes('youtube')) {
            iframe.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
              '*',
            );
            iframe.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'mute', args: [] }),
              '*',
            );
          } else if (src.includes('vimeo')) {
            iframe.contentWindow?.postMessage(JSON.stringify({ method: 'play' }), '*');
            iframe.contentWindow?.postMessage(
              JSON.stringify({ method: 'setMuted', value: true }),
              '*',
            );
          }
        } catch {}
      });
    };
    const iv = setInterval(ping, 4000);
    ping();
    const onVis = () => { if (!document.hidden) ping(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const float = snapFloat;
  const centerFilm = films[activeIdx];

  const wrapDelta = (raw: number) => ((raw % N) + N + N / 2) % N - N / 2;

  const onCellClick = (i: number, wrappedDelta: number) => {
    if (Math.abs(wrappedDelta) < 0.5) {
      onPick(films[i]);
    } else {
      manualTarget.current = i;
      manualUntil.current = performance.now() + 900;
    }
  };

  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="ambient-stage" aria-hidden="true">
        <div className="ambient-glow" key={centerFilm.id}>
          <HeroThumb film={centerFilm} className="ambient-img" />
        </div>
        <div className="ambient-grain" />
      </div>

      <div className="hero-glass-l" />
      <div className="hero-glass-r" />

      <div className="hero-zone" ref={zoneRef}>
        <div className="video-track" ref={trackRef}>
          {films.map((film, i) => {
            const wrapped = wrapDelta(i - float);
            return (
              <div
                key={film.id}
                className="cell-slot"
                style={{
                  width: cellW,
                  transform: `translate(${wrapped * cellW - cellW / 2}px, -50%)`,
                }}
              >
                <VideoCell
                  film={film}
                  delta={wrapped}
                  isCenterAudio={false}
                  onClick={() => onCellClick(i, wrapped)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="hero-title-wrap">
        <div className="hero-cat">
          <span className="dot" /> {centerFilm.category}
        </div>
        <h1 className="hero-title" key={centerFilm.id}>{centerFilm.title}</h1>
        <div className="hero-meta">
          <div className="left">
            <span className="rec">REC</span>
            <span>{centerFilm.year}</span>
            <span>{centerFilm.runtime}</span>
          </div>
          <div className="right">
            <span>{String(activeIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
            <span>★ {centerFilm.client?.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="hero-tagline">{tagline || 'TELL YOUR STORY TODAY.'}</div>

      {showCursorHint && (
        <div className="cursor-hint">
          <span className="arrow flip" />
          MOVE CURSOR · CLICK TO OPEN
          <span className="arrow" />
        </div>
      )}
    </section>
  );
}
