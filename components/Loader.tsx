'use client';
import { useEffect, useState } from 'react';

export default function Loader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    // Hide fast on a fixed timer — do NOT wait for window 'load'. 'load' only
    // fires after every resource (including the video iframes) finishes, which
    // kept the dark overlay up while the hero sat hidden and the videos couldn't
    // even start painting. Revealing the hero quickly lets the iframes decode
    // their first frame sooner, so the videos appear faster, not slower.
    const t = setTimeout(() => setDone(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={'sqb-loader' + (done ? ' done' : '')} id="sqb-loader">
      {/* Three separately-framed icons laid out in a clean, evenly-spaced row
          (clapboard · camera · AI stars). Each is its own SVG sized in CSS, so
          they stay balanced — no fragile shared-viewBox transform maths. */}
      <div className="sqb-loader-icon">
        {/* Clapboard — top stick hinges at the back-left corner and claps. */}
        <svg className="lr-clap" viewBox="0 0 72 74" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="11" y="31" width="50" height="33" rx="5" />
          <g className="lr-clap-top" stroke="#F5C518">
            <rect x="9" y="14" width="54" height="14" rx="3" />
            <line x1="18" y1="14" x2="24" y2="28" />
            <line x1="31" y1="14" x2="37" y2="28" />
            <line x1="44" y1="14" x2="50" y2="28" />
            <line x1="57" y1="14" x2="61" y2="22" />
          </g>
        </svg>

        {/* Camera — blinking yellow REC dot. */}
        <svg className="lr-film" viewBox="26 40 172 112" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="30" y="68" width="100" height="58" rx="8" />
          <circle cx="62" cy="56" r="14" />
          <circle cx="62" cy="56" r="5" />
          <circle cx="108" cy="56" r="14" />
          <circle cx="108" cy="56" r="5" />
          <line x1="62" y1="70" x2="108" y2="70" />
          <line x1="130" y1="82" x2="148" y2="76" />
          <line x1="130" y1="112" x2="148" y2="118" />
          <rect x="148" y="76" width="22" height="42" rx="3" />
          <circle cx="159" cy="97" r="10" />
          <circle cx="159" cy="97" r="4" />
          <line x1="48" y1="68" x2="42" y2="58" />
          <line x1="42" y1="58" x2="34" y2="58" />
          <circle className="lr-rec" cx="118" cy="92" r="3.4" fill="#F5C518" stroke="none" />
          <line x1="74" y1="126" x2="74" y2="146" />
          <line x1="92" y1="126" x2="92" y2="146" />
          <line x1="74" y1="146" x2="92" y2="146" />
        </svg>

        {/* AI stars — centre star carries a yellow fill. */}
        <svg className="lr-stars" viewBox="20 44 154 146" fill="none" stroke="#F5C518" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path className="lr-star-main" fill="#F5C518" d="M100 60 L104.5 95.5 L140 100 L104.5 104.5 L100 140 L95.5 104.5 L60 100 L95.5 95.5 Z" />
          <path d="M48 50 L52 70 L72 74 L52 78 L48 98 L44 78 L24 74 L44 70 Z" />
          <path d="M152 148 L155 162 L169 166 L155 170 L152 184 L149 170 L135 166 L149 162 Z" />
        </svg>
      </div>
    </div>
  );
}
