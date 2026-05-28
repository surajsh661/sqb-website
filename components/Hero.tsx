'use client';
import { useEffect, useRef, useState } from 'react';
import HeroThumb from './HeroThumb';
import type { Film } from '@/lib/types';

// Map a videoId to a deterministic-but-arbitrary start offset (5–30 seconds).
// We hash the id rather than calling Math.random() so the URL stays stable
// across re-renders — otherwise React would tear down and reload the iframe
// every time, which would yank the video back to t=0.
function startOffsetSeconds(videoId: string): number {
  let h = 0;
  for (let i = 0; i < videoId.length; i++) h = (h << 5) - h + videoId.charCodeAt(i);
  return 5 + (Math.abs(h) % 26); // 5..30 inclusive
}

function videoSrc(film: Film) {
  const t = startOffsetSeconds(film.videoId);
  if (film.type === 'vm') {
    // Vimeo respects #t=Ns even in background mode and seeks immediately on load.
    return `https://player.vimeo.com/video/${film.videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&dnt=1&autopause=0&playsinline=1&transparent=0#t=${t}s`;
  }
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  return `https://www.youtube-nocookie.com/embed/${film.videoId}?autoplay=1&mute=1&loop=1&playlist=${film.videoId}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&enablejsapi=1&origin=${origin}&start=${t}`;
}

const wrapDelta = (raw: number, N: number) => ((raw % N) + N + N / 2) % N - N / 2;

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

  // On narrow screens (phones) we want the centered video to fill more of the
  // viewport width; on desktop it's 60% so the side cells peek through.
  const widthFraction = containerW < 700 ? 0.86 : 0.6;
  const cellW = Math.min(containerW * widthFraction, (containerH * 0.68 * 16) / 9);
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

  // Center-only playback. With 6 muted iframes mounted, browsers will quietly
  // stop autoplaying some of them and the video-decode load makes sliding
  // choppy. So we drive playback ourselves: command the center iframe to
  // play, command everything else to pause. Iframes stay mounted (no reload,
  // no jump-to-zero on next visit) but only one is actively decoding video.
  useEffect(() => {
    const apply = () => {
      const slots = cellSlotsRef.current;
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (!slot) continue;
        const iframe = slot.querySelector<HTMLIFrameElement>('iframe.frame-video');
        if (!iframe || !iframe.contentWindow) continue;
        const isCenter = i === activeIdxRef.current;
        const src = iframe.src || '';
        try {
          if (src.includes('youtube')) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: isCenter ? 'playVideo' : 'pauseVideo', args: [] }),
              '*',
            );
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'mute', args: [] }),
              '*',
            );
          } else if (src.includes('vimeo')) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ method: isCenter ? 'play' : 'pause' }),
              '*',
            );
            iframe.contentWindow.postMessage(
              JSON.stringify({ method: 'setMuted', value: true }),
              '*',
            );
          }
        } catch {}
      }
    };

    // Run on activeIdx change, on first mount, and periodically as a safety
    // net (browsers sometimes pause iframes after long idle).
    apply();
    const iv = setInterval(apply, 4000);
    const onVis = () => { if (!document.hidden) apply(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [activeIdx]);

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
          {films.map((film, i) => (
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
                  {/* All hero iframes stay mounted for the lifetime of the
                      page — unmounting/remounting on slider step would
                      restart playback from t=0. */}
                  <iframe
                    key={film.videoId}
                    className="frame-video"
                    src={videoSrc(film)}
                    title={film.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    loading="eager"
                    frameBorder={0}
                  />
                  <div className="frame-tint" />
                </div>
              </div>
            </div>
          ))}
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
