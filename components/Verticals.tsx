'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { SQB_VERTICALS } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import { videoSrc } from '@/lib/video-utils';
import type { Vertical } from '@/lib/types';

// Fan geometry — 5 slots, centre is slot 2. Each card is translated to its slot
// and tilted; the centre is scaled up. Position is applied through CSS variables
// (not a hard `transform`) so the mobile marquee — which forces transform:none —
// is left untouched.
const SLOT_SPACING = 240; // px between adjacent slot centres
const SLOT_TILT = [
  { ty: 20, rot: -9, scale: 1 }, // 0 — far left
  { ty: 0, rot: -4, scale: 1 }, // 1 — left
  { ty: 0, rot: 0, scale: 1.4 }, // 2 — centre
  { ty: 0, rot: 4, scale: 1 }, // 3 — right
  { ty: 20, rot: 9, scale: 1 }, // 4 — far right
];
const SLOT_Z = [1, 2, 3, 2, 1];

export default function Verticals() {
  const N = SQB_VERTICALS.length;
  const [rotation, setRotation] = useState(0);
  const [active, setActive] = useState<Vertical | null>(null);

  // Rotate the fan by shifting a numeric offset. The cards themselves stay in a
  // FIXED dom order with stable keys, so their <iframe>s are never unmounted or
  // moved in the DOM (either of which reloads the video). Only each card's slot —
  // and therefore its CSS transform — changes, so the stack glides to its new
  // arrangement instead of the whole row refreshing.
  const rotate = (dir: number) => setRotation((r) => r + dir);

  const buildModalSrc = (v: Vertical) => {
    if (v.type === 'vm')
      return `https://player.vimeo.com/video/${v.videoId}?autoplay=1&loop=1&muted=0&controls=1&dnt=1&playsinline=1&title=0&byline=0&portrait=0`;
    if (v.type === 'gd') return `https://drive.google.com/file/d/${v.videoId}/preview`;
    return `https://www.youtube.com/embed/${v.videoId}?autoplay=1&mute=0&loop=1&playlist=${v.videoId}&controls=1&modestbranding=1&rel=0&playsinline=1`;
  };

  useEffect(() => {
    if (!active) return;
    let tries = 0;
    const id = setInterval(() => {
      const f = document.querySelector<HTMLIFrameElement>('.vmodal-card iframe');
      if (!f || !f.contentWindow) return;
      try {
        const src = f.src || '';
        if (src.includes('vimeo')) {
          f.contentWindow.postMessage(JSON.stringify({ method: 'setMuted', value: false }), '*');
          f.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 1 }), '*');
          f.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
        } else if (src.includes('youtube')) {
          f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
          f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        }
      } catch {}
      if (++tries >= 6) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    if (active) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active]);

  return (
    <section className="verticals" data-screen-label="04 Verticals">
      <div className="head">
        <h2>{rich(COPY.verticalsHome.heading)}</h2>
        <div className="blurb">{COPY.verticalsHome.blurb}</div>
      </div>
      <div className="vrow">
        {/* Cards are rendered twice — desktop just shows the first 5 in the
            static row (the duplicates overflow off-screen and are hidden by
            .vrow's overflow on mobile); mobile uses CSS to animate the inner
            track into a seamless marquee using both passes. */}
        <div className="vrow-track">
          {[...SQB_VERTICALS, ...SQB_VERTICALS].map((v, i) => {
            // Fixed dom order + stable key: never remounts on rotation.
            const firstPass = i < N;
            const fidx = i % N;
            const slot = (((fidx - rotation) % N) + N) % N; // 0..N-1
            const tilt = SLOT_TILT[slot] || SLOT_TILT[0];
            // translateX bridges the card's fixed flow position to its slot.
            const tx = (slot - fidx) * SLOT_SPACING;
            const style: CSSProperties | undefined = firstPass
              ? ({
                  '--vtx': tx + 'px',
                  '--vty': tilt.ty + 'px',
                  '--vrot': tilt.rot + 'deg',
                  '--vscale': String(tilt.scale),
                  '--vz': String(SLOT_Z[slot] ?? 1),
                } as CSSProperties)
              : undefined;
            return (
              <div
                className={'vcard' + (firstPass && slot === 2 ? ' center' : '')}
                key={v.id + '-' + i}
                style={style}
                title={v.title}
                onClick={() => setActive(v)}
                role="button"
                tabIndex={0}
              >
                <iframe
                  src={videoSrc({ type: v.type, videoId: v.videoId }, { bg: true })}
                  title={v.title}
                  allow="autoplay; encrypted-media"
                  loading={i === 2 ? 'eager' : 'lazy'}
                />
                <div className="vlabel">
                  <span className="tag">{v.tag}</span>
                  <div className="ttl">{v.title}</div>
                </div>
                <div className="vplay" aria-hidden="true">▶</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="vrow-controls">
        <button onClick={() => rotate(-1)} aria-label="prev">←</button>
        <button onClick={() => rotate(1)} aria-label="next">→</button>
      </div>

      {active && (
        <div className="vmodal" onClick={() => setActive(null)}>
          <div className="vmodal-card" onClick={(e) => e.stopPropagation()}>
            <iframe
              key={active.id}
              src={buildModalSrc(active)}
              title={active.title}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
            <div className="vmodal-meta">
              <span className="tag">{active.tag}</span>
              <span className="ttl">{active.title}</span>
            </div>
            <button className="vmodal-close" aria-label="Close" onClick={() => setActive(null)}>×</button>
          </div>
          <div className="vmodal-hint">{COPY.common.vmodalHint}</div>
        </div>
      )}
    </section>
  );
}
