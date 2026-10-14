'use client';
import { useEffect, useState } from 'react';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';

/**
 * One-shot intro overlay shown only on the FIRST homepage view of a browsing
 * session: a giant Anton "TELL YOUR STORY · TODAY." fades in, holds, then fades
 * out — revealing the hero carousel underneath. A sessionStorage flag means
 * navigating away and back to the homepage doesn't replay it; it only returns
 * on a fresh open of the site (new tab / new session). It waits until the tab
 * is actually visible, so it can't play out unseen in a background tab.
 *
 * It starts in an 'init' phase that renders null, so the server and the first
 * client render agree (no hydration mismatch). The effect then decides whether
 * to play. Any delay is hidden behind the dark <Loader> that's still on screen.
 */
export default function HeroIntro() {
  type Phase = 'init' | 'in' | 'hold' | 'out' | 'gone';
  const [phase, setPhase] = useState<Phase>('init');

  useEffect(() => {
    let already = false;
    try { already = sessionStorage.getItem('sqb-intro-seen') === '1'; } catch {}
    if (already) { setPhase('gone'); return; }

    // Start only once the page is actually on screen. The timeline used to start
    // at hydration, so in a tab opened in the background (or when the visitor
    // switched apps while it loaded) it played out unseen behind the loader and
    // was still marked as seen. requestAnimationFrame doesn't fire until the tab
    // is painted, and the seen-flag is written only when it really plays.
    //
    // Timings (from when it starts playing):
    //   0.00–0.85s   fade in
    //   0.85–2.00s   hold (~2s on screen)
    //   2.00–2.85s   fade out
    //   2.90s        unmount
    const timers: number[] = [];
    let started = false;
    const start = () => {
      if (started || document.visibilityState !== 'visible') return;
      started = true;
      document.removeEventListener('visibilitychange', start);
      try { sessionStorage.setItem('sqb-intro-seen', '1'); } catch {}
      setPhase('in');
      timers.push(
        window.setTimeout(() => setPhase('hold'), 60), // in(opacity0) → hold(opacity1) fades it up
        window.setTimeout(() => setPhase('out'), 2000),
        window.setTimeout(() => setPhase('gone'), 2900),
      );
    };
    const raf = requestAnimationFrame(start);
    document.addEventListener('visibilitychange', start);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', start);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === 'init' || phase === 'gone') return null;

  return (
    <div className={'hero-intro hero-intro-' + phase} aria-hidden="true">
      <div className="hi-stack">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hi-logo" src="/logo-dark.png" alt="S'QB Pictures" />
        <h2 className="hi-text">
          {rich(COPY.intro.headline)}
          <span className="hi-dot">.</span>
        </h2>
      </div>
    </div>
  );
}
