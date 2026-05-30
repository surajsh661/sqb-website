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
              // YouTube
              { c: '#FF0033', svg: <svg viewBox="0 0 24 24"><rect x="2" y="5.6" width="20" height="12.8" rx="4" fill="#FF0033" /><path d="M10 9.3v5.4l4.8-2.7z" fill="#fff" /></svg> },
              // Instagram (gradient)
              { c: '#E4405F', svg: <svg viewBox="0 0 24 24"><defs><linearGradient id="igG" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FEDA75" /><stop offset="0.45" stopColor="#FA7E1E" /><stop offset="0.7" stopColor="#D62976" /><stop offset="1" stopColor="#962FBF" /></linearGradient></defs><rect x="3" y="3" width="18" height="18" rx="5.4" fill="none" stroke="url(#igG)" strokeWidth="2.1" /><circle cx="12" cy="12" r="4.1" fill="none" stroke="url(#igG)" strokeWidth="2.1" /><circle cx="17.2" cy="6.8" r="1.2" fill="url(#igG)" /></svg> },
              // Premiere Pro (tool)
              { c: '#9a55ff', svg: <svg viewBox="0 0 24 24"><text x="12" y="16.6" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="11.5" fill="#E48BFF" letterSpacing="-0.4">Pr</text></svg> },
              // After Effects (tool)
              { c: '#7d5cff', svg: <svg viewBox="0 0 24 24"><text x="12" y="16.6" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="11.5" fill="#AC9BFF" letterSpacing="-0.4">Ae</text></svg> },
              // Music / sound design
              { c: '#FF4E8A', svg: <svg viewBox="0 0 24 24"><path d="M9 16.8V6.4l9-1.7v9.1" fill="none" stroke="#FF6FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><ellipse cx="6.6" cy="16.9" rx="2.7" ry="2.4" fill="#FF6FA3" /><ellipse cx="15.6" cy="15.1" rx="2.7" ry="2.4" fill="#FF6FA3" /></svg> },
              // X / Twitter (platform)
              { c: '#9bb8d3', svg: <svg viewBox="0 0 24 24"><path d="M3 3h3.7l5 6.8L17.4 3H21l-6.9 8.3L21.5 21h-3.7l-5.3-7.2L6.4 21H3l7.3-8.7z" fill="#fff" /></svg> },
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
