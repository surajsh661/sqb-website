'use client';
import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import Hero from '@/components/Hero';
import Verticals from '@/components/Verticals';
import Engine from '@/components/Engine';
import Testimonials from '@/components/Testimonials';
import BTSPreview from '@/components/BTSPreview';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import TicketMenu from '@/components/TicketMenu';
import CaseStudy from '@/components/CaseStudy';
import ClientLogos from '@/components/ClientLogos';
import CountUp from '@/components/CountUp';
import { SQB_FILMS, SQB_HERO_FILMS } from '@/lib/data';
import { setupReveal } from '@/lib/video-utils';
import type { Film, Genre } from '@/lib/types';
import { useRouter } from 'next/navigation';

const TAGLINE = 'TELL YOUR STORY TODAY.';

export default function HomePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);
  const [caseOpen, setCaseOpen] = useState(false);

  useEffect(() => {
    setupReveal();
  }, []);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuOpen) setMenuOpen(false);
        else if (caseOpen) closeCase();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, caseOpen]);

  const go = (genreKey: Genre | 'all') => {
    router.push(`/work?filter=${encodeURIComponent(genreKey)}`);
  };

  return (
    <>
      <Loader />
      <Topbar active="home" onOpenMenu={() => setMenuOpen(true)} tagline={TAGLINE} />

      <Hero films={SQB_HERO_FILMS} onPick={openCase} tagline={TAGLINE} showCursorHint />

      <section className="section manifesto" data-screen-label="02 Manifesto">
        <div className="eyebrow"><span className="num">02</span> <span>WHAT WE BELIEVE</span></div>
        <h2>
          We love <em>filmmaking</em> first <br />
          and <span className="ai">AI</span> second. <br />
          And we&apos;re at the <em>cutting edge</em> of both.
        </h2>
        <p>
          S&apos;QB Pictures is a Delhi–Mumbai studio building India&apos;s most ambitious AI-enabled
          films, ads and shows for the country&apos;s biggest brands. Story, performance and craft
          come first — generative pipelines come along to make the impossible shot possible and the
          impossible deadline real.
        </p>
      </section>

      <section className="section" data-screen-label="03 Clients" style={{ paddingTop: 100, paddingBottom: 0 }}>
        <div className="trusted-head">
          <h2>TRUSTED BY <em>GLOBAL BRANDS</em></h2>
        </div>
      </section>
      <ClientLogos />

      <section className="section stats-section" data-screen-label="04 Stats">
        <div className="eyebrow"><span className="num">04</span> <span>BY THE NUMBERS</span></div>
        <div className="stats">
          <div className="stat">
            <div className="num"><CountUp end={100} suffix="+" /></div>
            <div className="label">CLIENTS &nbsp;//&nbsp; INDIAN + GLOBAL</div>
          </div>
          <div className="stat">
            <div className="num"><CountUp end={1000} suffix="+" /></div>
            <div className="label">FILMS DELIVERED</div>
          </div>
          <div className="stat">
            <div className="num">
              2<span style={{ color: 'var(--fg-dim)' }}>–</span>
              <CountUp end={10} suffix="×" />
            </div>
            <div className="label">RETURN ON AD SPEND</div>
          </div>
        </div>
      </section>

      <Verticals />

      <section className="section" data-screen-label="06 Categories">
        <div className="eyebrow"><span className="num">06</span> <span>WHAT WE MAKE — END-TO-END</span></div>
        <div className="categories">
          {([
            ['ADS / TVC', 'ad', '01'],
            ['FILMS', 'film', '02'],
            ['SHOWS', 'show', '03'],
            ['VIDEO PRODUCTION', 'all', '04'],
            ['AI FILMS', 'ai', '05'],
            ['MUSIC VIDEOS', 'music', '06'],
            ['VERTICAL / MICRO', 'vertical', '07'],
            ['VFX / 3D', 'vfx', '08'],
          ] as [string, Genre, string][]).map(([name, key, num]) => (
            <div className="cat" key={num} onClick={() => go(key)} role="button" tabIndex={0}>
              <span className="num">{num}</span>
              <span className="name">{name}</span>
              <span className="arrow">VIEW REEL ↗</span>
            </div>
          ))}
        </div>
      </section>

      <Engine />
      <Testimonials />
      <BTSPreview />
      <ContactSection />
      <Footer />

      <TicketMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CaseStudy
        film={activeFilm}
        films={SQB_FILMS}
        open={caseOpen}
        onClose={closeCase}
        onPick={switchCase}
      />
    </>
  );
}
