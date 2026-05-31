'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import TicketMenu from '@/components/TicketMenu';
import QuoteForm from '@/components/QuoteForm';
import TrustedBlock from '@/components/TrustedBlock';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { SQB_AI_LAB } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import { videoSrc, thumbSources, setupReveal } from '@/lib/video-utils';
import type { AILabItem } from '@/lib/types';

const LAB = SQB_AI_LAB;

const PANES = [
  { key: 'anim' as const, cls: 'anim', num: '01', name: 'ANIMATED',
    desc: COPY.aiLab.paneAnim,
    bg: LAB.animated[0], anchor: 'section-anim' },
  { key: 'real' as const, cls: 'real', num: '02', name: 'REALISTIC',
    desc: COPY.aiLab.paneReal,
    bg: LAB.realistic[0], anchor: 'section-real' },
  { key: 'vfx' as const, cls: 'vfx', num: '03', name: 'VFX',
    desc: COPY.aiLab.paneVfx,
    bg: LAB.vfx[0], anchor: 'section-vfx' },
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

function AISection({
  id, title, blurb, items, onOpen,
}: {
  id: string;
  title: string;
  blurb: string;
  items: AILabItem[];
  onOpen: (item: AILabItem, title: string) => void;
}) {
  return (
    <section className="ai-track-section" id={id} data-screen-label={id}>
      <h2>
        {title
          .toUpperCase()
          .split(' ')
          .map((w, i) => (i % 2 ? <em key={i}>{w} </em> : <span key={i}>{w} </span>))}
      </h2>
      <p className="ats-blurb">{blurb}</p>
      <div className="ai-track-grid">
        {items.map((it) => (
          <div
            className={'ai-clip' + (it.vertical ? ' vertical' : '')}
            key={it.id}
            onClick={() => onOpen(it, title)}
            role="button"
            tabIndex={0}
          >
            <iframe
              src={bgSrc(it)}
              title={it.title}
              allow="autoplay; encrypted-media"
              loading="lazy"
            />
            <span className="ac-label">{it.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AILabPage() {
  const [hover, setHover] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  // The reel currently open in the watch-lightbox (null = closed).
  const [reel, setReel] = useState<{ item: AILabItem; section: string } | null>(null);

  const openReel = (item: AILabItem, section: string) => {
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
        <div className="ai-tags">
          {COPY.aiLab.heroTags.map((t) => (
            <span className="ai-tag" key={t}>{t}</span>
          ))}
        </div>
        <p className="ai-headline-blurb">{COPY.aiLab.heroBlurb}</p>

        <div className="ai-picker">
          {PANES.map((p, i) => {
            const isDrive = p.bg.type === 'gd';
            return (
              <div
                key={p.key}
                className={`ai-pane ${p.cls} ${i === hover ? 'expand' : 'shrink'}`}
                onMouseEnter={() => setHover(i)}
                onClick={() => scrollTo(p.anchor)}
              >
                <div className="ap-bg">
                  {isDrive ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbSources(p.bg)[0]}
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

      <AISection
        id="section-anim"
        title={COPY.aiLab.animTitle}
        items={LAB.animated}
        blurb={COPY.aiLab.animBlurb}
        onOpen={openReel}
      />
      <AISection
        id="section-real"
        title={COPY.aiLab.realTitle}
        items={LAB.realistic}
        blurb={COPY.aiLab.realBlurb}
        onOpen={openReel}
      />
      <AISection
        id="section-vfx"
        title={COPY.aiLab.vfxTitle}
        items={LAB.vfx}
        blurb={COPY.aiLab.vfxBlurb}
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
