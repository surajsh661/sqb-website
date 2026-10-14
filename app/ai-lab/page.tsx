'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import TicketMenu from '@/components/TicketMenu';
import QuoteForm from '@/components/QuoteForm';
import TrustedBlock from '@/components/TrustedBlock';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { SQB_AI_LAB, HERO_POSTERS } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import { videoSrc, thumbSources, setupReveal } from '@/lib/video-utils';
import { useThumbs } from '@/lib/useOverrides';
import type { AILabItem } from '@/lib/types';

const LAB = SQB_AI_LAB;

const PANES = [
  { key: 'micro' as const, cls: 'anim', num: '01', name: 'MICRO DRAMAS',
    desc: COPY.aiLab.paneMicro,
    // A strong portrait still (Antim Yudh's action lead) crops well into the wide panel.
    bg: LAB.microDramas.find((it) => it.id === 'md-antim-yudh') || LAB.microDramas[0], anchor: 'section-micro' },
  { key: 'real' as const, cls: 'real', num: '02', name: 'CINEMATIC',
    desc: COPY.aiLab.paneReal,
    // First Drive reel, not realistic[0]: the newest film (Dream) is ultra-wide
    // Vimeo with no still, and would play letterboxed in the panel.
    bg: LAB.realistic.find((it) => it.type === 'gd') || LAB.realistic[0], anchor: 'section-real' },
  { key: 'animvfx' as const, cls: 'vfx', num: '03', name: 'ANIMATION & VFX',
    desc: COPY.aiLab.paneAnimVfx,
    bg: LAB.animated[0], anchor: 'section-anim' },
];

// Preview (muted, background) source for the grid cards.
function bgSrc(item: AILabItem) {
  return item.type === 'gd'
    ? `https://drive.google.com/file/d/${item.videoId}/preview`
    : videoSrc(item, { bg: true });
}

// Full player source for the lightbox (with controls + sound).
function reelSrc(item: AILabItem) {
  if (item.type === 'vm')
    return `https://player.vimeo.com/video/${item.videoId}?autoplay=1&loop=1&muted=0&controls=1&dnt=1&playsinline=1&title=0&byline=0&portrait=0`;
  if (item.type === 'gd') return `https://drive.google.com/file/d/${item.videoId}/preview`;
  return `https://www.youtube.com/embed/${item.videoId}?autoplay=1&mute=0&loop=1&playlist=${item.videoId}&controls=1&modestbranding=1&rel=0&playsinline=1`;
}

function SplitTitle({ title }: { title: string }) {
  return (
    <h2>
      {title
        .toUpperCase()
        .split(' ')
        .map((w, i) => (i % 2 ? <em key={i}>{w} </em> : <span key={i}>{w} </span>))}
    </h2>
  );
}

/**
 * AI micro dramas as an endless, self-running slider. The track holds the list
 * twice and slides left by exactly one copy (-50%), so the loop is seamless.
 * Each card carries its own right margin (not a flex gap), which keeps the two
 * copies the same width and the -50% exact. It runs on transform only, so the
 * GPU composites it; hover or keyboard focus pauses it. Reduced motion: no
 * animation, the row scrolls by hand instead.
 */
