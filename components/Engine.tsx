'use client';
import { useState } from 'react';
import { SQB_TEAM } from '@/lib/data';

// Bios — easy to edit. Energetic / young / bold. Replace any time via
// GitHub web editor: components/Engine.tsx → edit the strings below.
const BIOS: Record<string, string> = {
  f1:
    "Founder & Director of S’QB Pictures. Suraj writes the room, calls the action, and screenplay-visualises every flagship S’QB film. He directed Muthoot Finance’s 22-episode Sunheri Soch Season 4 — a docu-AI cinema series running in lockstep with RedFM’s national radio campaign — plus high-velocity TVCs for PhysicsWallah, Sunstone × LSG and Bumrah × Naturaltein, and a Kabeera music film for T-Series. His ten-episode coming-of-age drama Cocoon hit 8.3 on IMDb. Currently directing Revolution — S’QB’s long-form docu-drama on India’s education industrial complex. Filmmaker first, AI-obsessed second. Believes the story is the budget.",
  f2:
    "Founder & Producer of S’QB Pictures, and the operator who turns every brief into a delivered film. Shubham runs production end-to-end — preproduction at 6am to render queues at midnight — and has shipped national TVCs, IPL broadcasts, AI cinema, vertical drama and long-form documentary on impossible timelines for the country’s biggest brands. His unit crewed the 9-month Sunheri Soch sprint with RedFM, the Sunstone × Lucknow Super Giants IPL campaign, and the docu-drama Revolution. The studio ships because Shubham makes sure nothing falls. Loves a tight crew over a big one, a brief with stakes over a brief without.",
};

// Filename slugs the component will try in /public/founders/ for each
// founder (in order: jpg → png → webp). First one that loads wins; if
// all three are missing the circle falls back to text only.
const PHOTO_SLUGS: Record<string, string> = {
  f1: 'suraj',
  f2: 'shubham',
};

function FounderPortrait({
  slug, role, name,
}: { slug: string; role: string; name: string }) {
  const candidates = [`/founders/${slug}.jpg`, `/founders/${slug}.png`, `/founders/${slug}.webp`];
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  return (
    <div className="founder-portrait">
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="fp-photo"
          src={candidates[idx]}
          alt={name}
          onError={() => {
            if (idx < candidates.length - 1) setIdx((i) => i + 1);
            else setFailed(true);
          }}
        />
      )}
      <span className="fp-role">{role}</span>
      <span className="fp-name">{name}</span>
    </div>
  );
}

export default function Engine() {
  const [suraj, shubham] = SQB_TEAM.founders;

  return (
    <section className="engine" data-screen-label="07 The Engine">
      <div className="heading">
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span className="num">07</span> <span>THE PEOPLE</span>
        </div>
        <h2>THE <em>ENGINE</em></h2>
        <div className="sub">FOUNDERS · FILMMAKERS FIRST · AI OPERATORS SECOND</div>
      </div>

      <div className="engine-row">
        <div className="founder-bio left">
          <p>{BIOS[suraj.id]}</p>
        </div>

        {/* The two portraits live in a single absolutely-positioned pair so the
            bios on either side can fill the full outer half of the row. */}
        <div className="founder-pair">
          <FounderPortrait slug={PHOTO_SLUGS[suraj.id]} role={suraj.role} name={suraj.name} />
          <FounderPortrait slug={PHOTO_SLUGS[shubham.id]} role={shubham.role} name={shubham.name} />
        </div>

        <div className="founder-bio right">
          <p>{BIOS[shubham.id]}</p>
        </div>
      </div>

      <div className="footnote">
        <div className="rule" />
        <p>
          Two founders. A tight core of operators, writers, editors and AI supervisors who can hold
          a camera at 6am and a render queue at midnight.
        </p>
      </div>
    </section>
  );
}
