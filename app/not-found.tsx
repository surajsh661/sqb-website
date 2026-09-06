import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import './not-found.css';

// A branded 404 instead of the framework's bare default. Kept as a server
// component (no client JS) so a missing URL costs nothing to render.
export const metadata: Metadata = {
  title: 'Page Not Found (404)',
  description:
    "That page isn't here. Browse S'QB Pictures' films, AI Lab, social work or open roles instead.",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: '/', label: 'Home', hint: 'The reel, the crew, the studio' },
  { href: '/work', label: 'Video', hint: 'Ad films, TVCs, documentaries, web shows' },
  { href: '/ai-lab', label: 'AI Lab', hint: 'AI films, animation, VFX' },
  { href: '/social', label: 'Social', hint: 'Creator IPs and YouTube engines' },
  { href: '/careers', label: 'Careers', hint: 'Open roles — and open applications' },
];

export default function NotFound() {
  return (
    <div className="page-shell">
      <main className="nf-wrap">
        <div className="nf-slate">
          <div className="nf-tag">
            <span className="nf-dot" />
            SCENE MISSING · ERROR 404
          </div>
          <h1 className="nf-title">
            THIS SHOT ISN&apos;T <em>IN THE CUT</em>.
          </h1>
          <p className="nf-copy">
            The page you asked for doesn&apos;t exist — it may have been moved, renamed, or never
            made it past the edit. Here&apos;s where everything else lives.
          </p>

          <nav className="nf-links" aria-label="Main pages">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nf-link">
                <span className="nf-link-label">{l.label}</span>
                <span className="nf-link-hint">{l.hint}</span>
                <span className="nf-link-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <Footer />
    </div>
  );
}
