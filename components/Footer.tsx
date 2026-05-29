'use client';

export default function Footer() {
  return (
    <footer className="footer" data-screen-label="12 Footer">
      <div className="footer-cta">
        <div className="footer-cta-row">
          <div>
            TELL YOUR <em>STORY</em> <br />
            TODAY <span style={{ color: 'var(--accent)' }}>—</span>
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
          <h4>STUDIO</h4>
          <p>S&apos;QB PICTURES</p>
          <p>DELHI · MUMBAI</p>
        </div>
        <div>
          <h4>FOUNDERS</h4>
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
          <h4>CONTACT</h4>
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
          <h4>FOLLOW</h4>
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
        <span>© 2026 NIYASHI MOTION PICTURES PVT LTD · S&apos;QB PICTURES · ALL FRAMES RESERVED.</span>
        <span className="footer-cube" title="S'cube — made with the 4 S's of our founders, Suraj Sharma + Shubham Shah">
          S&apos;CUBE · 4·S OF SURAJ SHARMA + SHUBHAM SHAH
        </span>
      </div>
    </footer>
  );
}
