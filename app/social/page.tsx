'use client';
import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import TicketMenu from '@/components/TicketMenu';
import TrustedBlock from '@/components/TrustedBlock';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { SQB_CREATORS } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';
import { setupReveal } from '@/lib/video-utils';
import type { Creator } from '@/lib/types';

function CreatorBlock({ c }: { c: Creator }) {
  return (
    <section className={'creator' + (c.flagship ? ' flagship' : '')} data-screen-label={c.name}>
      <div className="creator-head">
        <div>
          <div className="creator-eyebrow">
            {c.flagship ? COPY.social.creatorFlagshipEyebrow : COPY.social.creatorPartnerEyebrow}
          </div>
          <h2 className="creator-name">{c.name}</h2>
          <div className="creator-subs">
            <span className="cs-count">{c.subs}</span>
            <span className="cs-label">{COPY.social.subsLabel}</span>
          </div>
          <p className="creator-blurb">{c.blurb}</p>
        </div>
        <div className="creator-counter" />
      </div>

      <div className="creator-marquee">
        <div className="creator-marquee-track">
          {[...c.videos, ...c.videos].map((vid, i) => (
            <a
              className="creator-thumb"
              key={i}
              href={`https://www.youtube.com/watch?v=${vid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`} alt="" referrerPolicy="no-referrer" />
              <div className="ct-play">▶</div>
              <div className="ct-num">{String((i % c.videos.length) + 1).padStart(2, '0')}</div>
              <div className="ct-ext">{COPY.social.watchYt}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SocialPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setupReveal(); }, []);

  return (
    <div className="page-shell">
      <Loader />
      <Topbar active="social" variant="nav" onOpenMenu={() => setMenuOpen(true)} />

      <section className="social-hero clean">
        <div className="sh-inner">
          <div className="sh-left">
            <div className="sh-eyebrow">{COPY.social.heroEyebrow}</div>
            <h1 className="sh-title">{rich(COPY.social.heroTitle)}</h1>
            <p className="sh-blurb">{COPY.social.heroBlurb}</p>
            <div className="sh-stats">
              {COPY.social.stats.map((s, i) => (
                <div key={i}><span className="n">{s.value}</span><span className="l">{s.label}</span></div>
              ))}
            </div>
          </div>
          <div className="sh-stream" aria-hidden="true">
            {[
              { c: '#FF0033', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" /></svg> },
              { c: '#E4405F', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg> },
              { c: '#0A66C2', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6V23H.2zM8 8h4.4v2.05h.06c.61-1.16 2.1-2.4 4.32-2.4 4.62 0 5.47 3.04 5.47 7v8.35h-4.6v-7.4c0-1.77-.03-4.06-2.47-4.06-2.48 0-2.86 1.94-2.86 3.94V23H8z" /></svg> },
              { c: '#F5C518', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h13v10H3z" /><path d="M16 10l5-3v10l-5-3z" /><circle cx="9.5" cy="12" r="2.5" /></svg> },
              { c: '#9999FF', svg: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3" /><text x="50%" y="56%" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1a1410" fontFamily="Arial">Pr</text></svg> },
              { c: '#CF96FD', svg: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3" /><text x="50%" y="56%" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1a1410" fontFamily="Arial">Ae</text></svg> },
              { c: '#FFA928', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg> },
            ].map((it, i) => (
              <div
                className="sh-icon"
                key={i}
                style={{ ['--d' as any]: i * 1.2 + 's', ['--c' as any]: it.c }}
              >
                <div className="sh-icon-inner">{it.svg}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {SQB_CREATORS.map((c) => (
        <CreatorBlock key={c.id} c={c} />
      ))}

      <TrustedBlock />
      <ContactSection compact />
      <Footer />

      <TicketMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