function MicroDramaSlider({
  items, onOpen,
}: {
  items: AILabItem[];
  onOpen: (item: AILabItem, title: string) => void;
}) {
  const c = COPY.aiLab;
  const thumbs = useThumbs(); // custom posters set in /admin → Thumbnails
  const loop = [...items, ...items];
  return (
    <section className="ai-track-section" id="section-micro" data-screen-label="section-micro">
      <div className="ats-eyebrow">{c.microEyebrow}</div>
      <SplitTitle title={c.microTitle} />
      <p className="ats-blurb">{c.microBlurb}</p>
      <div className="md-slider">
        <div className="md-track" style={{ '--md-count': items.length } as React.CSSProperties}>
          {loop.map((it, i) => {
            const dup = i >= items.length; // second copy: visual only
            return (
              <div
                className="ai-clip vertical md-card"
                key={it.id + (dup ? '-dup' : '')}
                onClick={() => onOpen(it, c.microTitle)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(it, c.microTitle); } }}
                role={dup ? undefined : 'button'}
                tabIndex={dup ? -1 : 0}
                aria-hidden={dup ? true : undefined}
                aria-label={dup ? undefined : `Play ${it.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="ai-clip-poster"
                  src={thumbs[it.videoId] || it.poster || HERO_POSTERS[it.videoId] || thumbSources(it)[1] || thumbSources(it)[0]}
                  alt={dup ? '' : it.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  draggable={false}
                />
                <span className="ai-clip-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
                </span>
                <span className="ac-label">{it.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AISection({
  id, eyebrow, title, blurb, items, onOpen, lead,
}: {
  id: string;
  eyebrow?: string;
  /** Optional block shown between the sub-line and the reel grid. */
  lead?: ReactNode;
  title: string;
  blurb: string;
  items: AILabItem[];
  onOpen: (item: AILabItem, title: string) => void;
}) {
  const thumbs = useThumbs(); // custom posters set in /admin → Thumbnails
  return (
    <section className="ai-track-section" id={id} data-screen-label={id}>
      {eyebrow && <div className="ats-eyebrow">{eyebrow}</div>}
      <SplitTitle title={title} />
      <p className="ats-blurb">{blurb}</p>
      {lead}
      <div className="ai-track-grid">
        {items.map((it) => (
          <div
            className={'ai-clip' + (it.vertical ? ' vertical' : '')}
            key={it.id}
            onClick={() => onOpen(it, title)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(it, title); } }}
            role="button"
            tabIndex={0}
          >
            {it.vertical ? (
              // Google Drive's /preview pillarboxes portrait video, so the card
              // shows the clean 9:16 poster (fills exactly) and plays in the
              // lightbox on click.
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="ai-clip-poster" src={thumbs[it.videoId] || it.poster || HERO_POSTERS[it.videoId] || thumbSources(it)[1] || thumbSources(it)[0]} alt={it.title} referrerPolicy="no-referrer" loading="lazy" />
                <span className="ai-clip-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
                </span>
              </>
            ) : (
              <>
                {/* A custom poster shows until the clip loads over it. */}
                {thumbs[it.videoId] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ai-clip-poster" src={thumbs[it.videoId]} alt="" aria-hidden="true" referrerPolicy="no-referrer" loading="lazy" />
                )}
                <iframe
                  src={bgSrc(it)}
                  title={it.title}
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                />
              </>
            )}
            <span className="ac-label">{it.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Flagship original IP (Muthoot "Sunheri Soch") — shown INSIDE the AI Cinematic
// Films section, above its reels: the film on one side, a short summary beside it. The whole frame (and the CTA) opens the case study.
function FeaturedIP({ item, onOpen }: { item: AILabItem; onOpen: () => void }) {
  const c = COPY.aiLab;
  const poster = useThumbs()[item.videoId];
  return (
    <div className="ai-feature" id="section-featured">
      <div
        className="aif-media"
        role="button"
        tabIndex={0}
        aria-label={`${item.title} — open the full case study`}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="ai-clip-poster" src={poster} alt="" aria-hidden="true" referrerPolicy="no-referrer" loading="lazy" />
        )}
        <iframe src={bgSrc(item)} title={item.title} allow="autoplay; encrypted-media" loading="lazy" />
        <span className="aif-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
        </span>
        <span className="aif-tag">{c.featClient}</span>
      </div>

      <div className="aif-info">
        <div className="aif-eyebrow">{c.featEyebrow}</div>
        <h2 className="aif-title">{rich(c.featTitle)}</h2>
        <p className="aif-summary">{c.featSummary}</p>
        <ul className="aif-stats">
          {c.featStats.map((s) => (
            <li key={s.k}><b>{s.v}</b><span>{s.k}</span></li>
          ))}
        </ul>
        <button className="aif-cta" onClick={onOpen}>
          {c.featCta} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

export default function AILabPage() {
  const router = useRouter();
  const thumbs = useThumbs(); // custom posters set in /admin → Thumbnails
  const [hover, setHover] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  // The reel currently open in the watch-lightbox (null = closed).
  const [reel, setReel] = useState<{ item: AILabItem; section: string } | null>(null);

  const openReel = (item: AILabItem, section: string) => {
    // Flagship items (e.g. Muthoot) link to their full case study instead of a
    // sizzle lightbox — deep-link to /work, which opens the case study on load.
    if (item.caseId) { router.push(`/work?case=${item.caseId}`); return; }
    setReel({ item, section });
    document.body.style.overflow = 'hidden';
  };
  const closeReel = () => {
    setReel(null);
    document.body.style.overflow = '';
  };

  useEffect(() => { setupReveal(); }, []);

  useEffect(() => {
    if (!reel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeReel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reel]);

  const scrollTo = (anchor: string) => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page-shell">
      <Loader />
      <Topbar active="ai-lab" variant="nav" onOpenMenu={() => setMenuOpen(true)} onReachOut={() => setQuoteOpen(true)} />

      <section className="ailab-hero">
        <div className="ai-eyebrow">{COPY.aiLab.heroEyebrow}</div>
        <h1 className="ai-headline-title">{rich(COPY.aiLab.heroTitle)}</h1>
        <p className="ai-caps">
          {COPY.aiLab.heroTags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
        <p className="ai-headline-blurb">{COPY.aiLab.heroBlurb}</p>

        <div className="ai-picker">
          {PANES.map((p, i) => {
            // Prefer a static poster for the pane background — keeps all three
            // panes visually consistent and avoids a lone live-loading iframe
            // when the lead item is Vimeo (e.g. Muthoot in Realistic). Uses the
            // baked Vimeo-CDN poster for vm, the Drive thumbnail for gd.
            const poster = thumbs[p.bg.videoId] || HERO_POSTERS[p.bg.videoId] || (p.bg.type === 'gd' ? thumbSources(p.bg)[0] : null);
            return (
              <div
                key={p.key}
                className={`ai-pane ${p.cls} ${i === hover ? 'expand' : 'shrink'}`}
                onMouseEnter={() => setHover(i)}
                onClick={() => scrollTo(p.anchor)}
              >
                <div className="ap-bg">
                  {poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={poster}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <iframe src={bgSrc(p.bg)} title={p.name} allow="autoplay; encrypted-media" />
                  )}
                </div>
                <div className="ap-tint" />
                <div className="ap-content">
                  <div className="ap-num">{p.num} · {p.name}</div>
                  <div className="ap-name">{p.name}</div>
                  <div className="ap-desc">{p.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI micro dramas lead the page (the strongest search opportunity), as
          their own self-running slider, apart from the reel sections below. */}
      <MicroDramaSlider items={LAB.microDramas} onOpen={openReel} />

      <AISection
        id="section-real"
        lead={<FeaturedIP item={LAB.featured} onOpen={() => openReel(LAB.featured, 'Featured IP')} />}
        title={COPY.aiLab.realTitle}
        items={LAB.realistic}
        blurb={COPY.aiLab.realBlurb}
        onOpen={openReel}
      />
      {/* Animation and VFX share one section: the animated reels, then the VFX
          reels (#section-anim CSS sizes the VFX row by position). */}
      <AISection
        id="section-anim"
        title={COPY.aiLab.animVfxTitle}
        items={[...LAB.animated, ...LAB.vfx]}
        blurb={COPY.aiLab.animVfxBlurb}
        onOpen={openReel}
      />

      <TrustedBlock />
      <ContactSection compact />
      <Footer />

      <TicketMenu open={menuOpen} onClose={() => setMenuOpen(false)} onReachOut={() => setQuoteOpen(true)} />
      <QuoteForm open={quoteOpen} onClose={() => setQuoteOpen(false)} />

      {/* Watch-lightbox — fits the clip to the viewport (no cropping) and adapts
          to the clip's orientation. Portalled to <body> so no ancestor scroll
          transform can clip it. */}
      {reel && typeof document !== 'undefined' &&
        createPortal(
          <div className="vmodal" onClick={closeReel}>
            <div
              className={'reel-card ' + (reel.item.vertical ? 'v' : 'h')}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                key={reel.item.id}
                src={reelSrc(reel.item)}
                title={reel.item.title}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
              <div className="vmodal-meta">
                <span className="tag">{reel.section}</span>
                <span className="ttl">{reel.item.title}</span>
              </div>
              <button className="vmodal-close" aria-label="Close" onClick={closeReel}>×</button>
            </div>
            <div className="vmodal-hint">{COPY.common.vmodalHint}</div>
          </div>,
          document.body,
        )}
    </div>
  );
}
