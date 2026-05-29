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
    // Timings:
    //   0.0–0.9s  fade in
    //   0.9–2.4s  hold (1.5s, plenty of time to read)
    //   2.4–3.1s  fade out
    //   3.1s      unmount
    const t1 = window.setTimeout(() => setPhase('hold'), 50);
    const t2 = window.setTimeout(() => setPhase('out'), 1500);
    const t3 = window.setTimeout(() => setPhase('gone'), 2400);
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
