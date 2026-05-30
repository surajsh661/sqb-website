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

// Shortest signed distance from `raw` to 0 on a ring of N slots, so slot 0 and
// slot N-1 are neighbours (the loop wraps with no seam).
const wrapDelta = (raw: number, N: number) => ((raw % N) + N + N / 2) % N - N / 2;

// --- Concave inside-the-cylinder geometry -----------------------------------
// The films are connected edge-to-edge on the inside wall of a cylinder, and
// the viewer sits inside looking out at the wall. The film in front is flat and
// sharp; the previous/next films CURVE TOWARD THE VIEWER at the sides (their
// faces wrap around you), receding into a gloomy, blurred, cinematic darkness.
// As the carousel turns, the whole connected wall rotates in unison.
//
// Each film d slots from centre sits on an arc that bows toward the viewer:
//   φ = d · ANGLE
//   x =  R · sin(φ)              → fans out to the side
//   z =  R · (1 - cos(φ))        → curves TOWARD the viewer (the wall wraps you)
//   rotateY(-d · ANGLE)          → its face turns to look back at the viewer
// For the FLAT films to meet edge-to-edge (touch at the shared vertices as one
// rotates to the front and the next rotates away), the radius is the polygon
// apothem: R = (cellW/2) / tan(ANGLE/2). (Circumradius would leave a gap at the
// seam mid-rotation.)
const ANGLE = 40; // degrees between adjacent films around the cylinder
const DEG = Math.PI / 180;
const RADIUS_FACTOR = 0.5 / Math.tan((ANGLE / 2) * DEG); // apothem → films touch

// Easing time-constant (seconds). snapFloat closes ~1-1/e of the gap to the
// target every TAU; using 1 - exp(-dt/TAU) makes the glide frame-rate
// independent (same feel on 60Hz and 120Hz).
const TAU = 0.09;

