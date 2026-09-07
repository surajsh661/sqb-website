'use client';
import { useState } from 'react';
import { SQB_FEATURE } from '@/lib/data';

/**
 * The theatrical feature band.
 *
 * `compact` (home page) leads with the wide key art and the credit — enough to
 * register the milestone without derailing the scroll. The full variant (Video
 * page) adds the trailer, the spec row and the synopsis.
 *
 * The trailer is click-to-load: the iframe is only mounted once the poster is
 * clicked, so a YouTube player never costs anything on first paint.
 */
export default function FeatureFilm({ compact = false }: { compact?: boolean }) {
  const f = SQB_FEATURE;
  const [playing, setPlaying] = useState(false);

  const Meta = () => (
    <dl className="ff-meta">
      {[
        ['Format', 'Theatrical feature'],
        ['Runtime', f.runtime],
        ['Language', f.language],
        ['Genre', f.genre],
        ['Director', f.director],
      ].map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <section className={'ff' + (compact ? ' ff-compact' : '')} data-screen-label="Theatrical Feature">
      <div className="ff-eyebrow">
        <span className="ff-dot" />
        {f.status}
      </div>

      <div className="ff-grid">
        {/* Key art / trailer */}
        <div className="ff-media">
          {playing ? (
            <iframe
              className="ff-frame"
              src={`https://www.youtube.com/embed/${f.trailerId}?autoplay=1&rel=0`}
              title={`${f.title} — official trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="ff-play"
              onClick={() => setPlaying(true)}
              aria-label={`Play the ${f.title} official trailer`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.wide} alt={`${f.title} — ${f.subtitle} key art`} />
              <span className="ff-play-btn" aria-hidden="true">▶</span>
              <span className="ff-play-label" aria-hidden="true">OFFICIAL TRAILER</span>
            </button>
          )}
        </div>

        {/* Copy */}
        <div className="ff-copy">
          <h2 className="ff-title">
            {f.title}
            {f.subtitle && <em>{f.subtitle}</em>}
          </h2>

          <p className="ff-credit">{f.credit}</p>
          <p className="ff-studios">{f.studios}</p>

          <p className="ff-lede">{f.lede}</p>
          {!compact && <p className="ff-body">{f.body}</p>}

          {!compact && <Meta />}

          <div className="ff-actions">
            <a
              className="ff-btn primary"
              href={`https://www.youtube.com/watch?v=${f.trailerId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch the trailer ↗
            </a>
            <a className="ff-btn" href={f.imdb} target="_blank" rel="noopener noreferrer">
              IMDb page ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
