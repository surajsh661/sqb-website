'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COPY } from '@/lib/copy';

interface Props {
  active?: 'home' | 'work' | 'ai-lab' | 'social';
  /** Retained for API compatibility; the hamburger menu has been removed. */
  onOpenMenu?: () => void;
  /** Use sub-page nav (sqb-nav) styling instead of topbar */
  variant?: 'topbar' | 'nav';
}

export default function Topbar({
  active = 'home',
  variant = 'topbar',
}: Props) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('sqb-theme')) as 'dark' | 'light' | null;
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.dataset.theme = theme;
    try { localStorage.setItem('sqb-theme', theme); } catch {}
  }, [theme]);

  const logoSrc = theme === 'dark' ? '/logo-dark.png' : '/logo-light.png';
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (variant === 'nav') {
    return (
      <nav className="sqb-nav">
        <Link className="lm" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="S'QB" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
        </Link>
        <div className="nav">
          <Link href="/" className={active === 'home' ? 'active' : ''}>{COPY.nav.home}</Link>
          <Link href="/work" className={active === 'work' ? 'active' : ''}>{COPY.nav.video}</Link>
          <Link href="/ai-lab" className={active === 'ai-lab' ? 'active' : ''}>{COPY.nav.aiLab}</Link>
          <Link href="/social" className={active === 'social' ? 'active' : ''}>{COPY.nav.social}</Link>
        </div>
        <div className="right">
          <a className="reach-out-btn" href="#contact" onClick={scrollToContact}>
            {COPY.nav.reachOut} <span className="ro-arrow">→</span>
          </a>
          <button className="tt" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? '☾' : '☀'}
          </button>
        </div>
      </nav>
    );
  }

  // Home-page topbar variant
  return (
    <div className="topbar">
      <Link
        href="/"
        className="logo-mark"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="S'QB Pictures" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
      </Link>
      <nav className="nav-center">
        <Link href="/" className={active === 'home' ? 'active' : ''}>{COPY.nav.home}</Link>
        <Link href="/work" className={active === 'work' ? 'active' : ''}>{COPY.nav.video}</Link>
        <Link href="/ai-lab" className={active === 'ai-lab' ? 'active' : ''}>{COPY.nav.aiLab}</Link>
        <Link href="/social" className={active === 'social' ? 'active' : ''}>{COPY.nav.social}</Link>
      </nav>
      <div className="top-right">
        <a className="reach-out-btn" href="#contact" onClick={scrollToContact}>
          {COPY.nav.reachOut} <span className="ro-arrow">→</span>
        </a>
        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          <span className="knob">{theme === 'dark' ? '☾' : '☀'}</span>
        </button>
      </div>
    </div>
  );
}
