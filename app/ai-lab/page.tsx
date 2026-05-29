'use client';
import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import TicketMenu from '@/components/TicketMenu';
import CaseStudy from '@/components/CaseStudy';
import HeroThumb from '@/components/HeroThumb';
import TrustedBlock from '@/components/TrustedBlock';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { SQB_AI_LAB, SQB_FILMS } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import { videoSrc, thumbSources, setupReveal } from '@/lib/video-utils';
import type { AILabItem, Film } from '@/lib/types';

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

function bgSrc(item: AILabItem) {
  return item.type === 'gd'
    ? `https://drive.google.com/file/d/${item.videoId}/preview`
    : videoSrc(item, { bg: true });
}

function fakeFilmFromAI(item: AILabItem, sectionTitle: string): Film {
  return {
    id: item.id,
    title: item.title,
    category: sectionTitle + ' / AI LAB',
    year: '2026',
    runtime: '—',
    genres: ['ai'],
    type: item.type,
    videoId: item.videoId,
    client: "S'QB Labs",
    talent: 'Generative ensemble',
    lede: 'A reel from the ' + sectionTitle.toLowerCase() + " track of S'QB AI Labs.",
    body: "Built end-to-end inside our AI pipeline. Direction, shot design, grading and sound staged the way we'd stage a shoot.",
    impact: 'Spec',
    credits: [
      { role: 'AI SUPERVISOR', name: "S'QB LABS" },
      { role: 'DIRECTOR', name: "S'QB" },
    ],
  };
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
            className={'ai-clip' + (it.id === 'r4' ? ' vertical' : '')}
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
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);
  const [caseOpen, setCaseOpen] = useState(false);

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
  const switchCase = (f: Film) => {
    closeCase();
    setTimeout(() => openCase(f), 400);
  };

  const onOpen = (it: AILabItem, sectionTitle: string) => {
    openCase(fakeFilmFromAI(it, sectionTitle));
  };

  useEffect(() => { setupReveal(); }, []);

  const scrollTo = (anchor: string) => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page-shell">
      <Loader />
      <Topbar active="ai-lab" variant="nav" onOpenMenu={() => setMenuOpen(true)} />

      <section className="ailab-hero">
        <div className="ai-eyebrow">{COPY.aiLab.heroEyebrow}</div>
        <h1 className="ai-headline-title">{rich(COPY.aiLab.heroTitle)}</h1>
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
        onOpen={onOpen}
      />
      <AISection
        id="section-real"
        title={COPY.aiLab.realTitle}
        items={LAB.realistic}
        blurb={COPY.aiLab.realBlurb}
        onOpen={onOpen}
      />
      <AISection
        id="section-vfx"
        title={COPY.aiLab.vfxTitle}
        items={LAB.vfx}
        blurb={COPY.aiLab.vfxBlurb}
        onOpen={onOpen}
      />

      <TrustedBlock />
      <ContactSection compact />
      <Footer />

      <CaseStudy film={activeFilm} films={SQB_FILMS} open={caseOpen} onClose={closeCase} onPick={switchCase} />
      <TicketMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
