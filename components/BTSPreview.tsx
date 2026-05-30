'use client';
import { SQB_BTS } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import type { BTS } from '@/lib/types';

const srcFor = (b: BTS) =>
  b.type === 'vm'
    ? `https://player.vimeo.com/video/${b.videoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&dnt=1&autopause=0`
    : b.type === 'gd'
    ? `https://drive.google.com/file/d/${b.videoId}/preview`
    : b.type === 'ig'
    ? `https://www.instagram.com/reel/${b.videoId}/embed/`
    : `https://www.youtube.com/embed/${b.videoId}?autoplay=1&mute=1&loop=1&playlist=${b.videoId}&controls=0&modestbranding=1&showinfo=0&rel=0&playsinline=1`;

export default function BTSPreview() {
  const items = SQB_BTS;
  const renderCard = (b: BTS, key: string) => {
    const isIg = b.type === 'ig';
    return (
      <div className="bts-card" key={key}>
        <div className="bts-frame">
          {isIg ? (
            /* Instagram gates embedded reel PLAYBACK to logged-in sessions, so a
               raw embed shows "this content isn't available" for most visitors.
               Instead we render a branded tile whose play button opens the real
               reel on Instagram (where it always plays). Swap to a hosted clip
               (vm/gd/yt) if inline playback on-site is ever wanted. */
            <a
              className="bts-ig"
              href={`https://www.instagram.com/reel/${b.videoId}/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch ${b.title} on Instagram`}
            >
              <span className="bts-ig-glow" aria-hidden="true" />
              <span className="bts-ig-play" aria-hidden="true" />
              <span className="bts-ig-cta">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
                </svg>
                Watch on Instagram
              </span>
            </a>
          ) : (
            <iframe
              src={srcFor(b)}
              title={b.title}
              allow="autoplay; encrypted-media"
              loading="lazy"
              /* scrolling="no" stops the embed from scrolling its own content
                 vertically and stealing page-scroll. Deprecated but every browser
                 still honours it. */
              scrolling="no"
            />
          )}
          <div className="bts-vignette" />
        </div>
        <div className="bts-meta">
          <span className="bts-tag">{b.tag}</span>
          <div className="bts-title">{b.title}</div>
        </div>
      </div>
    );
  };

  return (
    <section className="bts" data-screen-label="09 BTS">
      <div className="bts-head">
        <div className="eyebrow"><span className="num">{COPY.bts.eyebrowNumber}</span> <span>{COPY.bts.eyebrowLabel}</span></div>
        <h2>{rich(COPY.bts.heading)}</h2>
        <p className="bts-blurb">{COPY.bts.blurb}</p>
      </div>
      <div className="bts-marquee">
        <div className="bts-marquee-track">
          {items.map((b, i) => renderCard(b, 'a' + i))}
          {items.map((b, i) => renderCard(b, 'b' + i))}
        </div>
      </div>
    </section>
  );
}
