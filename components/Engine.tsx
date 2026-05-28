'use client';
import { SQB_TEAM } from '@/lib/data';

// Bios live here for now — easy to edit. Energetic / young / positive / bold.
// Replace with the real LinkedIn-sourced copy when you're ready.
const BIOS: Record<string, string> = {
  f1:
    "Founder, director, writer — Suraj is the lens behind every S’QB film. He’s directed national TVCs for Muthoot Finance, PhysicsWallah, Sunstone × LSG and T-Series; shot a ten-episode 8.3-IMDb web series (Cocoon) end-to-end; and screenplay-visualised the 22-episode Sunheri Soch AI cinema series for the country’s largest gold-finance brand. Filmmaker first, AI-obsessed second. Believes the story is the budget — and that the best frames are the ones nobody else thought to shoot.",
  f2:
    "Founder, producer, head of operations — Shubham runs the production engine that turns S’QB scripts into shoots into final cuts. From IPL broadcasts with LSG to a nine-month docu-cinema run with RedFM, every shoot day, render queue and delivery deadline goes through him. Knows how to wrangle a unit at 6am, a vendor at midnight, and a brand timeline that should’ve been impossible last week. The studio ships because Shubham makes sure nothing falls.",
};

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

        <div className="founder-portrait">
          <span className="fp-role">{suraj.role}</span>
          <span className="fp-name">{suraj.name}</span>
        </div>

        <div className="founder-portrait">
          <span className="fp-role">{shubham.role}</span>
          <span className="fp-name">{shubham.name}</span>
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
