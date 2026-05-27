'use client';
import { useEffect, useRef, useState } from 'react';
import HeroThumb from './HeroThumb';
import type { Film } from '@/lib/types';

function videoSrc(film: Film) {
  if (film.type === 'vm') {
    return `https://player.vimeo.com/video/${film.videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&dnt=1&autopause=0&playsinline=1&transparent=0`;
  }
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  return `https://www.youtube-nocookie.com/embed/${film.videoId}?autoplay=1&mute=1&loop=1&playlist=${film.videoId}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&enablejsapi=1&origin=${origin}`;
}

const wrapDelta = (raw: number, N: number) => ((raw % N) + N + N / 2) % N - N / 2;

// How far from the centered cell to keep iframes mounted. Cells outside this
// window show only the still thumbnail — keeps the GPU/CPU work bounded.
const IFRAME_NEIGHBOR_RADIUS = 1;

interface Props {
  films: Film[];
  onPick: (film: Film) => void;
  tagline: string;
  showCursorHint: boolean;
}

export default function Hero({ films, onPick, tagline, showCursorHint }: Props) {
  const N = films.length;
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const cellSlotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const videoCellsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Animation state lives in refs — no React re-render per frame.
  const snapFloat = useRef(0);
  const target = useRef(0);
  const cursorX = useRef(0.5);
  const insideZone = useRef(false);
  const manualTarget = useRef<number | null>(null);
  const manualUntil = useRef(0);
  const cellWRef = useRef(0);

  // Only re-render on integer index changes (title/meta + iframe gating).
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);

  // Container size — drives cell width. Re-renders only on resize.
  const [containerW, setContainerW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1600,
  );
  const [containerH, setContainerH] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 900,
  );

  useEffect(() => {
    const onResize = () => {
      setContainerW(window.innerWidth);
      setContainerH(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const cellW = Math.min(containerW * 0.6, (containerH * 0.68 * 16) / 9);
  const cellH = (cellW * 9) / 16;
  cellWRef.current = cellW;

  useEffect(() => {
    document.documentElement.style.setProperty('--sqb-cellW', cellW + 'px');
    document.documentElement.style.setProperty('--sqb-cellH', cellH + 'px');
  }, [cellW, cellH]);

  // Mouse tracking — refs only, no React state.
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

  // Main per-frame loop. All work is direct DOM mutation via refs — React is
  // never told anything changed unless the centered film actually flips.
  useEffect(() => {
    let raf = 0;
    let lastStep = 0;
    const DEADZONE = 0.4;
    const STEP_SLOW = 900;
    const STEP_FAST = 280;

    const applyTransforms = () => {
      const float = snapFloat.current;
      const w = cellWRef.current;
      for (let i = 0; i < N; i++) {
        const slot = cellSlotsRef.current[i];
        const cell = videoCellsRef.current[i];
        if (!slot || !cell) continue;

        const wrapped = wrapDelta(i - float, N);
        const dist = Math.abs(wrapped);
        const dir = Math.sign(wrapped) || 0;
        const rot = Math.max(-46, Math.min(46, -dir * Math.min(dist, 1.6) * 32));
        const scale = 1 - Math.min(dist, 1.8) * 0.04;
        const blur = Math.min(dist * 7, 11);
        const sat = 1 + Math.min(dist, 1) * 0.2;
        const bright = 1 - Math.min(dist, 1.5) * 0.28;
        const opacity = dist < 0.05 ? 1 : Math.max(0.42, 1 - dist * 0.3);
        const isCenter = dist < 0.5;
        const transformOrigin = dir < 0 ? 'right center' : dir > 0 ? 'left center' : 'center';

        slot.style.transform = `translate3d(${wrapped * w - w / 2}px, -50%, 0)`;
        cell.style.transform = `perspective(900px) rotateY(${rot}deg) scale(${scale}) translateZ(0)`;
        cell.style.transformOrigin = transformOrigin;
        cell.style.filter = dist < 0.12 ? 'none' : `blur(${blur}px) saturate(${sat}) brightness(${bright})`;
        cell.style.opacity = String(opacity);
        cell.style.zIndex = String(isCenter ? 3 : dist < 1 ? 2 : 1);
      }
    };

    const tick = () => {
      const now = performance.now();

      // Stepping policy.
      if (manualTarget.current !== null && now < manualUntil.current) {
        target.current = manualTarget.current;
      } else {
        if (manualTarget.current !== null) {
          target.current = manualTarget.current;
          manualTarget.current = null;
        }
        if (insideZone.current) {
          const offset = cursorX.current - 0.5;
          const absOffset = Math.abs(offset);
          if (absOffset > DEADZONE) {
            const tNorm = Math.min(1, (absOffset - DEADZONE) / (0.5 - DEADZONE));
            const stepInterval = STEP_SLOW - (STEP_SLOW - STEP_FAST) * tNorm;
            if (now - lastStep > stepInterval) {
              lastStep = now;
              target.current = ((target.current + Math.sign(offset)) % N + N) % N;
            }
          }
        }
      }

      // Lerp snapFloat toward target on the shortest modular path.
      const raw = target.current - snapFloat.current;
      const wrapped = wrapDelta(raw, N);
      snapFloat.current = snapFloat.current + wrapped * 0.09;

      applyTransforms();

      const newActiveIdx = ((Math.round(target.current) % N) + N) % N;
      if (newActiveIdx !== activeIdxRef.current) {
        activeIdxRef.current = newActiveIdx;
        setActiveIdx(newActiveIdx);
      }

      raf = requestAnimationFrame(tick);
    };

    // Lay out cells at their initial positions before paint to avoid a flash.
    applyTransforms();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [N]);

  // Vimeo/YouTube keepalive — light, infrequent. Touches all currently-mounted iframes.
  useEffect(() => {
    const ping = () => {
      document.querySelectorAll<HTMLIFrameElement>('iframe.frame-video').forEach((iframe) => {
        try {
          const src = iframe.src || '';
          if (src.includes('youtube')) {
            iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
            iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
          } else if (src.includes('vimeo')) {
            iframe.contentWindow?.postMessage(JSON.stringify({ method: 'play' }), '*');
            iframe.contentWindow?.postMessage(JSON.stringify({ method: 'setMuted', value: true }), '*');
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

  const onCellClick = (i: number) => {
    const wrapped = wrapDelta(i - snapFloat.current, N);
    if (Math.abs(wrapped) < 0.5) {
      onPick(films[i]);
    } else {
      manualTarget.current = i;
      manualUntil.current = performance.now() + 900;
    }
  };

  const centerFilm = films[activeIdx];

  // Decide which cells render iframes. Recomputed only when activeIdx changes.
  const shouldHaveIframe = (i: number) => {
    const delta = wrapDelta(i - activeIdx, N);
    return Math.abs(delta) <= IFRAME_NEIGHBOR_RADIUS;
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
        <div className="video-track">
          {films.map((film, i) => {
            const hasIframe = shouldHaveIframe(i);
            return (
              <div
                key={film.id}
                ref={(el) => { cellSlotsRef.current[i] = el; }}
                className="cell-slot"
                style={{ width: cellW }}
              >
                <div
                  ref={(el) => { videoCellsRef.current[i] = el; }}
                  className="video-cell"
                  onClick={() => onCellClick(i)}
                >
                  <div className="frame">
                    <HeroThumb film={film} className="frame-poster" />
                    {hasIframe && (
                      <iframe
                        key={film.videoId}
                        className="frame-video"
                        src={videoSrc(film)}
                        title={film.title}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        loading="eager"
                        frameBorder={0}
                      />
                    )}
                    <div className="frame-tint" />
                  </div>
                </div>
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
