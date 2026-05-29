'use client';
import { useEffect } from 'react';

/**
 * Site-wide momentum-smoothed scroll. Hijacks wheel events, lerps the real
 * scroll position toward a target each frame, gives the whole page that
 * "buttery glide" feel. Disabled on touch devices because native momentum
 * scroll on iOS / Android already feels right.
 *
 * Skips elements explicitly opted into native scroll via
 *   data-native-scroll
 * plus textarea / input / iframe / .case-study so the case-study modal,
 * BTS embeds and the contact form don't get hijacked.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch =
      'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
    if (isTouch) return;

    let target = window.scrollY;
    let current = window.scrollY;
    const damping = 0.085;       // higher = snappier, lower = heavier glide
    const wheelGain = 1.0;
    let raf = 0;

    const clamp = (v: number) =>
      Math.max(
        0,
        Math.min(v, document.documentElement.scrollHeight - window.innerHeight),
      );

    const onWheel = (e: WheelEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el &&
        el.closest(
          '[data-native-scroll], textarea, input, iframe, .case-study, .ce-row, .ticket-overlay',
        )
      ) {
        return;
      }
      e.preventDefault();
      target = clamp(target + e.deltaY * wheelGain);
    };

    const tick = () => {
      const diff = target - current;
      if (Math.abs(diff) > 0.5) {
        current += diff * damping;
        window.scrollTo(0, current);
      } else {
        current = target;
      }
      raf = requestAnimationFrame(tick);
    };

    // If native scroll happens (anchor links, JS scrollTo, etc.) sync the
    // lerp state to it so we don't fight it.
    let syncing = false;
    const onScroll = () => {
      if (syncing) return;
      syncing = true;
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - current) > 80) {
          current = window.scrollY;
          target = window.scrollY;
        }
        syncing = false;
      });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}
