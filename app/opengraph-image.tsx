import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

// The real 1200×630 social card — built to match the site's actual brand
// system (Anton display, Inter body, JetBrains Mono labels; ink/gold palette;
// film-grain texture) and its actual positioning: filmmakers first, AI
// second, across ad films, documentaries, web shows, music videos and AI
// film production — not a narrow "AI production house" pitch.

export const runtime = 'nodejs';
export const alt = "S'QB Pictures — Tell Your Story Today";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#0E0E0E';
const FG = '#F4ECDB';
const FG_DIM = '#B5AE9F';
const GOLD = '#F5C518';

// Google Fonts only serves woff2 to modern UAs; Satori (next/og) needs
// ttf/otf. Spoofing an old Firefox UA makes the css2 endpoint return a ttf
// link instead — the standard trick for next/og + Google Fonts.
async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(
        "S'QB PICTURES TELL YOUR STORY TODAY.,·ADFILMSTVCUMENTARIESWBHOSMICVQ FX DELHI NCR & MUMBAI SQBPICTURESCOM0123456789",
      )}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1' } },
    ).then((r) => r.text());
    const match = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype|woff)'\)/);
    if (!match) return null;
    return await fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  // The tight square "S'QB" mark (same crop as the favicon) — logo-dark.png
  // is a full wordmark with a lot of dead vertical padding baked in, which
  // read as a tiny smudge at card size.
  const logo = readFileSync(join(process.cwd(), 'public/logo-mark-square.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;
  const grain = readFileSync(join(process.cwd(), 'public/sqb-grain.jpg'));
  const grainSrc = `data:image/jpeg;base64,${grain.toString('base64')}`;

  const [anton, interReg, interBold, mono] = await Promise.all([
    loadGoogleFont('Anton', 400),
    loadGoogleFont('Inter', 400),
    loadGoogleFont('Inter', 700),
    loadGoogleFont('JetBrains+Mono', 600),
  ]);
  const fonts = [
    anton && { name: 'Anton', data: anton, weight: 400 as const, style: 'normal' as const },
    interReg && { name: 'Inter', data: interReg, weight: 400 as const, style: 'normal' as const },
    interBold && { name: 'Inter', data: interBold, weight: 700 as const, style: 'normal' as const },
    mono && { name: 'JetBrains Mono', data: mono, weight: 600 as const, style: 'normal' as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[];

  const F_DISPLAY = anton ? 'Anton' : 'sans-serif';
  const F_BODY = interReg || interBold ? 'Inter' : 'sans-serif';
  const F_MONO = mono ? 'JetBrains Mono' : 'monospace';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: INK,
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* film-grain texture, matching the rest of the brand system */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={grainSrc}
          width={1200}
          height={630}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.06 }}
        />
        {/* faint warm glow, low and off-center — not the whole story like before */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(46% 60% at 82% 100%, rgba(245,197,24,0.14), transparent 70%)',
          }}
        />

        {/* top: the mark, on its own — big enough to actually read, no
           redundant "S'QB Pictures" text beside it (the mark already says it) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={188}
          height={188}
          alt=""
          style={{ objectFit: 'contain', borderRadius: 28 }}
        />

        {/* middle: the real headline + real capability index */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: 22,
              fontFamily: F_DISPLAY,
              fontSize: 96,
              lineHeight: 0.98,
              letterSpacing: '0.005em',
              textTransform: 'uppercase',
              color: FG,
            }}
          >
            <span style={{ display: 'flex' }}>TELL YOUR</span>
            <span style={{ display: 'flex', color: GOLD }}>STORY</span>
            <span style={{ display: 'flex' }}>TODAY.</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: 14,
              marginTop: 26,
              fontFamily: F_BODY,
              fontWeight: 400,
              fontSize: 25,
              color: FG_DIM,
              maxWidth: 1050,
            }}
          >
            {['Ad Films & TVCs', 'Documentaries', 'Web Shows', 'Music Videos', 'AI Films', 'VFX'].map((tag, i, arr) => (
              <span key={tag} style={{ display: 'flex' }}>
                {tag}
                {i < arr.length - 1 ? <span style={{ color: GOLD, marginLeft: 14 }}>·</span> : null}
              </span>
            ))}
          </div>
        </div>

        {/* bottom: gold rule + url, same footer language as the site's own emails */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 4, width: 120, background: GOLD, borderRadius: 2, marginBottom: 20 }} />
          <div
            style={{
              fontFamily: F_MONO,
              fontSize: 15,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: FG_DIM,
            }}
          >
            SQBPICTURES.COM
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
