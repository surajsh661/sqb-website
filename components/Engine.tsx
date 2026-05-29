'use client';
import { useState } from 'react';
import { SQB_TEAM } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';

// Founder bios are edited in lib/copy.ts (engine.surajBio / engine.shubhamBio).

// Exact photo paths per founder. Previously the component tried .jpg → .png
// → .webp via onError chaining, but the race-condition between the 404 and
// the React re-render caused Shubham's PNG to sometimes never load. Direct
// paths kill the race.
const PHOTOS: Record<string, string> = {
  f1: '/founders/suraj.jpg',
  f2: '/founders/shubham.png',
};

function FounderPortrait({
  src, role, name,
}: { src: string; role: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="founder-portrait">
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="fp-photo"
          src={src}
          alt={name}
          onError={() => setFailed(true)}
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
      {/* Faint open-hood / engine-bay backdrop sitting behind the founder
          circles, so the two portraits read like parts of the engine. */}
      <div className="engine-hood" aria-hidden="true" />

      <div className="heading">
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span className="num">{COPY.engine.eyebrowNumber}</span> <span>{COPY.engine.eyebrowLabel}</span>
        </div>
        <h2>{rich(COPY.engine.heading)}</h2>
        <div className="sub">{COPY.engine.subline}</div>
      </div>

      <div className="engine-row">
        <div className="founder-bio left">
          <p>{COPY.engine.surajBio}</p>
        </div>

        {/* The two portraits live in a single absolutely-positioned pair so the
            bios on either side can fill the full outer half of the row. */}
        <div className="founder-pair">
          <FounderPortrait src={PHOTOS[suraj.id]} role={suraj.role} name={suraj.name} />
          <FounderPortrait src={PHOTOS[shubham.id]} role={shubham.role} name={shubham.name} />
        </div>

        <div className="founder-bio right">
          <p>{COPY.engine.shubhamBio}</p>
        </div>
      </div>

      <div className="footnote">
        <div className="rule" />
        <p>{COPY.engine.footnote}</p>
      </div>
    </section>
  );
}
