'use client';
import Link from 'next/link';
import { COPY } from '@/lib/copy';

interface Props {
  active?: 'home' | 'work' | 'ai-lab' | 'social';
  /** Retained for API compatibility; the hamburger menu has been removed. */
  onOpenMenu?: () => void;
  /** Opens the Get-a-Quote form. */
  onReachOut?: () => void;
  /** Use sub-page nav (sqb-nav) styling instead of topbar */
  variant?: 'topbar' | 'nav';
}

// Light mode has been archived — the site is dark only. The <html data-theme>
// is hard-locked to "dark" in app/layout.tsx, so there is no toggle here.
export default function Topbar({
  active = 'home',
  onOpenMenu,
  onReachOut,
  variant = 'topbar',
}: Props) {
  const logoSrc = '/logo-dark.png';
  const reachOut = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onReachOut) onReachOut();
    else document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // A bold arrow drawn as an SVG (so the weight is real, not a stroked glyph).
  const Arrow = ({ cls }: { cls: string }) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h13" />
      <path d="M12 6l6 6-6 6" />
    </svg>
  );
  // Reach Out button contents: label + a clipped arrow slot holding two arrows.
  // On hover the resting arrow slides out the right while a second arrow slides
  // in from behind the label to take its place — both clipped inside the pill.
  const roInner = (
    <>
      <span className="ro-label">{COPY.nav.reachOut}</span>
      <span className="ro-arrow" aria-hidden="true">
        <Arrow cls="ro-a ro-a1" />
        <Arrow cls="ro-a ro-a2" />
      </span>
    </>
  );

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
          <a className="reach-out-btn" href="#contact" onClick={reachOut}>
            {roInner}
          </a>
          <button className="menu-trigger" onClick={onOpenMenu} aria-label="Open menu">
            <span className="lines"><span /><span /><span /></span>
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
        <a className="reach-out-btn" href="#contact" onClick={reachOut}>
          {roInner}
        </a>
        <button className="menu-trigger" onClick={onOpenMenu} aria-label="Open menu">
          <span className="lines"><span /><span /><span /></span>
        </button>
      </div>
    </div>
  );
}
