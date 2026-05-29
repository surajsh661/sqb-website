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

// Shortest signed distance from `raw` to 0 on a ring of N slots (so the loop
// wraps seamlessly — slot 0 and slot N-1 are neighbours, not opposite ends).
const wrapDelta = (raw: number, N: number) => ((raw % N) + N + N / 2) % N - N / 2;

// --- BARREL-ROLL geometry ----------------------------------------------------
// The films are equal-size staves on a horizontal drum we are looking INTO. The
// front film is flat and sharp; its neighbours are the SAME SIZE but tilt on the
// drum wall (their outer edge rakes back into the tube) and only the far ones
// recede appreciably. The key fix vs a naive 3D ring: we do NOT push the side
// films far back in depth — perspective would then shrink them into small,
// detached thumbnails. Instead each film keeps its full size and the curve comes
// from rotation, so the whole thing reads as one continuous rolling barrel.
//
// For a film `d` slots from centre:
//   x   =  d · cellW · STEP            → laid out side-by-side, just touching
//   rot = -d · ROT                     → tilts toward the viewer (concave wall)
//   z   = -(0.07·|d| + 0.05·d²)·cellW  → near films barely recede (stay full
//                                         size); far films curve back into the tube
const ROT = 34; // degrees of tilt per film across the drum wall
const STEP = 0.84; // horizontal spacing as a fraction of cell width (staves touch)

// Easing time-constant (seconds). snapFloat closes ~63% of the gap to the
// target every TAU; frame-rate independent via 1 - exp(-dt/TAU).
const TAU = 0.10;
// Continuous roll: holding the cursor to a side advances the reel at up to
// MAX_SPEED films/second (ramped in from the centre dead-zone so it starts
// gently). This is what makes it a smooth ROLL rather than discrete steps.
const DEADZONE = 0.09;
const MAX_SPEED = 3.2;

interface Props {
  films: Film[];
  onPick: (film: Film) => void;
  showCursorHint: boolean;
}

