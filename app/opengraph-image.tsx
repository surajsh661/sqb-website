import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

// The real 1200×630 social card — built to match the site's actual brand
// system (Anton display, Inter body; ink/gold palette; film-grain texture)
// and its actual positioning: filmmakers first, AI second, across ad films,
// documentaries, web shows, music videos and AI film production — not a
// narrow "AI production house" pitch.
//
// Layout: the full "S'QB pictures" lockup, big and centered, is the hero —
// no repeated brand text beside it. The tagline + capability index sit below
// it. No footer URL/rule — the logo carries the brand on its own.

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
  // The FULL lockup — "S'QB" + "pictures" — not the square monogram-only
  // crop used for the favicon. That crop deliberately drops "pictures" to
  // fit a tiny square icon; here we have room, and the word should read.
  const logo = readFileSync(join(process.cwd(), 'public/logo-mark-full.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;
  const grain = readFileSync(join(process.cwd(), 'public/sqb-grain.jpg'));
  const grainSrc = `data:image/jpeg;base64,${grain.toString('base64')}`;

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
          background: 'linear-gradient(160deg, #16120a 0%, #0E0E0E 45%, #0a0a0c 100%)',
          padding: '56px 72px',
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
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.14 }}
        />
        {/* warm spotlight behind the mark, cinematic vignette at the corners */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(46% 50% at 50% 36%, rgba(245,197,24,0.24), transparent 68%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(120% 95% at 50% 50%, transparent 58%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* corner brackets — a viewfinder / camera-frame motif, gold, thin.
           Satori needs exactly the relevant position keys present (no
           'auto', and no explicit undefined) — so build each corner's
           style as its own plain object rather than toggling a shared one. */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => {
          const BORDER = `3px solid ${GOLD}`;
          const NONE = '3px solid transparent';
          const isTop = corner === 'tl' || corner === 'tr';
          const isLeft = corner === 'tl' || corner === 'bl';
          const vertical = isTop ? { top: 34 } : { bottom: 34 };
          const horizontal = isLeft ? { left: 34 } : { right: 34 };
          return (
            <div
              key={corner}
              style={{
                position: 'absolute',
                ...vertical,
                ...horizontal,
                width: 40,
                height: 40,
                borderTop: isTop ? BORDER : NONE,
                borderBottom: isTop ? NONE : BORDER,
                borderLeft: isLeft ? BORDER : NONE,
                borderRight: isLeft ? NONE : BORDER,
                opacity: 0.55,
              }}
            />
          );
        })}

        {/* the mark — big, centered, carrying the brand on its own */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={520} height={282} alt="" style={{ objectFit: 'contain' }} />
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
              fontSize: 66,
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
              fontSize: 22,
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
