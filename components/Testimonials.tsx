'use client';
import { SQB_TESTIMONIALS } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';

export default function Testimonials() {
  return (
    <section className="section testimonials" data-screen-label="08 Testimonials">
      <div className="eyebrow"><span className="num">{COPY.testimonials.eyebrowNumber}</span> <span>{COPY.testimonials.eyebrowLabel}</span></div>
      <h2 className="testi-head">{rich(COPY.testimonials.heading)}</h2>
      <div className="testi-grid">
        {SQB_TESTIMONIALS.map((t, i) => (
          <figure className="testi" key={i}>
            <div className="quotemark">&quot;</div>
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <div className="who">{t.name}</div>
              <div className="org">{t.org}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
