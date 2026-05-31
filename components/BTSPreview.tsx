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

  // Mobile: the strip is a NATIVE horizontal scroller (CSS marquee can't be
  // grabbed by a finger, and the IG iframes eat the touch). We auto-advance
  // scrollLeft so it keeps drifting, but the moment the user touches it we pause,
  // then resume shortly after they let go. Loops seamlessly because the cards
  // are rendered twice — when we pass the half-way point we jump back by half.
  useEffect(() => {
    if (!active) return;
    const track = marqueeRef.current;
    if (!track) return;
    // Only when the strip is actually a native horizontal scroller (the mobile
    // ≤900px layout). On desktop the CSS marquee handles motion, so skip.
    const isScroller = getComputedStyle(track).overflowX !== 'visible';
    if (!isScroller) return;

    let raf = 0;
    let pausedUntil = 0;
    let userScrolling = false;
    // Float accumulator: scrollLeft only stores INTEGERS, so adding 0.4 each
    // frame would round back to 0 forever and never move. Track the position as
    // a float here and write the rounded value to scrollLeft.
    let pos = track.scrollLeft;
    const SPEED = 0.5; // px per frame ≈ 30px/s drift
    const tick = () => {
      const half = track.scrollWidth / 2;
      if (!userScrolling && performance.now() > pausedUntil && half > 0) {
        pos += SPEED;
        if (pos >= half) pos -= half; // seamless loop (cards are rendered twice)
        track.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    // Touch (or any manual scroll) pauses the auto-drift for 2.5s so the user
    // stays in control. Touch listeners simply never fire on non-touch devices.
    const hold = () => { pos = track.scrollLeft; pausedUntil = performance.now() + 2500; };
    const onTouchStart = () => { userScrolling = true; };
    const onTouchEnd = () => {
      userScrolling = false;
      pos = track.scrollLeft; // resync the float to where the user left it
      pausedUntil = performance.now() + 2500;
    };
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    track.addEventListener('touchcancel', onTouchEnd, { passive: true });
    track.addEventListener('touchmove', hold, { passive: true });
    track.addEventListener('wheel', hold, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('touchcancel', onTouchEnd);
      track.removeEventListener('touchmove', hold);
      track.removeEventListener('wheel', hold);
    };
  }, [active]);

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
        <p className="bts-blurb">{COPY.bts.blurb}</p>
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
