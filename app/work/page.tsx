'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import TicketMenu from '@/components/TicketMenu';
import QuoteForm from '@/components/QuoteForm';
import CaseStudy from '@/components/CaseStudy';
import FilmCard from '@/components/FilmCard';
import HeroThumb from '@/components/HeroThumb';
import WorkBarrels from '@/components/WorkBarrels';
import TrustedBlock from '@/components/TrustedBlock';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import CountUp from '@/components/CountUp';
import { IconX } from '@/components/Icons';
import {
  SQB_FILMS, SQB_GENRES, SQB_FEATURED_DEFAULT, SQB_COCOON,
} from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import { setupReveal, videoSrc } from '@/lib/video-utils';
import type { Film, Genre } from '@/lib/types';

// Capability-card icons — Suraj's gold 3D set, sliced from the provided sheet
// into /public/cap/*.png. Order matches COPY.work.capabilities.
const CAP_ICONS: string[] = [
  '/cap/cap-clapboard.png',  // Ad Films & TVCs
  '/cap/cap-trex.png',       // CGI / VFX & 3D
  '/cap/cap-sparkles.png',   // AI Film Production
  '/cap/cap-phone.png',      // Short-Form Digital
  '/cap/cap-rocket.png',     // Launch & Explainers
  '/cap/cap-reelmic.png',    // Documentary & Long-Form
];

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
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);
  const [caseOpen, setCaseOpen] = useState(false);
  const [vertPick, setVertPick] = useState<Film | null>(null);

  // Lazy-mount the Vertical Cinema ticket videos only when the section nears the
  // viewport — autoplaying all 15 iframes on first paint would flood the network
  // (same problem the home page had). Mount once it's approached.
  const vcRef = useRef<HTMLElement | null>(null);
  const [vcMounted, setVcMounted] = useState(false);
  useEffect(() => {
    const el = vcRef.current;
    if (!el) return;
    let done = false;
    const arm = () => { if (done) return; done = true; setVcMounted(true); io.disconnect(); window.removeEventListener('scroll', onScroll); };
    const check = () => { if (el.getBoundingClientRect().top < window.innerHeight + 600) arm(); };
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) arm(); }, { rootMargin: '600px 0px' });
    io.observe(el);
    const onScroll = check;
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

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
    // Preserve Next's internal history state (passing {} clobbers it and breaks
    // the browser Back button). Only update the visible URL.
    window.history.replaceState(window.history.state, '', url.toString());
    setShowAll(filter !== 'all');
    setupReveal();
  }, [filter]);

  useEffect(() => { setupReveal(); }, [displayed]);
  useEffect(() => { setupReveal(); }, []);

  // A capability card → filter the films grid to that genre and scroll to it.
  const goToFilms = (genre: Genre) => {
    setFilter(genre);
    setTimeout(() => document.getElementById('work-films')?.scrollIntoView({ behavior: 'smooth' }), 70);
  };

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

  // Deep-link: /work?case=<filmId> opens that case study on load. Used by the
  // AI Lab Muthoot clip and makes every case study a shareable URL. We set the
  // film synchronously then flip `open` after the first render commits, so the
  // slide-in transition plays reliably (and it survives StrictMode's dev
  // double-mount via the timeout cleanup).
  useEffect(() => {
    const id = searchParams.get('case');
    if (!id) return;
    const film = SQB_FILMS.find((f) => f.id === id);
    if (!film) return;
    setActiveFilm(film);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => setCaseOpen(true), 80);
    return () => clearTimeout(t);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-shell">
      <Topbar active="work" variant="nav" onOpenMenu={() => setMenuOpen(true)} onReachOut={() => setQuoteOpen(true)} />

      <section className="work-vision">
        <div className="wv-inner">
          <h1 className="wv-title">{rich(COPY.work.visionTitle)}</h1>
          <p className="wv-blurb">{COPY.work.visionBlurb}</p>
          <a
            className="wv-cta"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {COPY.work.visionCta} <span>→</span>
          </a>
        </div>
      </section>

      <section className="work-cap">
        <h2 className="wc-title">{rich(COPY.work.capTitle)}</h2>
        <div className="wc-grid">
          {COPY.work.capabilities.map((cap, i) => {
            const inner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="wc-icon"><img src={CAP_ICONS[i]} alt={cap.name} loading="lazy" /></div>
                <div className="wc-name">{cap.name}</div>
                <div className="wc-desc">{cap.desc}</div>
              </>
            );
            // i: 0 Ad Films · 1 CGI/VFX · 2 AI Film · 3 Short-Form · 4 Launch · 5 Documentary
            if (i === 1) // CGI / VFX & 3D → the VFX section of the AI Lab
              return <a className="wc-cell wc-cell-link" key={i} href="/ai-lab#section-vfx">{inner}</a>;
            if (i === 2) // AI Film Production → the AI Lab page
              return <a className="wc-cell wc-cell-link" key={i} href="/ai-lab">{inner}</a>;
            if (i === 5) // Documentary & Long-Form → filter the films grid to Documentary
              return (
                <div
                  className="wc-cell wc-cell-link" key={i}
                  role="button" tabIndex={0}
                  onClick={() => goToFilms('docu')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToFilms('docu'); } }}
                >{inner}</div>
              );
            return <div className="wc-cell" key={i}>{inner}</div>;
          })}
        </div>
      </section>

      <section className="work-scale">
        <div className="ws-left">
          <div className="ws-num"><CountUp from={150} to={500} suffix="+" /></div>
          <h2 className="ws-title">{rich(COPY.work.scaleTitle)}</h2>
          <p className="ws-sub">{COPY.work.scaleSub}</p>
          <p className="ws-fine">{COPY.work.scaleFine}</p>
        </div>
        <WorkBarrels films={SQB_FILMS} />
      </section>

      <section className="work-films" id="work-films">
        <div className="wf-head">
          <div>
            <h2 className="wf-title">{rich(COPY.work.filmsTitle)}</h2>
            <div className="wf-sub">{COPY.work.filmsSub}</div>
            <p className="wf-blurb">{COPY.work.filmsBlurb}</p>
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
              {COPY.work.viewMore} <span>→</span>
            </button>
          </div>
        )}
      </section>

      {SQB_COCOON && (
        <section className="cocoon" data-screen-label="Cocoon">
          <div className="cocoon-eyebrow">{COPY.work.cocoonEyebrow}</div>
          <div className="cocoon-head">
            <div>
              <h2 className="cocoon-title">COCOON</h2>
              <p className="cocoon-tagline">{SQB_COCOON.tagline}</p>
              <p className="cocoon-blurb">{SQB_COCOON.blurb}</p>
              <div className="cocoon-actions">
                <a className="cocoon-btn primary" href={SQB_COCOON.watch} target="_blank" rel="noopener">
                  {COPY.work.cocoonWatchPrefix} {SQB_COCOON.platform} ↗
                </a>
                <a className="cocoon-btn" href={SQB_COCOON.imdb} target="_blank" rel="noopener">
                  {COPY.work.cocoonImdb}
                </a>
              </div>
            </div>
            <div className="cocoon-rating">
              <div className="cr-star">★</div>
              <div className="cr-num">{SQB_COCOON.rating}</div>
              <div className="cr-source">{SQB_COCOON.ratingSource} {COPY.work.cocoonRatingSuffix}</div>
            </div>
          </div>
          <div className="cocoon-music">
            <div className="cm-label">{COPY.work.cocoonMusicLabel}</div>
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

      <section className="vc" ref={vcRef}>
        <div className="vc-inner">
          <div className="vc-head-row">
            <div>
              <div className="vc-eyebrow">{COPY.work.vcEyebrow}</div>
              <h2 className="vc-title">{rich(COPY.work.vcTitle)}</h2>
              <p className="vc-blurb">{COPY.work.vcBlurb}</p>
            </div>
            <div className="vc-tally">
              <span className="vc-tally-num">{String(verticals.length).padStart(2, '0')}</span>
              <span className="vc-tally-label">{COPY.work.vcTallyLabel}</span>
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
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVertPick(f); } }}
                role="button"
                tabIndex={0}
              >
                <div className="vt-art">
                  {/* Autoplay the muted vertical clip (like the home cards). A
                      poster thumbnail shows until the section is mounted. The
                      iframe is 9:16 so it fills the portrait card with no crop. */}
                  <HeroThumb film={f} className="vt-blur" />
                  {vcMounted ? (
                    <iframe
                      className="vt-video"
                      src={videoSrc({ type: f.type, videoId: f.videoId }, { bg: true })}
                      title={f.title}
                      allow="autoplay; encrypted-media"
                      loading="lazy"
                      tabIndex={-1}
                    />
                  ) : (
                    <HeroThumb film={f} />
                  )}
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
      <TicketMenu open={menuOpen} onClose={() => setMenuOpen(false)} onReachOut={() => setQuoteOpen(true)} />
      <QuoteForm open={quoteOpen} onClose={() => setQuoteOpen(false)} />

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
            <button className="vmodal-close" aria-label="Close" onClick={() => setVertPick(null)}><IconX size={16} /></button>
          </div>
          <div className="vmodal-hint">{COPY.common.vmodalHint}</div>
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
