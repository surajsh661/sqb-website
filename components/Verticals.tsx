'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { SQB_VERTICALS } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import { videoSrc, thumbSources } from '@/lib/video-utils';
import { IconArrow, IconPlay, IconX } from './Icons';
import type { Vertical } from '@/lib/types';

// Fan geometry — a 5-card window (centre = slot 2) drawn from however many
// verticals exist. Each visible card is translated to its slot and tilted, the
// centre scaled up; cards outside the window wait just off an edge (invisible)
// and glide in / out as the fan rotates. Applied via CSS variables (not a hard
// transform) and scoped to desktop, so the mobile marquee — which forces
// transform:none — is left untouched.
const SLOT_SPACING = 178; // px between adjacent slot centres (coverflow that fits
                          // beside the heading on desktop)
const VISIBLE = 5;
const CENTER = 2;
const SLOT_TILT = [
  { ty: 20, rot: -9, scale: 1 }, // 0 — far left
  { ty: 0, rot: -4, scale: 1 }, // 1 — left
  { ty: 0, rot: 0, scale: 1.4 }, // 2 — centre
  { ty: 0, rot: 4, scale: 1 }, // 3 — right
  { ty: 20, rot: 9, scale: 1 }, // 4 — far right
];
const SLOT_Z = [1, 2, 3, 2, 1];

// Map a card's slot (0..N-1) to its on-screen placement. Slots 0..4 are the
// visible fan; anything else parks just off an edge, invisible, ready to glide
// in. (The slot just "behind" the far-left card exits left; the rest wait right.)
function slotPlacement(slot: number, N: number) {
  if (slot < VISIBLE) {
    const t = SLOT_TILT[slot];
    return { tx: (slot - CENTER) * SLOT_SPACING, ty: t.ty, rot: t.rot, scale: t.scale, z: SLOT_Z[slot], op: 1, off: false };
  }
  const exitLeft = slot === N - 1;
  return {
    tx: (exitLeft ? -(CENTER + 1) : CENTER + 1) * SLOT_SPACING,
    ty: 20, rot: exitLeft ? -9 : 9, scale: 1, z: 0, op: 0, off: true,
  };
}

