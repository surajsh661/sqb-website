'use client';
import { useEffect, useState } from 'react';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';

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
    // Timings (1.5s shorter than the previous cut):
    //   0.00–0.85s   fade in
    //   0.85–2.00s   hold (~2s on screen)
    //   2.00–2.90s   fade out
    //   2.90s        unmount
    const t1 = window.setTimeout(() => setPhase('hold'), 50);
    const t2 = window.setTimeout(() => setPhase('out'), 2000);
    const t3 = window.setTimeout(() => setPhase('gone'), 2900);
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
        <span className="hi-eyebrow">{COPY.intro.eyebrow}</span>
        <h2 className="hi-text">
          {rich(COPY.intro.headline)}
          <span className="hi-dot">.</span>
        </h2>
      </div>
    </div>
  );
}
