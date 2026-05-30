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
              { c: '#9a55ff', svg: <svg viewBox="0 0 24 24"><text x="12" y="16.8" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="13.2" fill="#E48BFF" letterSpacing="-0.4">Pr</text></svg> },
              // After Effects (tool)
              { c: '#7d5cff', svg: <svg viewBox="0 0 24 24"><text x="12" y="16.8" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="13.2" fill="#AC9BFF" letterSpacing="-0.4">Ae</text></svg> },
              // LinkedIn (platform)
              { c: '#0A66C2', svg: <svg viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="4.4" fill="#0A66C2" /><path d="M7 9.6h2V17H7zM8 8.3a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3zM10.6 9.6h1.9v1.02h.03c.27-.5.93-1.03 1.92-1.03 2.05 0 2.43 1.35 2.43 3.1V17h-2v-2.97c0-.71-.01-1.62-.99-1.62-.99 0-1.14.77-1.14 1.57V17h-2z" fill="#fff" /></svg> },
              // Music / sound design
              { c: '#FF4E8A', svg: <svg viewBox="0 0 24 24"><path d="M9 16.8V6.4l9-1.7v9.1" fill="none" stroke="#FF6FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><ellipse cx="6.6" cy="16.9" rx="2.7" ry="2.4" fill="#FF6FA3" /><ellipse cx="15.6" cy="15.1" rx="2.7" ry="2.4" fill="#FF6FA3" /></svg> },
              // Like
              { c: '#FF4E6A', svg: <svg viewBox="0 0 24 24"><path d="M12 20.3l-1.3-1.2C6.1 14.9 3.2 12.3 3.2 9.1 3.2 6.6 5.2 4.7 7.6 4.7c1.4 0 2.7.65 3.5 1.7.8-1.05 2.1-1.7 3.5-1.7 2.4 0 4.4 1.9 4.4 4.4 0 3.2-2.9 5.8-7.5 10z" fill="#FF4E6A" /></svg> },
              // Comment
              { c: '#36C5F0', svg: <svg viewBox="0 0 24 24"><path d="M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.2v-3.2a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 4 4.5z" fill="#36C5F0" /></svg> },
              // Follow
              { c: '#9C6BFF', svg: <svg viewBox="0 0 24 24"><circle cx="9.5" cy="8" r="3.6" fill="#9C6BFF" /><path d="M3.6 19c0-3.3 2.6-5.3 5.9-5.3s5.9 2 5.9 5.3z" fill="#9C6BFF" /><path d="M18.6 7v6M15.6 10h6" stroke="#9C6BFF" strokeWidth="2" strokeLinecap="round" /></svg> },
            ].map((it, i) => (
              <div
                className="sh-icon"
                key={i}
                style={{ ['--d' as any]: -(i * 1.6 + 1.5) + 's', ['--c' as any]: it.c }}
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
