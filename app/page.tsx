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
import ManifestoHeadline from '@/components/ManifestoHeadline';
import ServiceMap from '@/components/ServiceMap';
import HeroIntro from '@/components/HeroIntro';
import { SQB_FILMS, SQB_HERO_FILMS } from '@/lib/data';
import { setupReveal } from '@/lib/video-utils';
import type { Film } from '@/lib/types';

export default function HomePage() {
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

  return (
    <>
      <Loader />
      <HeroIntro />
      <Topbar active="home" onOpenMenu={() => setMenuOpen(true)} />

      <Hero films={SQB_HERO_FILMS} onPick={openCase} />

      <section className="section manifesto" data-screen-label="02 Manifesto">
        <div className="eyebrow"><span className="num">02</span> <span>WHAT WE BELIEVE</span></div>
        <ManifestoHeadline />
        <p>
          S&apos;QB Pictures is a Delhi · Mumbai studio building India&apos;s most ambitious AI-enabled
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

      <section className="section stats-map-section" data-screen-label="04 Numbers + Reach">
        <div className="sm-grid">
          <div className="sm-grid-stats">
            <div className="eyebrow"><span className="num">04</span> <span>BY THE NUMBERS · GLOBAL REACH</span></div>
            <div className="stats stacked">
              <div className="stat">
                <div className="num"><CountUp end={100} suffix="+" /></div>
                <div className="label">CLIENTS &nbsp;//&nbsp; INDIAN + GLOBAL</div>
              </div>
              <div className="stat">
                <div className="num"><CountUp end={10000} suffix="+" /></div>
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
          </div>
          <div className="sm-grid-map">
            <ServiceMap />
          </div>
        </div>
      </section>

      <Verticals />

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
