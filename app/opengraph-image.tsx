import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

// The real 1200×630 social card. Minimalist: flat logo, restrained palette
// (ink, off-white, one gold accent), generous whitespace — no embossed
// plates, bevels, glows or drop shadows. Positioning: the real service list
// (ad films, documentaries, web shows, music videos, AI films, VFX) —
// filmmakers first, AI second, not a narrow "AI production house" pitch.

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
        "TELL YOUR STORY TODAY.,·ADFILMSTVCUMENTARIESWBHOSMICVQ FX",
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
  // The flat vector lockup — "S'QB" + "pictures" — not the embossed/
  // textured plate. Minimalist means flat, not fake-3D.
  const logo = readFileSync(join(process.cwd(), 'public/logo-mark-full.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  const [anton, interReg, interBold] = await Promise.all([
    loadGoogleFont('Anton', 400),
    loadGoogleFont('Inter', 400),
    loadGoogleFont('Inter', 700),
  ]);
  const fonts = [
    anton && { name: 'Anton', data: anton, weight: 400 as const, style: 'normal' as const },
    interReg && { name: 'Inter', data: interReg, weight: 400 as const, style: 'normal' as const },
    interBold && { name: 'Inter', data: interBold, weight: 700 as const, style: 'normal' as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[];

  const F_DISPLAY = anton ? 'Anton' : 'sans-serif';
  const F_BODY = interReg || interBold ? 'Inter' : 'sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: INK,
          padding: '56px 72px',
        }}
      >
        {/* the mark — flat, centered, carrying the brand on its own */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={480} height={260} alt="" style={{ objectFit: 'contain' }} />
        </div>

        {/* the tagline + capability index, anchored to the bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 18,
              fontFamily: F_DISPLAY,
              fontSize: 60,
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
              justifyContent: 'center',
              gap: 14,
              marginTop: 18,
              fontFamily: F_BODY,
              fontWeight: 400,
              fontSize: 21,
              color: FG_DIM,
              maxWidth: 1050,
              textAlign: 'center',
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
      </div>
    ),
    { ...size, fonts },
  );
}
