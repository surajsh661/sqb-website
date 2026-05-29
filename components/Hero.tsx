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

// --- 3D ring (cylinder) geometry -------------------------------------------
// The carousel is a genuine ring of videos. The viewer sits at the centre of
// the ring and looks out at the front-facing film. Each cell is placed on the
// ring surface with `rotateY(theta) translateZ(R)`, and the whole track is
// pulled back by `translateZ(-R)` so the front cell lands flat on the screen
// plane. Neighbours curve away to the left/right — they pick up a real slant,
// perspective foreshortening (the "lens distortion" look) and a progressive
// blur as they recede around the drum. Because we rebuild each cell's angle
// from wrapDelta() every frame on the shortest modular path, stepping wraps
// around the ring seamlessly with no flat seam.
// We are sitting INSIDE the cylinder looking out at its inner wall, watching
// the films roll past left↔right. For that to read as a smooth curved surface
// (not a faceted cube) we want a GENTLE angle between films — several films
// stay visible across the front arc and curve away to the sides, so the eye
// joins them into one continuous rolling band.
//
// For adjacent cells to sit edge-to-edge on the cylinder (no gap, no forward
// overlap) the chord between their centres must equal the cell width:
//   chord = 2·R·sin(ANGLE/2) = cellW  →  R = cellW / (2·sin(ANGLE/2)).
// At ANGLE = 32° that gives RADIUS_FACTOR ≈ 1.80. A small angle + large radius
// is a wide, shallow drum: the centre film faces us, its neighbours lean away
// gradually rather than snapping edge-on like a box face.
const ANGLE = 32; // degrees between adjacent films around the cylinder
const RADIUS_FACTOR = 1.8; // cylinder radius as a fraction of the cell width

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

  // The film that is *actually settled in the centre* of the screen. This is
  // distinct from activeIdx, which tracks the glide's destination. Playback is
  // gated on this so the video on screen mid-glide is never the one paused.
  const [playCenter, setPlayCenter] = useState(0);
  const playCenterRef = useRef(0);

  // Container size — drives cell width. Re-renders only on resize.
  //
  // We MUST seed identical values on the server and on the client's first
  // render, otherwise React hydration leaves a stale value behind. The cell
  // box width is written as an inline style during SSR; React does not patch
  // inline-style mismatches on hydration, so if the server picked a different
  // width than the client the cell box would stay frozen at the server size
  // while the ring radius (recomputed every frame from the real width)
  // disagrees — the cell renders far too wide and overflows. Seeding a fixed
  // default and syncing to the real viewport in the mount effect guarantees a
  // post-hydration state change that patches the box to match the geometry.
  const [containerW, setContainerW] = useState(1280);
  const [containerH, setContainerH] = useState(720);

  useEffect(() => {
    const onResize = () => {
      setContainerW(window.innerWidth);
      setContainerH(window.innerHeight);
    };
    onResize(); // sync to the real viewport once mounted (fixes hydration size)
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Centre cell ~85% of viewport at 21:9 cinemascope ratio. Side cells curve
  // away around the ring so the centre video fills the eye.
  const ASPECT_W = 21;
  const ASPECT_H = 9;
  // Desktop: centre film is ~64% of the width so its neighbours stay visible
  // rolling away on both sides (the cylinder surface). Mobile: nearly full
  // width since there isn't room to show the sides on a phone.
  const widthFraction = containerW < 700 ? 0.92 : 0.64;
  const cellW = Math.min(
    containerW * widthFraction,
    (containerH * 0.86 * ASPECT_W) / ASPECT_H,
  );
  const cellH = (cellW * ASPECT_H) / ASPECT_W;
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
    const DEADZONE = 0.4; // outside ±40% from screen-centre triggers a single step

    const applyTransforms = () => {
      const float = snapFloat.current;
      const w = cellWRef.current;
      const R = w * RADIUS_FACTOR;
      const track = trackRef.current;
      // Pull the whole drum back by the ring radius so the front cell lands
      // flat on the screen plane (z = 0) at neutral size.
      if (track) track.style.transform = `translateZ(${-R}px)`;

      for (let i = 0; i < N; i++) {
        const slot = cellSlotsRef.current[i];
        const cell = videoCellsRef.current[i];
        if (!slot || !cell) continue;

        const wd = wrapDelta(i - float, N);
        const dist = Math.abs(wd);

        // Place the cell on the ring: translateZ(R) pushes it out to the ring
        // surface, rotateY swings it to its angular slot. Combined with the
        // track's translateZ(-R) the front film sits flat and sharp while the
        // neighbours curve backward — real slant + perspective distortion.
        const theta = wd * ANGLE;
        slot.style.transform = `rotateY(${theta}deg) translateZ(${R}px)`;

        // The front film is sharpest; neighbours stay clearly VISIBLE as they
        // roll away (that visible roll is what makes it read as a cylinder
        // rather than a single flipping panel). They only defocus and dim
        // gently with distance, fading out once they have curved well past the
        // edges of the drum.
        const blur = Math.min(dist * 2.3, 7);
        const bright = Math.max(0.5, 1 - dist * 0.24);
        const sat = 1 + Math.min(dist, 1) * 0.05;
        cell.style.filter =
          dist < 0.06
            ? 'none'
            : `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(3)}) saturate(${sat.toFixed(3)})`;
        cell.style.opacity = (
          dist < 0.06 ? 1 : Math.max(0, 1 - Math.max(0, dist - 2) * 0.7)
        ).toFixed(3);

        if (dist < 0.5) cell.classList.add('center');
        else cell.classList.remove('center');
      }
    };

    // Paced continuous-step model: while the cursor sits in a side zone, the
    // slider auto-advances at a sane cadence (slower near the deadzone edge,
    // faster near the screen edge). When the cursor leaves the side zone the
    // stepping stops.
    const STEP_NEAR = 1300; // ms cadence just past the deadzone
    const STEP_FAR = 650; // ms cadence at the screen edge

    const tick = () => {
      const now = performance.now();

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
            const lookahead = Math.abs(
              ((target.current - snapFloat.current) % N + N + N / 2) % N - N / 2,
            );
            if (lookahead < 0.4) {
              const tNorm = Math.min(1, (absOffset - DEADZONE) / (0.5 - DEADZONE));
              const stepInterval = STEP_NEAR - (STEP_NEAR - STEP_FAR) * tNorm;
              if (now - lastStep > stepInterval) {
                lastStep = now;
                target.current = ((target.current + Math.sign(offset)) % N + N) % N;
              }
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

      // Once the slide has essentially settled on a new cell, hand playback
      // over to it. Gating on the settled position (not the target) means the
      // film visually centred during a long glide is the one that plays.
      const settledCenter = ((Math.round(snapFloat.current) % N) + N) % N;
      if (
        settledCenter !== playCenterRef.current &&
        Math.abs(wrapDelta(snapFloat.current - settledCenter, N)) < 0.05
      ) {
        playCenterRef.current = settledCenter;
        setPlayCenter(settledCenter);
      }

      raf = requestAnimationFrame(tick);
    };

    // Lay out cells at their initial positions before paint to avoid a flash.
    applyTransforms();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [N]);

  // Center-only playback. With many muted iframes mounted, browsers will
  // quietly stop autoplaying some of them and the video-decode load makes
  // sliding choppy. So we drive playback ourselves: command the center iframe
  // to play, command everything else to pause. Iframes stay mounted (no
  // reload, no jump-to-zero) but only one is actively decoding video.
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
      manualTarget.current = i;
      manualUntil.current = performance.now() + 900;
    }
  };

  const centerFilm = films[activeIdx];

  // Dynamic hero-title sizing: long titles were overflowing the viewport
  // because the title is white-space: nowrap. We compute a font-size that fits
  // the title within (containerW - 64px gutter) — picking the lesser of the
  // CSS clamp ceiling (160px) and a width-based shrink-to-fit. Anton's average
  // glyph width at uppercase ≈ 0.50 × font-size; we use 0.55 to leave margin.
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

      {/* Cylindrical "tube mouth" vignette — curved darkening top & bottom plus
          a soft elliptical falloff. Sits above the films but below the title so
          it reads as the inside of a drum we're looking down. */}
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