// How many films around the centre actually play vs. just exist.
//   PLAY_DIST  — play the centre + its two immediate neighbours (the cluster
//                you can actually see curving in). Capping live decode at ~3
//                videos keeps the slide smooth; playing all N at once is what
//                made it choppy and slow to load.
//   MOUNT_DIST — mount (network-load) iframes a touch beyond the play window so
//                a neighbour is buffered just before it needs to play. Cells
//                further out show only their poster until they approach, so the
//                first paint loads ~3 iframes instead of all N.
const PLAY_DIST = 1.05;
const MOUNT_DIST = 1.5;

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
  // straight to the DOM; React is NOT re-rendered on animation frames. ---
  const snapFloat = useRef(0); // eased fractional position actually shown
  const target = useRef(0); // where snapFloat is gliding to
  const cursorX = useRef(0.5); // smoothed cursor x within the zone (0..1)
  const cursorRaw = useRef(0.5); // raw cursor x, low-pass filtered into cursorX
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

  // Which iframe indices have been network-mounted. Grows monotonically (a cell,
  // once mounted, is never torn down — so a video never reloads or jumps to t=0)
  // starting from the initial visible cluster around centre (index 0). Computed
  // purely from N + the constant start position, so it is identical on the
  // server and the client's first render (no hydration mismatch).
  const initialMounted = () => {
    const s = new Set<number>();
    for (let i = 0; i < films.length; i++) {
      if (Math.abs(wrapDelta(i - 0, films.length)) <= MOUNT_DIST) s.add(i);
    }
    return s;
  };
  const [mounted, setMounted] = useState<Set<number>>(initialMounted);
  const mountedRef = useRef<Set<number>>(mounted);

  // Container size drives cell width. Seed identical fixed defaults on the
  // server and the client's first render (React does not patch inline-style
  // mismatches on hydration), then sync to the real viewport in the mount
  // effect — that forces a post-hydration re-render that fixes the size.
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

  // prefers-reduced-motion: drop the 3D rotation/blur and hard-cut between
  // centred films instead.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const set = () => { reducedMotion.current = mq.matches; };
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  // Centre film a touch larger now and in 16:9 (was 21:9). The curved
  // neighbours still have room to wrap in from the sides. Mobile: near full
  // width. The height cap keeps the taller 16:9 cell inside the hero-zone.
  const ASPECT_W = 16;
  const ASPECT_H = 9;
  const widthFraction = containerW < 700 ? 0.92 : 0.64;
  const cellW = Math.min(
    containerW * widthFraction,
    (containerH * 0.6 * ASPECT_W) / ASPECT_H,
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
      if (inside) cursorRaw.current = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
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
      const R = w * RADIUS_FACTOR;
      const track = trackRef.current;
      const reduce = reducedMotion.current;

      // The cylinder geometry lives entirely in the per-cell transforms; the
      // track is just the 3D stage (preserve-3d), no transform of its own.
      if (track) track.style.transform = 'translateZ(0)';

      for (let i = 0; i < N; i++) {
        const slot = cellSlotsRef.current[i];
        const cell = videoCellsRef.current[i];
        if (!slot || !cell) continue;

        const wd = wrapDelta(i - float, N);
        const dist = Math.abs(wd);

        if (reduce) {
          // Reduced motion: only the centre film, flat; others hidden. Hard cut.
          slot.style.transform = 'translate3d(0,0,0)';
          cell.style.filter = 'none';
          cell.style.opacity = dist < 0.5 ? '1' : '0';
          if (dist < 0.5) cell.classList.add('center');
          else cell.classList.remove('center');
          continue;
        }

        // Concave inside-cylinder placement. The arc bows toward the viewer so
        // the side films curve forward, their faces rotated to look back at us.
        const phi = wd * ANGLE * DEG;
        const x = R * Math.sin(phi);
        const z = R * (1 - Math.cos(phi)); // +z = toward viewer (wall wraps us)
        const rot = -wd * ANGLE;
        slot.style.transform =
          `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px) rotateY(${rot.toFixed(2)}deg)`;

        // Cinematic gloom: the front film is sharp and bright; neighbours fall
        // off HARD into blur, darkness and desaturation as they curve away — the
        // "gloomy, blurred" tube wall. Blur only on non-centre cells, clamped,
        // values rounded to 2dp to avoid sub-pixel repaints.
        if (dist < 0.06) {
          cell.style.filter = 'none';
          cell.style.opacity = '1';
        } else {
          const blur = Math.min(dist * 7, 16);
          const bright = Math.max(0.3, 1 - dist * 0.42);
          const sat = Math.max(0.5, 1 - dist * 0.3);
          cell.style.filter =
            `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(2)}) saturate(${sat.toFixed(2)})`;
          cell.style.opacity = Math.max(0, 1 - Math.max(0, dist - 1.6) * 0.7).toFixed(2);
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

      // Low-pass the raw cursor so the input itself is smooth (kills the
      // stair-stepping you'd get from quantising to a cell index).
      cursorX.current += (cursorRaw.current - cursorX.current) * (1 - Math.exp(-dt / 0.05));

      if (manualTarget.current !== null && now < manualUntil.current) {
        target.current = manualTarget.current;
      } else {
        if (manualTarget.current !== null) {
          target.current = manualTarget.current;
          manualTarget.current = null;
        }
        if (insideZone.current) {
          // Continuous cursor → target mapping. Cursor X across the zone
          // scrubs the whole reel (cursorX * N), and snapFloat eases toward it
          // — motion between cells is continuous, never quantised.
          target.current = cursorX.current * N;
        } else {
          // Cursor outside the zone: settle on the nearest whole film.
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

      // Hand playback to the film once the glide has essentially settled on it.
      const settledCenter = ((Math.round(snapFloat.current) % N) + N) % N;
      if (
        settledCenter !== playCenterRef.current &&
        Math.abs(wrapDelta(snapFloat.current - settledCenter, N)) < 0.06
      ) {
        playCenterRef.current = settledCenter;
        setPlayCenter(settledCenter);
      }

      // Mount any cell that has come within MOUNT_DIST of centre. The set only
      // grows, so this fires at most N times over the page's life — never per
      // frame once everything has been seen.
      let mountedNew = false;
      for (let i = 0; i < N; i++) {
        if (
          !mountedRef.current.has(i) &&
          Math.abs(wrapDelta(i - snapFloat.current, N)) <= MOUNT_DIST
        ) {
          mountedRef.current.add(i);
          mountedNew = true;
        }
      }
      if (mountedNew) setMounted(new Set(mountedRef.current));

      raf = requestAnimationFrame(tick);
    };

    applyTransforms(); // lay out before first paint to avoid a flash
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [N]);

  // Visible-cluster playback. Every muted iframe in the URL autoplays itself on
  // load, so our job is to PAUSE the ones you can't really see. We play the
  // centre film plus its two immediate neighbours (the cluster curving in at the
  // sides) and pause everything further round the cylinder — keeping live decode
  // at ~3 videos so the slide stays smooth, while every preview on screen moves.
  // Iframes stay mounted (no reload, no jump-to-zero) regardless of play state.
  useEffect(() => {
    const apply = () => {
      const slots = cellSlotsRef.current;
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (!slot) continue;
        const iframe = slot.querySelector<HTMLIFrameElement>('iframe.frame-video');
        if (!iframe || !iframe.contentWindow) continue;
        const play = Math.abs(wrapDelta(i - playCenterRef.current, N)) <= PLAY_DIST;
        const src = iframe.src || '';
        try {
          if (src.includes('youtube')) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: play ? 'playVideo' : 'pauseVideo', args: [] }),
              '*',
            );
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'mute', args: [] }),
              '*',
            );
          } else if (src.includes('vimeo')) {
            iframe.contentWindow.postMessage(JSON.stringify({ method: play ? 'play' : 'pause' }), '*');
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
  }, [playCenter, mounted, N]);

  const onCellClick = (i: number) => {
    const wrapped = wrapDelta(i - snapFloat.current, N);
    if (Math.abs(wrapped) < 0.5) {
      onPick(films[i]);
    } else {
      // Navigate to the clicked side film: glide the shortest path to it and
      // hold for ~900ms so the cursor scrub doesn't immediately fight it.
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
                  {/* The poster always renders; the iframe is mounted lazily
                      once the cell nears centre (so first paint loads only the
                      visible cluster, not all N). Once mounted it stays mounted
                      for the page's life — a stable key means position changes
                      (pure DOM transforms) never remount or reload it. */}
                  {mounted.has(i) && (
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
          ))}
        </div>
      </div>

      {/* Cinematic gate — a heavy curved vignette that frames the front film
          like a projector aperture and dissolves the curving side films into
          gloom at the edges. This is what sells the "inside a tube" look. */}
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
