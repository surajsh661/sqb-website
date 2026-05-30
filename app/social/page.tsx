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
              // X / Twitter
              { c: '#9bb8d3', svg: <svg viewBox="0 0 24 24"><path d="M3 3h3.7l5 6.8L17.4 3H21l-6.9 8.3L21.5 21h-3.7l-5.3-7.2L6.4 21H3l7.3-8.7z" fill="#fff" /></svg> },
              // Spotify
              { c: '#1DB954', svg: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6" fill="#1DB954" /><path d="M7.4 10.3c3.1-.8 6.4-.5 9 1.1M8 13c2.4-.6 5-.4 7.1.9M8.5 15.4c1.9-.5 3.9-.3 5.5.7" fill="none" stroke="#06351b" strokeWidth="1.25" strokeLinecap="round" /></svg> },
              // Facebook
              { c: '#1877F2', svg: <svg viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#1877F2" /><path d="M14.3 21v-7h2.1l.4-2.7h-2.5V9.5c0-.78.27-1.3 1.4-1.3h1.2V5.8c-.55-.07-1.27-.15-2.1-.15-2.13 0-3.5 1.3-3.5 3.66v2H9v2.7h2.2V21z" fill="#fff" /></svg> },
              // LinkedIn
              { c: '#0A66C2', svg: <svg viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="4.4" fill="#0A66C2" /><path d="M7 9.6h2V17H7zM8 8.3a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3zM10.6 9.6h1.9v1.02h.03c.27-.5.93-1.03 1.92-1.03 2.05 0 2.43 1.35 2.43 3.1V17h-2v-2.97c0-.71-.01-1.62-.99-1.62-.99 0-1.14.77-1.14 1.57V17h-2z" fill="#fff" /></svg> },
              // Pinterest
              { c: '#E60023', svg: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.6" fill="#E60023" /><path d="M12.3 6.4c-3.1 0-4.8 2-4.8 4.1 0 1 .4 2 1.4 2.4.15.06.24 0 .28-.16l.16-.65c.04-.15.02-.2-.08-.33-.3-.36-.48-.83-.48-1.5 0-1.9 1.43-3.6 3.72-3.6 2.03 0 3.14 1.24 3.14 2.9 0 2.18-.96 4.02-2.4 4.02-.79 0-1.38-.65-1.19-1.46.23-.96.67-2 .67-2.7 0-.62-.33-1.14-1.02-1.14-.81 0-1.46.84-1.46 1.96 0 .72.24 1.2.24 1.2l-.97 4.13c-.29 1.22-.04 2.71-.02 2.86.01.09.13.11.18.04.08-.1 1.07-1.59 1.4-2.44l.54-2.12c.27.5 1.04.95 1.86.95 2.45 0 4.11-2.23 4.11-5.22 0-2.26-1.91-4.39-4.81-4.39z" fill="#fff" /></svg> },
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
