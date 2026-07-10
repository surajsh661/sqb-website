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
          <a href={COPY.footer.hqUrl} target="_blank" rel="noopener noreferrer">
            {COPY.footer.hqLabel} ↗
          </a>
          <a href="/careers">CAREERS — WE&apos;RE HIRING</a>
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
          <a href="https://www.instagram.com/sqbpictures/" target="_blank" rel="noopener noreferrer">
            <svg className="foot-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg>
            INSTAGRAM ↗
          </a>
          <a href="https://www.linkedin.com/company/sqbpictures/" target="_blank" rel="noopener noreferrer">
            <svg className="foot-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.3 9h3.4v11.5H3.3zM9.2 9h3.26v1.57h.05c.45-.86 1.56-1.77 3.2-1.77 3.43 0 4.06 2.26 4.06 5.2v6.5h-3.4v-5.76c0-1.37-.02-3.14-1.91-3.14-1.92 0-2.21 1.5-2.21 3.04v5.86H9.2z" /></svg>
            LINKEDIN ↗
          </a>
          <a href="https://wa.me/919013082883" target="_blank" rel="noopener noreferrer">
            <svg className="foot-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.92-.2-.31A8.2 8.2 0 1 1 12 20.2zm4.5-6.16c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42l-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.16 1.78 2.72 4.3 3.81 1.6.69 2.23.75 3.03.63.49-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" /></svg>
            WHATSAPP ↗
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{COPY.footer.copyright}</span>
      </div>
    </footer>
  );
}
