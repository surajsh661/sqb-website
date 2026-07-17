import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

// The real 1200×630 social card — skeuomorphic: the brand's own embossed
// metal-plate lockup (public/logo-embossed.png, a genuine debossed/engraved
// treatment with a beveled highlight and a gold ink glint) mounted as a
// physical plaque, with an engraved tagline beneath it. Positioning: real
// service list (ad films, documentaries, web shows, music videos, AI films,
// VFX) — filmmakers first, AI second, not a narrow "AI production house"
// pitch.

export const runtime = 'nodejs';
export const alt = "S'QB Pictures — Tell Your Story Today";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
  // The genuine embossed treatment of the mark — debossed into a textured
  // dark plate with a real bevel highlight, not a flat logo recolored to
  // fake depth. Cropped tight around "S'QB pictures" with a generous
  // texture margin so it reads as a mounted plaque, not a cutout.
  const logo = readFileSync(join(process.cwd(), 'public/logo-embossed.png'));
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

  // Source plate is 1650×920 (~1.7935:1) — hold that ratio at display size.
  const PLATE_W = 680;
  const PLATE_H = Math.round(PLATE_W * (920 / 1650));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(160deg, #1c1a17 0%, #121110 45%, #0a0a0a 100%)',
          padding: '26px 70px 22px',
          position: 'relative',
        }}
      >
        {/* film-grain texture — same material as the plate itself */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={grainSrc}
          width={1200}
          height={630}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.16 }}
        />
        {/* warm spotlight behind the plate, vignette at the corners */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(50% 55% at 50% 34%, rgba(245,197,24,0.16), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(120% 95% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        {/* the plate — mounted like a real plaque: gold bezel that actually
           glows against the dark card, plus a real drop shadow lifting it
           off the page. No corner brackets — they read as clutter, not
           frame. */}
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            borderRadius: 16,
            border: '2px solid rgba(245,197,24,0.55)',
            boxShadow: '0 0 0 1px rgba(245,197,24,0.12), 0 0 60px rgba(245,197,24,0.18), 0 26px 50px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={PLATE_W} height={PLATE_H} alt="" style={{ objectFit: 'cover', display: 'block' }} />
        </div>

        {/* the tagline, sitting on the same textured material as the plate */}
        <div style={{ display: 'flex', marginTop: 20 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 16,
              fontFamily: F_DISPLAY,
              fontSize: 50,
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
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 12,
            marginTop: 12,
            fontFamily: F_BODY,
            fontWeight: 400,
            fontSize: 19,
            color: FG_DIM,
            maxWidth: 1050,
            textAlign: 'center',
          }}
        >
          {['Ad Films & TVCs', 'Documentaries', 'Web Shows', 'Music Videos', 'AI Films', 'VFX'].map((tag, i, arr) => (
            <span key={tag} style={{ display: 'flex' }}>
              {tag}
              {i < arr.length - 1 ? <span style={{ color: GOLD, marginLeft: 12 }}>·</span> : null}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