export default function Verticals() {
  const N = SQB_VERTICALS.length;
  const [rotation, setRotation] = useState(0);
  const [active, setActive] = useState<Vertical | null>(null);

  // Don't mount the fan's video iframes until the section nears the viewport.
  // Mounting all ~14 on first paint flooded the network with background videos
  // (Vimeo oembed calls timed out) and starved the video users actually tap.
  const sectionRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let done = false;
    const arm = () => {
      if (done) return;
      done = true;
      setMounted(true);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 600) arm();
    };
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) arm(); },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    // Scroll fallback in case IntersectionObserver is throttled. No blind timer:
    // if the section is never approached, its videos should never load.
    const onScroll = check;
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  // Rotate the fan by shifting a numeric offset. The cards themselves stay in a
  // FIXED dom order with stable keys, so their <iframe>s are never unmounted or
  // moved in the DOM (either of which reloads the video). Only each card's slot —
  // and therefore its CSS transform — changes, so the stack glides to its new
  // arrangement instead of the whole row refreshing.
  const rotate = (dir: number) => setRotation((r) => r + dir);

  // Auto-advance one card every 2.5s so all the verticals cycle through on their
  // own. The interval is set up ONCE on mount and never torn down — it reads the
  // pause/active state through refs and just skips a tick when paused. (The old
  // version recreated the interval whenever paused/active changed, so a missed
  // mouseleave or the initial render could leave it stuck and it would only move
  // once you clicked an arrow.) Paused while hovering the row or with a clip open.
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const activeRef = useRef(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { activeRef.current = !!active; }, [active]);
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || activeRef.current) return;
      setRotation((r) => r + 1);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Mobile: the row becomes a native horizontal scroller that auto-drifts AND
  // can be swiped left/right (the desktop CSS-rotation fan can't be grabbed by a
  // finger). Same approach as the BTS strip: float-accumulator drift that resumes
  // from the user's position (no reset), and a per-card overlay that distinguishes
  // a horizontal drag (scroll) from a tap (open the clip).
  const vrowRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const row = vrowRef.current;
    if (!row) return;
    // Only the MOBILE layout is a horizontal scroller (overflow-x:auto). The
    // desktop fan is overflow:visible, so it's skipped. Re-checked on resize so
    // the drift starts/stops when crossing the breakpoint. NOT gated on the
    // iframe lazy-mount — the cards are sized by CSS before their media loads,
    // so the constant drift runs as soon as the page is up.
    const isScroller = () => getComputedStyle(row).overflowX === 'auto';
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let mobile = isScroller();
    let raf = 0;
    let pausedUntil = 0;
    let pos = row.scrollLeft;
    const SPEED = 0.8; // px/frame ≈ 48px/s — a clearly-visible constant drift
    const tick = () => {
      // Auto-drift only when on the mobile scroller AND the visitor hasn't asked
      // for reduced motion (they can still swipe it manually).
      if (mobile && !reduceMq.matches) {
        const half = row.scrollWidth / 2;
        if (half > 0) {
          if (!activeRef.current && performance.now() > pausedUntil) {
            pos += SPEED; row.scrollLeft = pos;
          } else { pos = row.scrollLeft; }
          if (row.scrollLeft >= half) { row.scrollLeft -= half; pos = row.scrollLeft; }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const hold = () => { pausedUntil = performance.now() + 2000; };
    const onResize = () => { mobile = isScroller(); pos = row.scrollLeft; };
    window.addEventListener('resize', onResize);
    row.addEventListener('pointerdown', hold);
    row.addEventListener('touchmove', hold, { passive: true });
    row.addEventListener('scroll', hold, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      row.removeEventListener('pointerdown', hold);
      row.removeEventListener('touchmove', hold);
      row.removeEventListener('scroll', hold);
    };
  }, []);

  // Drag vs tap detection so swiping the row doesn't fire a card's open-modal click.
  const vSwipe = useRef<{ x: number; y: number; left: number; drag: boolean } | null>(null);
  const onCardPointerDown = (e: React.PointerEvent) => {
    const row = vrowRef.current;
    vSwipe.current = { x: e.clientX, y: e.clientY, left: row ? row.scrollLeft : 0, drag: false };
  };
  const onCardPointerMove = (e: React.PointerEvent) => {
    const s = vSwipe.current; const row = vrowRef.current;
    if (!s || !row) return;
    const dx = e.clientX - s.x; const dy = e.clientY - s.y;
    if (!s.drag && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) s.drag = true;
    if (s.drag) { row.scrollLeft = s.left - dx; e.preventDefault(); }
  };
  const onCardActivate = (v: Vertical) => {
    if (vSwipe.current?.drag) { vSwipe.current = null; return; } // was a swipe, not a tap
    vSwipe.current = null;
    setActive(v);
  };

  const buildModalSrc = (v: Vertical) => {
    if (v.type === 'vm')
      return `https://player.vimeo.com/video/${v.videoId}?autoplay=1&loop=1&muted=0&controls=1&dnt=1&playsinline=1&title=0&byline=0&portrait=0`;
    if (v.type === 'gd') return `https://drive.google.com/file/d/${v.videoId}/preview`;
    return `https://www.youtube.com/embed/${v.videoId}?autoplay=1&mute=0&loop=1&playlist=${v.videoId}&controls=1&modestbranding=1&rel=0&playsinline=1`;
  };

  useEffect(() => {
    if (!active) return;
    let tries = 0;
    const id = setInterval(() => {
      const f = document.querySelector<HTMLIFrameElement>('.vmodal-card iframe');
      if (!f || !f.contentWindow) return;
      try {
        const src = f.src || '';
        if (src.includes('vimeo')) {
          f.contentWindow.postMessage(JSON.stringify({ method: 'setMuted', value: false }), '*');
          f.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 1 }), '*');
          f.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
        } else if (src.includes('youtube')) {
          f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
          f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        }
      } catch {}
      if (++tries >= 6) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    if (active) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active]);

  return (
    <section className="verticals" data-screen-label="04 Verticals" ref={sectionRef}>
      <div className="head">
        <h2>{rich(COPY.verticalsHome.heading)}</h2>
      </div>
      <div
        className="vrow"
        ref={vrowRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Cards are rendered twice — desktop just shows the first 5 in the
            static row (the duplicates overflow off-screen and are hidden by
            .vrow's overflow on mobile); mobile uses CSS to animate the inner
            track into a seamless marquee using both passes. */}
        <div className="vrow-track">
          {[...SQB_VERTICALS, ...SQB_VERTICALS].map((v, i) => {
            // Fixed dom order + stable key: never remounts on rotation. The
            // first pass is the desktop fan; the second ('vdup') exists only to
            // make the mobile marquee loop seamlessly.
            const firstPass = i < N;
            const fidx = i % N;
            const slot = (((fidx - rotation) % N) + N) % N; // 0..N-1
            const p = slotPlacement(slot, N);
            const style: CSSProperties | undefined = firstPass
              ? ({
                  '--vtx': p.tx + 'px',
                  '--vty': p.ty + 'px',
                  '--vrot': p.rot + 'deg',
                  '--vscale': String(p.scale),
                  '--vz': String(p.z),
                  '--vop': String(p.op),
                } as CSSProperties)
              : undefined;
            return (
              <div
                className={'vcard' + (firstPass ? '' : ' vdup') + (firstPass && slot === CENTER ? ' center' : '')}
                key={v.id + '-' + i}
                style={style}
                data-off={firstPass && p.off ? '1' : undefined}
                title={v.title}
                onClick={() => onCardActivate(v)}
                onPointerDown={onCardPointerDown}
                onPointerMove={onCardPointerMove}
                role="button"
                tabIndex={0}
              >
                {mounted && (
                  v.type === 'gd' ? (
                    // Drive can't autoplay in the card (and pillarboxes), so show
                    // the clean 9:16 poster; click opens the case study to play.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbSources({ type: v.type, videoId: v.videoId })[1] || thumbSources({ type: v.type, videoId: v.videoId })[0]}
                      alt={v.title}
                      referrerPolicy="no-referrer"
                      loading={i === 2 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <iframe
                      src={videoSrc({ type: v.type, videoId: v.videoId }, { bg: true })}
                      title={v.title}
                      allow="autoplay; encrypted-media"
                      loading={i === 2 ? 'eager' : 'lazy'}
                    />
                  )
                )}
                <div className="vlabel">
                  <span className="tag">{v.tag}</span>
                  <div className="ttl">{v.title}</div>
                </div>
                <div className="vplay" aria-hidden="true"><IconPlay size={20} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="vrow-controls">
        <button onClick={() => rotate(-1)} aria-label="prev"><IconArrow dir="left" /></button>
        <button onClick={() => rotate(1)} aria-label="next"><IconArrow /></button>
      </div>

      <p className="vc-home-blurb">{COPY.verticalsHome.blurb}</p>

      {/* The modal is portalled to <body> so it escapes this section's scroll
          transform — otherwise position:fixed resolves against the transformed
          section, mis-centring the card and clipping the top of the video. */}
      {active && typeof document !== 'undefined' &&
        createPortal(
          <div className="vmodal" onClick={() => setActive(null)}>
            <div className="vmodal-card" onClick={(e) => e.stopPropagation()}>
              <iframe
                key={active.id}
                src={buildModalSrc(active)}
                title={active.title}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
              <div className="vmodal-meta">
                <span className="tag">{active.tag}</span>
                <span className="ttl">{active.title}</span>
              </div>
              <button className="vmodal-close" aria-label="Close" onClick={() => setActive(null)}><IconX size={16} /></button>
            </div>
            <div className="vmodal-hint">{COPY.common.vmodalHint}</div>
          </div>,
          document.body,
        )}
    </section>
  );
}
