import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

// A proper 1200×630 social card. WhatsApp / LinkedIn / Slack scrape og:image —
// the old value pointed at a 500×500 transparent logo, which they pasted on
// white and rendered as faint sketchy strokes. This paints the logo on the
// brand-dark canvas with the tagline, so every share looks intentional.

export const runtime = 'nodejs';
export const alt = "S'QB Pictures — AI video production house in India";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), 'public/logo-dark.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0E0E0E',
          position: 'relative',
        }}
      >
        {/* soft gold glow behind the mark */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(50% 55% at 50% 42%, rgba(245,197,24,0.16), transparent 70%)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={300} height={300} alt="S'QB Pictures" style={{ objectFit: 'contain' }} />
        <div
          style={{
            marginTop: 18,
            color: '#F4ECDB',
            fontSize: 40,
            fontWeight: 700,
            textAlign: 'center',
            maxWidth: 960,
            lineHeight: 1.25,
          }}
        >
          AI films · AI creatives · AI influencers · 2D/3D animation &amp; VFX
        </div>
        <div style={{ marginTop: 22, color: '#F5C518', fontSize: 26, letterSpacing: 4, fontWeight: 700 }}>
          AI VIDEO PRODUCTION HOUSE · INDIA
        </div>
        {/* gold base rule */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 12, background: '#F5C518' }} />
      </div>
    ),
    { ...size },
  );
}
