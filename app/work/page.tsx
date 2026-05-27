'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import TicketMenu from '@/components/TicketMenu';
import CaseStudy from '@/components/CaseStudy';
import FilmCard from '@/components/FilmCard';
import HeroThumb from '@/components/HeroThumb';
import WorkBarrels from '@/components/WorkBarrels';
import TrustedBlock from '@/components/TrustedBlock';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import CountUp from '@/components/CountUp';
import {
  SQB_FILMS, SQB_GENRES, SQB_FEATURED_DEFAULT, SQB_COCOON,
} from '@/lib/data';
import { setupReveal, videoSrc } from '@/lib/video-utils';
import type { Film, Genre } from '@/lib/types';

function WorkInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = useMemo<Genre>(() => {
    const f = searchParams.get('filter');
    const valid = new Set(SQB_GENRES.map((g) => g.key));
    return (f && valid.has(f as Genre)) ? (f as Genre) : 'all';
  }, [searchParams]);

  const [filter, setFilter] = useState<Genre>(initialFilter);
  const [showAll, setShowAll] = useState(initialFilter !== 'all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);
  const [caseOpen, setCaseOpen] = useState(false);
  const [vertPick, setVertPick] = useState<Film | null>(null);

  const featured = useMemo<string[]>(() => SQB_FEATURED_DEFAULT, []);

  const filtered = useMemo<Film[]>(() => {
    const horizontal = SQB_FILMS.filter((f) => !(f.genres || []).includes('vertical'));
    if (filter === 'all') return horizontal;
    return horizontal.filter((f) => (f.genres || []).includes(filter));
  }, [filter]);

  const verticals = useMemo<Film[]>(
    () => SQB_FILMS.filter((f) => (f.genres || []).includes('vertical')),
    [],
  );

  const displayed = useMemo<Film[]>(() => {
    if (filter !== 'all' || showAll) return filtered;
    const byId = new Map(SQB_FILMS.map((f) => [f.id, f] as const));
    const horizontal = (id: string) => {
      const f = byId.get(id);
      return f && !(f.genres || []).includes('vertical') ? f : null;
    };
    const six = featured.map(horizontal).filter(Boolean) as Film[];
    if (six.length < 6) {
      for (const f of SQB_FILMS) {
        if (six.length >= 6) break;
        if ((f.genres || []).includes('vertical')) continue;
        if (!six.find((x) => x.id === f.id)) six.push(f);
      }
    }
    return six.slice(0, 6);
  }, [filter, filtered, featured, showAll]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (filter === 'all') url.searchParams.delete('filter');
    else url.searchParams.set('filter', filter);
    window.history.replaceState({}, '', url.toString());
    setShowAll(filter !== 'all');
    setupReveal();
  }, [filter]);

  useEffect(() => { setupReveal(); }, [displayed]);
  useEffect(() => { setupReveal(); }, []);

  const openCase = (film: Film) => {
    setActiveFilm(film);
    requestAnimationFrame(() => setCaseOpen(true));
    document.body.style.overflow = 'hidden';
  };
  const closeCase = () => {
    setCaseOpen(false);
    document.body.style.overflow = '';
    setTimeout(() => setActiveFilm(null), 800);
  };
  const switchCase = (film: Film) => {
    setCaseOpen(false);
    setTimeout(() => {
      setActiveFilm(film);
      window.scrollTo({ top: 0, behavior: 'auto' });
      requestAnimationFrame(() => setCaseOpen(true));
    }, 400);
  };

  return (
    <div className="page-shell">
      <Topbar active="work" variant="nav" onOpenMenu={() => setMenuOpen(true)} />

      <section className="work-vision">
        <div className="wv-inner">
          <div className="wv-eyebrow">THE CONTENT STUDIO</div>
          <h1 className="wv-title">BUILT FOR <em>THE FUTURE</em></h1>
          <p className="wv-blurb">
            Whether you&apos;re starting with a vague idea or a fully fleshed-out concept, S&apos;QB
            can bring your vision to life. We deliver high-fidelity, high-volume video content
            across every format imaginable — from cinematic AI films to camera-shot TVCs, vertical
            micro-dramas to long-form documentary.
          </p>
          <a
            className="wv-cta"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            START PROJECT <span>→</span>
          </a>
        </div>
      </section>

      <section className="work-cap">
        <h2 className="wc-title">OUR <em>PRODUCTION</em> CAPABILITIES</h2>
        <div className="wc-grid">
          {[
            ['Ad Films & TVCs', 'Full cinematic script-to-screen production.',
              <svg key="a" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="1.5" /><path d="M3 10h18" /><path d="M7 6l-2-3" /><path d="M11 6l-2-3" /><path d="M15 6l-2-3" /><path d="M19 6l-2-3" /></svg>],
            ['CGI / VFX & 3D', 'Complex visual effects and motion graphics.',
              <svg key="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5L12 12l8-4.5" /><path d="M12 12v9" /></svg>],
            ['AI Film Production', 'Rapid content generation and versioning.',
              <svg key="c" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" /><path d="M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z" /></svg>],
            ['Short-Form Digital', 'Platform-native content for viral reach.',
              <svg key="d" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /><path d="M10 6h4" /></svg>],
            ['Launch & Explainers', 'Clear, engaging product value demonstration.',
              <svg key="e" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H5s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v4s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>],
            ['Documentary & Long-Form', 'Building brand affinity through narrative.',
              <svg key="f" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="11" r="6" /><circle cx="9" cy="11" r="2" /><rect x="14.5" y="8" width="6.5" height="6" rx="1" /></svg>],
          ].map(([t, d, icon], i) => (
            <div className="wc-cell" key={i}>
              <div className="wc-icon">{icon as React.ReactNode}</div>
              <div className="wc-name">{t as string}</div>
              <div className="wc-desc">{d as string}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="work-scale">
        <div className="ws-left">
          <div className="ws-num"><CountUp from={150} to={500} suffix="+" /></div>
          <h2 className="ws-title">MINUTES / <em>MONTH</em></h2>
          <p className="ws-sub">The scale and speed required to win the attention economy.</p>
          <p className="ws-fine">
            Short-form digital, animated explainers, launch videos, high-fidelity commercial spots —
            delivered every month for India&apos;s biggest brands.
          </p>
        </div>
        <WorkBarrels films={SQB_FILMS} />
      </section>

      <section className="work-films">
        <div className="wf-head">
          <div>
            <h2 className="wf-title">OUR <em>FILMS</em></h2>
            <div className="wf-sub">A LIBRARY OF 1000+ PROJECTS</div>
            <p className="wf-blurb">A sample of our best work across advertising, AI, music videos, vertical, and digital shorts.</p>
          </div>
          <div className="wf-filters">
            {SQB_GENRES.map((g) => (
              <button
                key={g.key}
                className={'wf-chip' + (filter === g.key ? ' active' : '')}
                onClick={() => setFilter(g.key)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="wf-grid">
          {displayed.map((f, i) => (
            <div key={f.id} className="wf-cell" style={{ animationDelay: Math.max(0, i - 6) * 140 + 'ms' }}>
              <FilmCard film={f} onClick={openCase} />
            </div>
          ))}
        </div>
        {filter === 'all' && !showAll && filtered.length > 6 && (
          <div className={'wf-more' + (showAll ? ' gone' : '')}>
            <button className="wf-more-btn" onClick={() => setShowAll(true)}>
              VIEW MORE <span>→</span>
            </button>
          </div>
        )}
      </section>

      {SQB_COCOON && (
        <section className="cocoon" data-screen-label="Cocoon">
          <div className="cocoon-eyebrow">FLAGSHIP IP · WEB SERIES</div>
          <div className="cocoon-head">
            <div>
              <h2 className="cocoon-title">COCOON</h2>
              <p className="cocoon-tagline">{SQB_COCOON.tagline}</p>
              <p className="cocoon-blurb">{SQB_COCOON.blurb}</p>
              <div className="cocoon-actions">
                <a className="cocoon-btn primary" href={SQB_COCOON.watch} target="_blank" rel="noopener">
                  WATCH ON {SQB_COCOON.platform} ↗
                </a>
                <a className="cocoon-btn" href={SQB_COCOON.imdb} target="_blank" rel="noopener">
                  IMDb PAGE ↗
                </a>
              </div>
            </div>
            <div className="cocoon-rating">
              <div className="cr-star">★</div>
              <div className="cr-num">{SQB_COCOON.rating}</div>
              <div className="cr-source">{SQB_COCOON.ratingSource} RATING</div>
            </div>
          </div>
          <div className="cocoon-music">
            <div className="cm-label">MUSIC FROM THE SHOW</div>
            <div className="cm-grid">
              {SQB_COCOON.music.map((m) => (
                <div className="cm-card" key={m.id}>
                  <iframe
                    src={videoSrc({ type: m.type, videoId: m.videoId }, { bg: true })}
                    title={m.title}
                    allow="autoplay; encrypted-media"
                    loading="lazy"
                  />
                  <div className="cm-meta">
                    <div className="cm-role">{m.role}</div>
                    <div className="cm-title">{m.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="vc">
        <div className="vc-inner">
          <div className="vc-head-row">
            <div>
              <div className="vc-eyebrow">9:16 · BUILT FOR PHONES</div>
              <h2 className="vc-title">VERTICAL <em>CINEMA</em></h2>
              <p className="vc-blurb">
                Phone-shaped storytelling that respects the medium. Serialized hooks, action that
                lands in three seconds, drama framed for the thumb.
              </p>
            </div>
            <div className="vc-tally">
              <span className="vc-tally-num">{String(verticals.length).padStart(2, '0')}</span>
              <span className="vc-tally-label">VERTICAL FILMS</span>
            </div>
          </div>
        </div>
        <div className="vc-marquee">
          <div className="vc-marquee-track">
            {[...verticals, ...verticals, ...verticals].map((f, i) => (
              <div
                className={'vc-ticket' + (i % 2 === 0 ? ' amber' : ' cream')}
                key={f.id + '-' + i}
                onClick={() => setVertPick(f)}
                role="button"
                tabIndex={0}
              >
                <div className="vt-art">
                  <HeroThumb film={f} />
                  <div className="vt-dot top" />
                  <div className="vt-dot bot" />
                </div>
                <div className="vt-numrow">
                  <span>{String((i % verticals.length) + 1).padStart(2, '0')}</span>
                  <span className="vt-rule" />
                  <span>{f.year}</span>
                </div>
                <div className="vt-title">{f.title}</div>
                <div className="vt-perf" />
                <div className="vt-foot">
                  <span className="vt-dotmark">●</span>
                  <span className="vt-foot-label">TICKET</span>
                  <span className="vt-barcode">
                    {Array.from({ length: 18 }).map((_, k) => (
                      <span key={k} style={{ width: (k % 3 === 0 ? 3 : k % 5 === 0 ? 2 : 1) + 'px' }} />
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustedBlock />
      <ContactSection compact />
      <Footer />

      <CaseStudy film={activeFilm} films={SQB_FILMS} open={caseOpen} onClose={closeCase} onPick={switchCase} />
      <TicketMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {vertPick && (
        <div
          className="vmodal"
          onClick={() => setVertPick(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
        >
          <div className="vmodal-card" onClick={(e) => e.stopPropagation()}>
            <iframe
              key={vertPick.id}
              src={
                vertPick.type === 'gd'
                  ? `https://drive.google.com/file/d/${vertPick.videoId}/preview`
                  : vertPick.type === 'yt'
                  ? `https://www.youtube.com/embed/${vertPick.videoId}?autoplay=1&mute=0&loop=1&playlist=${vertPick.videoId}&controls=1&rel=0&playsinline=1`
                  : `https://player.vimeo.com/video/${vertPick.videoId}?autoplay=1&loop=1&muted=0&controls=1&dnt=1&playsinline=1&title=0&byline=0&portrait=0`
              }
              title={vertPick.title}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
            <div className="vmodal-meta">
              <span className="tag">{vertPick.category}</span>
              <span className="ttl">{vertPick.title}</span>
            </div>
            <button className="vmodal-close" onClick={() => setVertPick(null)}>×</button>
          </div>
          <div className="vmodal-hint">CLICK OUTSIDE OR ESC TO CLOSE</div>
        </div>
      )}
    </div>
  );
}

export default function WorkPage() {
  return (
    <>
      <Loader />
      <Suspense fallback={null}>
        <WorkInner />
      </Suspense>
    </>
  );
}
