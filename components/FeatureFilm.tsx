'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SQB_FEATURE } from '@/lib/data';

/**
 * The theatrical feature band.
 *
 * Leads with the actual one-sheet rather than a wide banner — a portrait
 * poster reads as "a film" instantly, and it's the strongest artwork we have.
 * The trailer opens in a lightbox instead of swapping into the card: a YouTube
 * iframe inlined at card size drags its whole chrome (channel strip, controls,
 * watch-later, logo) into the layout and cheapens it.
 *
 * `compact` (home page) drops the synopsis and spec line.
 */
export default function FeatureFilm({ compact = false }: { compact?: boolean }) {
  const f = SQB_FEATURE;
  const [open, setOpen] = useState(false);

  // Escape to close + lock the page behind the lightbox.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const spec = ['Theatrical feature', f.runtime, f.language, f.genre, `Dir. ${f.director}`];

  return (
    <section className={'ff' + (compact ? ' ff-compact' : '')} data-screen-label="Theatrical Feature">
      <div className="ff-inner">
        {/* ── the one-sheet ── */}
        <button
          type="button"
          className="ff-poster"
          onClick={() => setOpen(true)}
          aria-label={`Play the ${f.title} official trailer`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.poster} alt={`${f.title} — ${f.subtitle} theatrical poster`} />
          <span className="ff-poster-veil" aria-hidden="true" />
          <span className="ff-poster-play" aria-hidden="true">
            <span className="ff-poster-tri" />
            TRAILER
          </span>
        </button>

        {/* ── the copy ── */}
        <div className="ff-copy">
          <div className="ff-eyebrow">
            <span className="ff-dot" />
            {f.status}
          </div>

          <h2 className="ff-title">{f.title}</h2>
          {f.subtitle && <div className="ff-sub">{f.subtitle}</div>}

          <div className="ff-rule" aria-hidden="true" />

          <p className="ff-credit">{f.credit}</p>
          <p className="ff-studios">{f.studios}</p>

          <p className="ff-lede">{f.lede}</p>
          {!compact && <p className="ff-body">{f.body}</p>}

          {!compact && (
            <ul className="ff-spec">
              {spec.map((s) => <li key={s}>{s}</li>)}
            </ul>
          )}

          <div className="ff-actions">
            <button type="button" className="ff-btn primary" onClick={() => setOpen(true)}>
              Watch the trailer
            </button>
            <a className="ff-btn" href={f.imdb} target="_blank" rel="noopener noreferrer">
              IMDb page ↗
            </a>
          </div>
        </div>
      </div>

      {/* ── trailer lightbox ── */}
      {open && typeof document !== 'undefined' && createPortal(
        <div className="ff-lb" role="dialog" aria-modal="true" aria-label={`${f.title} trailer`} onClick={() => setOpen(false)}>
          <button type="button" className="ff-lb-x" onClick={() => setOpen(false)} aria-label="Close trailer">×</button>
          <div className="ff-lb-frame" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${f.trailerId}?autoplay=1&rel=0&modestbranding=1`}
              title={`${f.title} — official trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
