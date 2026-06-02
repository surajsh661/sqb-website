'use client';
import { useEffect, useRef, useState } from 'react';
import { SQB_BTS } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import type { BTS } from '@/lib/types';

const srcFor = (b: BTS) =>
  b.type === 'vm'
    ? `https://player.vimeo.com/video/${b.videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&dnt=1&autopause=0`
    : b.type === 'gd'
    ? `https://drive.google.com/file/d/${b.videoId}/preview`
    : b.type === 'ig'
    ? `https://www.instagram.com/reel/${b.videoId}/embed/`
    : `https://www.youtube.com/embed/${b.videoId}?autoplay=1&mute=1&loop=1&playlist=${b.videoId}&controls=0&modestbranding=1&showinfo=0&rel=0&playsinline=1`;

export default function BTSPreview() {
  const items = SQB_BTS;
  // Don't mount the 10+ BTS embeds until the strip is actually near the viewport.
  // Mounting them all on first paint loaded 20+ background videos at once, which
  // saturated the network/decoder (Vimeo oembed calls were timing out) and made
  // the videos you actually tap lag. They mount once the section approaches.
  const sectionRef = useRef<HTMLElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let done = false;
    const arm = () => {
      if (done) return;
      done = true;
      setActive(true);
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
    const onScroll = check;
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  // Mobile: the strip is a NATIVE horizontal scroller (the CSS marquee can't be
  // grabbed by a finger). It auto-drifts via scrollLeft and the user can swipe
  // it. Crucially, drift RESUMES from wherever the user left it (no jump/reset),
  // and the seamless loop is anchored to the real scrollLeft so a swipe never
  // snaps back to the start. The embeds stay interactive (clickable like desktop)
  // — the swipe is handled per-card by .bts-swipe overlays (see renderCard),
  // which only intercept a horizontal DRAG and pass clean taps to the iframe.
  useEffect(() => {
    if (!active) return;
    const track = marqueeRef.current;
    if (!track) return;
    const isScroller = getComputedStyle(track).overflowX !== 'visible';
    if (!isScroller) return;

    let raf = 0;
    let pausedUntil = 0;
    let pos = track.scrollLeft;
    const SPEED = 0.5; // px per frame ≈ 30px/s drift
    const tick = () => {
      const half = track.scrollWidth / 2;
      if (half > 0) {
        if (performance.now() > pausedUntil) {
          pos += SPEED;
          track.scrollLeft = pos; // (scrollLeft truncates to int; pos is the float)
        } else {
          pos = track.scrollLeft; // while paused / user-driven, follow the real pos
        }
        // Seamless loop anchored to the REAL position so swiping never resets:
        // if we've passed the half-way duplicate point, rebase by one half.
        if (track.scrollLeft >= half) { track.scrollLeft -= half; pos = track.scrollLeft; }
        else if (track.scrollLeft <= 0 && pos < 0) { track.scrollLeft += half; pos = track.scrollLeft; }
      }
      raf = requestAnimationFrame(tick);
    };
    // Pause the drift for 2s after any user interaction, then it resumes from the
    // current spot (pos is re-read from scrollLeft above, so no jump).
    const hold = () => { pausedUntil = performance.now() + 2000; };
    track.addEventListener('pointerdown', hold);
    track.addEventListener('touchmove', hold, { passive: true });
    track.addEventListener('scroll', hold, { passive: true });
    track.addEventListener('wheel', hold, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('pointerdown', hold);
      track.removeEventListener('touchmove', hold);
      track.removeEventListener('scroll', hold);
      track.removeEventListener('wheel', hold);
    };
  }, [active]);

  // Per-card swipe overlay: catches a horizontal DRAG and scrolls the strip, but
  // lets a clean TAP fall through to the iframe (so embeds open/play like desktop).
  const swipe = useRef<{ x: number; y: number; left: number; drag: boolean } | null>(null);
  const onOverlayPointerDown = (e: React.PointerEvent) => {
    const track = marqueeRef.current;
    if (!track) return;
    swipe.current = { x: e.clientX, y: e.clientY, left: track.scrollLeft, drag: false };
  };
  const onOverlayPointerMove = (e: React.PointerEvent) => {
    const s = swipe.current;
    const track = marqueeRef.current;
    if (!s || !track) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.drag && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) s.drag = true;
    if (s.drag) {
      track.scrollLeft = s.left - dx;
      e.preventDefault();
    }
  };
  // Open the reel/clip when a card is tapped (not dragged) — the mobile
  // equivalent of "view it", since you can't tap inside a cross-origin iframe
  // through the swipe overlay.
  const openSrc = (b: BTS) => {
    const url =
      b.type === 'ig' ? `https://www.instagram.com/reel/${b.videoId}/`
      : b.type === 'gd' ? `https://drive.google.com/file/d/${b.videoId}/view`
      : b.type === 'vm' ? `https://vimeo.com/${b.videoId}`
      : `https://www.youtube.com/watch?v=${b.videoId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const onOverlayTap = (b: BTS) => {
    // Fired on pointerup via onClick; if it was a drag, ignore (the swipe moved
    // the strip). A clean tap opens the reel.
    if (swipe.current?.drag) { swipe.current = null; return; }
    swipe.current = null;
    openSrc(b);
  };

  const renderCard = (b: BTS, key: string) => {
    const isIg = b.type === 'ig';
    return (
      <div className="bts-card" key={key}>
        <div className="bts-frame">
          {active ? (
            <iframe
              src={srcFor(b)}
              title={b.title}
              allow="autoplay; encrypted-media"
              loading="lazy"
              /* scrolling="no" stops the embed from scrolling its own content
                 vertically and stealing page-scroll. Deprecated but every browser
                 still honours it. */
              scrolling="no"
              /* For Instagram only: a sandbox that allows the embed's scripts +
                 same-origin requests + presentation API (fullscreen video) but
                 explicitly does NOT include allow-top-navigation / allow-popups,
                 so the "View on Instagram" link inside the widget can't kick the
                 whole page over to instagram.com. */
              sandbox={isIg ? 'allow-scripts allow-same-origin allow-presentation' : undefined}
            />
          ) : (
            <div className="bts-placeholder" aria-hidden="true" />
          )}
          <div className="bts-vignette" />
          {/* Mobile swipe + tap-to-open overlay (hidden on desktop via CSS, so the
              embed stays directly interactive there). */}
          <div
            className="bts-swipe"
            onPointerDown={onOverlayPointerDown}
            onPointerMove={onOverlayPointerMove}
            onClick={() => onOverlayTap(b)}
            role="button"
            tabIndex={0}
            aria-label={`Open ${b.title}`}
          />
        </div>
        <div className="bts-meta">
          <span className="bts-tag">{b.tag}</span>
          <div className="bts-title">{b.title}</div>
        </div>
      </div>
    );
  };

  return (
    <section className="bts" data-screen-label="09 BTS" ref={sectionRef}>
      <div className="bts-head">
        <div className="eyebrow"><span className="num">{COPY.bts.eyebrowNumber}</span> <span>{COPY.bts.eyebrowLabel}</span></div>
        <h2>{rich(COPY.bts.heading)}</h2>
      </div>
      <div className="bts-marquee" ref={marqueeRef}>
        <div className="bts-marquee-track">
          {items.map((b, i) => renderCard(b, 'a' + i))}
          {items.map((b, i) => renderCard(b, 'b' + i))}
        </div>
      </div>
    </section>
  );
}
