'use client';
import { useEffect, useState } from 'react';
import { SQB_VERTICALS } from '@/lib/data';
import { videoSrc } from '@/lib/video-utils';
import type { Vertical } from '@/lib/types';

export default function Verticals() {
  const [order, setOrder] = useState<Vertical[]>(SQB_VERTICALS);
  const [active, setActive] = useState<Vertical | null>(null);

  const rotate = (dir: number) => {
    setOrder((prev) => {
      const a = [...prev];
      if (dir > 0) a.push(a.shift()!);
      else a.unshift(a.pop()!);
      return a;
    });
  };

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
        <h2>VERTICAL <em style={{ margin: '0px' }}>WORKS</em></h2>
        <div className="blurb">9:16 stories built for the medium they live in.</div>
      </div>
      <div className="vrow">
        {/* Cards are rendered twice — desktop just shows the first 5 in the
            static row (the duplicates overflow off-screen and are hidden by
            .vrow's overflow on mobile); mobile uses CSS to animate the inner
            track into a seamless marquee using both passes. */}
        <div className="vrow-track">
          {[...order, ...order].map((v, i) => {
            const localIdx = i % order.length;
            return (
              <div
                className={'vcard' + (localIdx === 2 ? ' center' : '')}
                key={v.id + '-' + i}
                title={v.title}
                onClick={() => setActive(v)}
                role="button"
                tabIndex={0}
              >
                <iframe
                  src={videoSrc({ type: v.type, videoId: v.videoId }, { bg: true })}
                  title={v.title}
                  allow="autoplay; encrypted-media"
                  loading={localIdx === 2 && i < order.length ? 'eager' : 'lazy'}
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
            <button className="vmodal-close" onClick={() => setActive(null)}>×</button>
          </div>
          <div className="vmodal-hint">CLICK OUTSIDE OR ESC TO CLOSE</div>
        </div>
      )}
    </section>
  );
}
