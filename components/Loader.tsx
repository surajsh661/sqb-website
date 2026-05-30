'use client';
import { useEffect, useState } from 'react';

export default function Loader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const minShownUntil = performance.now() + 350;
    const hide = () => {
      const wait = Math.max(0, minShownUntil - performance.now());
      setTimeout(() => setDone(true), wait);
    };
    const t = setTimeout(hide, 700);
    window.addEventListener('load', hide);
    const failsafe = setTimeout(hide, 3000);
    return () => { clearTimeout(t); clearTimeout(failsafe); window.removeEventListener('load', hide); };
  }, []);
  return (
    <div className={'sqb-loader' + (done ? ' done' : '')} id="sqb-loader">
      <div className="sqb-loader-icon">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="lr-svg">
          <g className="lr-film" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ transformOrigin: '100px 100px' }}>
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
            <circle cx="118" cy="92" r="3.4" fill="#F5C518" stroke="none" />
            <line x1="74" y1="126" x2="74" y2="146" />
            <line x1="92" y1="126" x2="92" y2="146" />
            <line x1="74" y1="146" x2="92" y2="146" />
          </g>
          <g className="lr-stars" fill="none" stroke="#F5C518" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0" style={{ transformOrigin: '100px 100px' }}>
            <path d="M100 60 L104.5 95.5 L140 100 L104.5 104.5 L100 140 L95.5 104.5 L60 100 L95.5 95.5 Z" />
            <path d="M48 50 L52 70 L72 74 L52 78 L48 98 L44 78 L24 74 L44 70 Z" />
            <path d="M152 148 L155 162 L169 166 L155 170 L152 184 L149 170 L135 166 L149 162 Z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
