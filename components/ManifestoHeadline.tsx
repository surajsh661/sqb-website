'use client';
import { useEffect, useRef } from 'react';

/**
 * Scroll-triggered manifesto headline animation.
 *
 * On entry: "filmmaking" splits into "film" + "making" with a cream-stroked
 * cinema camera popping into the gap (record dot blinks, lens rays flash);
 * simultaneously "AI" splits into "A" + "I" with three yellow stars
 * twinkling in the gap. Both hold ~2.5s then close back to the resting
 * "filmmaking" / "AI" wording. Re-triggers on every entry via
 * IntersectionObserver at threshold 0.55.
 */
export default function ManifestoHeadline() {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let armed = true;

    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === 'mhCamGap') {
        el.classList.remove('play');
        armed = true;
      }
    };
    el.addEventListener('animationend', onEnd);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && armed) {
            armed = false;
            el.classList.remove('play');
            void el.offsetWidth; // force reflow so the animation can restart
            el.classList.add('play');
          }
        });
      },
      { threshold: 0.55 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      el.removeEventListener('animationend', onEnd);
    };
  }, []);

  const camera = (
    <span className="cam-slot" aria-hidden="true">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="var(--fg)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="30" y="68" width="100" height="58" rx="8" />
          <circle cx="62" cy="56" r="14" /><circle cx="62" cy="56" r="5" />
          <circle cx="108" cy="56" r="14" /><circle cx="108" cy="56" r="5" />
          <line x1="62" y1="70" x2="108" y2="70" />
          <line x1="130" y1="82" x2="148" y2="76" />
          <line x1="130" y1="112" x2="148" y2="118" />
          <rect x="148" y="76" width="22" height="42" rx="3" />
          <circle cx="159" cy="97" r="10" /><circle cx="159" cy="97" r="4" />
          <line x1="48" y1="68" x2="42" y2="58" /><line x1="42" y1="58" x2="34" y2="58" />
          <line x1="74" y1="126" x2="74" y2="146" />
          <line x1="92" y1="126" x2="92" y2="146" />
          <line x1="74" y1="146" x2="92" y2="146" />
        </g>
        <circle className="cam-rec" cx="100" cy="92" r="5.5" fill="#ff3b30" />
        <g className="cam-flash" fill="none" stroke="var(--fg)" strokeWidth="5" strokeLinecap="round">
          <line x1="176" y1="97" x2="193" y2="97" />
          <line x1="173" y1="82" x2="187" y2="72" />
          <line x1="173" y1="112" x2="187" y2="122" />
        </g>
      </svg>
    </span>
  );

  const stars = (
    <span className="star-slot" aria-hidden="true">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
          <path className="star-tw s1" d="M100 48 C103.5 88 112 96.5 152 100 C112 103.5 103.5 112 100 152 C96.5 112 88 103.5 48 100 C88 96.5 96.5 88 100 48 Z" />
          <path className="star-tw s2" d="M52 30 C53.5 50 58 54.5 78 56 C58 57.5 53.5 62 52 82 C50.5 62 46 57.5 26 56 C46 54.5 50.5 50 52 30 Z" strokeWidth="5" />
          <path className="star-tw s3" d="M150 122 C151.5 142 156 146.5 176 148 C156 149.5 151.5 154 150 174 C148.5 154 144 149.5 124 148 C144 146.5 148.5 142 150 122 Z" strokeWidth="5" />
        </g>
      </svg>
    </span>
  );

  return (
    <h2 className="mh" ref={ref}>
      We love{' '}
      <span className="mh-nowrap">
        <em>film</em>{camera}<em>making</em>
      </span>
      <br />
      first and{' '}
      <span className="mh-nowrap">
        <span className="ai">A</span>{stars}<span className="ai">I</span>
      </span>{' '}
      second. <br />
      <span className="mh-coda">And we&apos;re at the <em>cutting edge</em> of both.</span>
    </h2>
  );
}
