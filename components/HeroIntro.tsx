'use client';
import { useEffect, useState } from 'react';

/**
 * One-shot intro overlay shown on every page load: a giant Anton "TELL YOUR
 * STORY · TODAY." fades in, holds, then fades out — revealing the hero
 * carousel underneath. After the out-phase the component returns null so it
 * stops affecting layout / accessibility entirely.
 */
export default function HeroIntro() {
  type Phase = 'in' | 'hold' | 'out' | 'gone';
  const [phase, setPhase] = useState<Phase>('in');

  useEffect(() => {
    // Timings (extended by 2s vs the first cut so it reads longer):
    //   0.00–0.85s   fade in
    //   0.85–3.50s   hold (~3.5s on screen — plenty of read time)
    //   3.50–4.35s   fade out
    //   4.35s        unmount
    const t1 = window.setTimeout(() => setPhase('hold'), 50);
    const t2 = window.setTimeout(() => setPhase('out'), 3500);
    const t3 = window.setTimeout(() => setPhase('gone'), 4400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div className={'hero-intro hero-intro-' + phase} aria-hidden="true">
      <div className="hi-stack">
        <span className="hi-eyebrow">S&apos;QB PICTURES</span>
        <h2 className="hi-text">
          TELL YOUR <em>STORY</em>
          <br />
          TODAY<span className="hi-dot">.</span>
        </h2>
      </div>
    </div>
  );
}
