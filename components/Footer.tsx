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
          <a>SURAJ</a>
          <a>SHUBHAM SHAH</a>
        </div>
        <div>
          <h4>CONTACT</h4>
          <a>+91 90130 82883</a>
          <a>+91 72178 17383</a>
          <a>HELLO@SQBPICTURES.COM</a>
        </div>
        <div>
          <h4>FOLLOW</h4>
          <a>INSTAGRAM ↗</a>
          <a>YOUTUBE ↗</a>
          <a>LINKEDIN ↗</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 S&apos;QB PICTURES. ALL FRAMES RESERVED.</span>
        <span>S&apos;QB / V2026.05 / DESIGN REFRESH</span>
      </div>
    </footer>
  );
}