export default function Hero({ films, onPick, showCursorHint }: Props) {
  const N = films.length;
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cellSlotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const videoCellsRef = useRef<(HTMLDivElement | null)[]>([]);

  // --- Animation state lives ENTIRELY in refs. The RAF loop writes transforms
  // straight to the DOM; React is never re-rendered on an animation frame. ---
  const snapFloat = useRef(0); // eased fractional position actually shown
  const target = useRef(0); // where snapFloat is gliding to (continuous)
  const cursorX = useRef(0.5); // smoothed cursor x within the zone (0..1)
  const cursorRaw = useRef(0.5); // raw cursor x (low-pass filtered into cursorX)
  const insideZone = useRef(false);
  const manualTarget = useRef<number | null>(null);
  const manualUntil = useRef(0);
  const cellWRef = useRef(0);
  const lastTime = useRef(0);
  const reducedMotion = useRef(false);

  // React state — set ONLY when the integer index changes, never per frame.
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);

  // The film actually settled in the centre — playback is gated on this so the
  // film on screen mid-glide is the one that plays.
  const [playCenter, setPlayCenter] = useState(0);
  const playCenterRef = useRef(0);

  // Container size drives cell width. Seed identical fixed defaults on server
  // and first client render (React does not patch inline-style mismatches on
  // hydration), then sync to the real viewport in the mount effect.
  const [containerW, setContainerW] = useState(1280);
  const [containerH, setContainerH] = useState(720);

  useEffect(() => {
    const onResize = () => {
      setContainerW(window.innerWidth);
      setContainerH(window.innerHeight);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // prefers-reduced-motion: drop the 3D roll/blur and hard-cut between films.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const set = () => { reducedMotion.current = mq.matches; };
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  const ASPECT_W = 21;
  const ASPECT_H = 9;
  // Centre film ~62% of width on desktop so the neighbours stay visible
  // wrapping away on the curved wall. Mobile: near full width (no room for the
  // sides on a phone).
  const widthFraction = containerW < 700 ? 0.94 : 0.62;
  const cellW = Math.min(
    containerW * widthFraction,
    (containerH * 0.82 * ASPECT_W) / ASPECT_H,
  );
  const cellH = (cellW * ASPECT_H) / ASPECT_W;
  cellWRef.current = cellW;

  useEffect(() => {
    document.documentElement.style.setProperty('--sqb-cellW', cellW + 'px');
    document.documentElement.style.setProperty('--sqb-cellH', cellH + 'px');
  }, [cellW, cellH]);

  // Mouse tracking — refs only.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = zoneRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside =
        e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right;
      insideZone.current = inside;
      if (inside) cursorRaw.current = (e.clientX - r.left) / r.width;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Main per-frame loop. All work is direct DOM mutation via refs.
  useEffect(() => {
    let raf = 0;

    const applyTransforms = () => {
      const float = snapFloat.current;
      const w = cellWRef.current;
      const reduce = reducedMotion.current;

      for (let i = 0; i < N; i++) {
        const slot = cellSlotsRef.current[i];
        const cell = videoCellsRef.current[i];
        if (!slot || !cell) continue;

        const wd = wrapDelta(i - float, N);
        const dist = Math.abs(wd);

        if (reduce) {
          // Reduced motion: only the centre film is shown, flat; others hidden.
          slot.style.transform = 'translate3d(0,0,0)';
          cell.style.filter = 'none';
          cell.style.opacity = dist < 0.5 ? '1' : '0';
          if (dist < 0.5) cell.classList.add('center');
          else cell.classList.remove('center');
          continue;
        }

        // Barrel placement: equal-size staves, side films tilt (not shrink).
        const x = wd * w * STEP;
        const z = -(Math.abs(wd) * 0.07 + wd * wd * 0.05) * w;
        const rot = -wd * ROT;
        // Round to 2dp so micro-moves don't trigger sub-pixel repaints.
        slot.style.transform =
          `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px) rotateY(${rot.toFixed(2)}deg)`;

        // Centre is sharpest. Neighbours defocus/dim gently as they roll away.
        // Blur is the most expensive painted property — apply it ONLY to
        // non-centre cells and clamp it hard.
        if (dist < 0.06) {
          cell.style.filter = 'none';
          cell.style.opacity = '1';
        } else {
          const blur = Math.min(dist * 2.6, 7);
          const bright = Math.max(0.42, 1 - dist * 0.26);
          const sat = (1 + Math.min(dist, 1) * 0.06);
          cell.style.filter =
            `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(2)}) saturate(${sat.toFixed(2)})`;
          cell.style.opacity = Math.max(0, 1 - Math.max(0, dist - 2) * 0.7).toFixed(2);
        }

        if (dist < 0.5) cell.classList.add('center');
        else cell.classList.remove('center');
      }
    };

    const tick = (now: number) => {
      // Frame-rate-independent dt (seconds), clamped so a tab-switch stall
      // doesn't fling the reel.
      const dt = lastTime.current ? Math.min((now - lastTime.current) / 1000, 0.05) : 0.016;
      lastTime.current = now;

      // Low-pass the raw cursor so input itself is smooth (no stair-stepping).
      const cursorK = 1 - Math.exp(-dt / 0.06);
      cursorX.current += (cursorRaw.current - cursorX.current) * cursorK;

      if (manualTarget.current !== null && now < manualUntil.current) {
        target.current = manualTarget.current;
      } else {
        if (manualTarget.current !== null) {
          target.current = manualTarget.current;
          manualTarget.current = null;
        }
        const offset = cursorX.current - 0.5;
        const absOffset = Math.abs(offset);
        if (insideZone.current && absOffset > DEADZONE && !reducedMotion.current) {
          // Continuous roll: speed ramps in from the dead-zone (eased) so the
          // reel glides rather than steps.
          const tNorm = Math.min(1, (absOffset - DEADZONE) / (0.5 - DEADZONE));
          const speed = MAX_SPEED * tNorm * tNorm;
          target.current += Math.sign(offset) * speed * dt;
        } else {
          // Settle onto the nearest film currently in view.
          target.current = Math.round(snapFloat.current);
        }
      }

      // Time-based exponential smoothing along the shortest modular path.
      const k = 1 - Math.exp(-dt / TAU);
      snapFloat.current += wrapDelta(target.current - snapFloat.current, N) * k;

      applyTransforms();

      const newActiveIdx = ((Math.round(target.current) % N) + N) % N;
      if (newActiveIdx !== activeIdxRef.current) {
        activeIdxRef.current = newActiveIdx;
        setActiveIdx(newActiveIdx);
      }

      const settledCenter = ((Math.round(snapFloat.current) % N) + N) % N;
      if (
        settledCenter !== playCenterRef.current &&
        Math.abs(wrapDelta(snapFloat.current - settledCenter, N)) < 0.06
      ) {
        playCenterRef.current = settledCenter;
        setPlayCenter(settledCenter);
      }

      raf = requestAnimationFrame(tick);
    };

    applyTransforms(); // lay out before first paint to avoid a flash
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [N]);

  // Center-only playback. Many muted iframes mounted at once make browsers
  // throttle autoplay and the video-decode load makes sliding choppy. We drive
  // playback ourselves: play the centre iframe, pause the rest. Iframes stay
  // mounted (no reload, no jump-to-zero) — only one decodes at a time.
  useEffect(() => {
    const apply = () => {
      const slots = cellSlotsRef.current;
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (!slot) continue;
        const iframe = slot.querySelector<HTMLIFrameElement>('iframe.frame-video');
        if (!iframe || !iframe.contentWindow) continue;
        const isCenter = i === playCenterRef.current;
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
            iframe.contentWindow.postMessage(JSON.stringify({ method: isCenter ? 'play' : 'pause' }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'setMuted', value: true }), '*');
          }
        } catch {}
      }
    };

    apply();
    const iv = setInterval(apply, 4000);
    const onVis = () => { if (!document.hidden) apply(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [playCenter]);

  const onCellClick = (i: number) => {
    const wrapped = wrapDelta(i - snapFloat.current, N);
    if (Math.abs(wrapped) < 0.5) {
      onPick(films[i]);
    } else {
      // Navigate to the clicked side film: aim the target at the shortest path
      // to it and hold for ~900ms so the continuous roll doesn't fight it.
      manualTarget.current = snapFloat.current + wrapped;
      manualUntil.current = performance.now() + 900;
    }
  };

  const centerFilm = films[activeIdx];

  // Dynamic hero-title sizing so long titles never overflow the viewport.
  const titleLen = Math.max(1, centerFilm.title.length);
  const available = Math.max(320, containerW - 64);
  const charSizeCap = available / (titleLen * 0.55);
  const baseClampMax = Math.min(160, containerW * 0.1);
  const heroTitleSize = Math.min(baseClampMax, charSizeCap);

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
          {films.map((film, i) => (
            <div
              key={film.id}
              ref={(el) => { cellSlotsRef.current[i] = el; }}
              className="cell-slot"
              style={{
                width: cellW,
                height: cellH,
                marginLeft: -cellW / 2,
                marginTop: -cellH / 2,
              }}
            >
              <div
                ref={(el) => { videoCellsRef.current[i] = el; }}
                className="video-cell"
                onClick={() => onCellClick(i)}
              >
                <div className="frame">
                  <HeroThumb film={film} className="frame-poster" />
                  {/* Iframes stay mounted for the lifetime of the page — a
                      stable key means position changes (pure DOM transforms)
                      never remount or reload them. */}
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

      {/* Curved "tube mouth" vignette — the signature inside-the-cylinder cue.
          The arched top/bottom darkening + heavy corners read as looking down a
          horizontal drum. Sits above the films, below the title. */}
      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-title-wrap">
        <div className="hero-cat">
          <span className="dot" /> {centerFilm.category}
        </div>
        <h1
          className="hero-title"
          key={centerFilm.id}
          style={{ fontSize: `${Math.round(heroTitleSize)}px` }}
        >
          {centerFilm.title}
        </h1>
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
