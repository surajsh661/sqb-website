'use client';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';

export default function Footer() {
  return (
    <footer className="footer" data-screen-label="12 Footer">
      <div className="footer-cta">
        <div className="footer-cta-row">
          <div>
            {rich(COPY.footer.cta)} <span style={{ color: 'var(--accent)' }}>—</span>
          </div>
          <div className="footer-cta-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-footer.png"
              alt="S'QB"
              className="fcl-img"
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            />
            <div className="fcl-grain" />
          </div>
        </div>
      </div>
      <div className="footer-grid">
        <div>
          <h4>{COPY.footer.studioHeading}</h4>
          {COPY.footer.studioLines.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <div>
          <h4>{COPY.footer.foundersHeading}</h4>
          <a
            href="https://www.linkedin.com/in/suraj-sharma-91b004195/"
            target="_blank"
            rel="noopener noreferrer"
          >
            SURAJ ↗
          </a>
          <a
            href="https://www.linkedin.com/in/shubham-shah-a9629b1b4/"
            target="_blank"
            rel="noopener noreferrer"
          >
            SHUBHAM SHAH ↗
          </a>
        </div>
        <div>
          <h4>{COPY.footer.contactHeading}</h4>
          <a href="https://wa.me/919013082883" target="_blank" rel="noopener noreferrer">
            +91 90130 82883 (WhatsApp)
          </a>
          <a href="https://wa.me/917217817383" target="_blank" rel="noopener noreferrer">
            +91 72178 17383 (WhatsApp)
          </a>
          <a href="mailto:surajsharma@sqbpictures.com">SURAJSHARMA@SQBPICTURES.COM</a>
          <a href="mailto:shubham.shah@sqbpictures.com">SHUBHAM.SHAH@SQBPICTURES.COM</a>
        </div>
        <div>
          <h4>{COPY.footer.followHeading}</h4>
          <a
            href="https://www.instagram.com/sqbpictures/"
            target="_blank"
            rel="noopener noreferrer"
          >
            INSTAGRAM ↗
          </a>
          <a
            href="https://www.youtube.com/@sqbpictures"
            target="_blank"
            rel="noopener noreferrer"
          >
            YOUTUBE ↗
          </a>
          <a
            href="https://www.linkedin.com/company/sqbpictures/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LINKEDIN ↗
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{COPY.footer.copyright}</span>
        <span className="footer-cube" title="S'cube — made with the 4 S's of our founders, Suraj Sharma + Shubham Shah">
          {COPY.footer.cube}
        </span>
      </div>
    </footer>
  );
}
