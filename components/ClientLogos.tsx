'use client';
import { SQB_LOGOS } from '@/lib/data';

export default function ClientLogos() {
  const logos = SQB_LOGOS;
  // Each row gets its OWN half of the roster, alternating down the list, so the
  // two rows never show the same brand at once and each still carries a mix of
  // the big names rather than one row taking them all. (Rotating a single
  // shared list only offset the start — the same logo still surfaced twice on
  // screen as the rows drifted past each other.)
  const logosA = logos.filter((_, i) => i % 2 === 0);
  const logosB = logos.filter((_, i) => i % 2 === 1);

  const Row = ({ reverse, list }: { reverse?: boolean; list: typeof logos }) => (
    <div className={'logo-marquee' + (reverse ? ' rev' : '')}>
      <div className="logo-track">
        {[...list, ...list].map((c, i) => (
          <div
            className={
              'client-logo' +
              (c.keepDetails ? ' keep-detail' : '') +
              (c.tone === 'original' ? ' logo-orig' : '') +
              (c.tone === 'invert' ? ' logo-inv' : '') +
              (c.tone === 'mono' ? ' logo-mono' : '')
            }
            key={i}
            title={c.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.src}
              alt={c.name}
              style={{ transform: `scale(${c.size || 1})` }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                if (img.parentElement) {
                  img.parentElement.innerHTML = `<span class="text-logo">${c.name}</span>`;
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Row list={logosA} />
      <Row reverse list={logosB} />
      {/* The logos are images, so the brand names never exist as crawlable text.
          This visually-hidden line mirrors EXACTLY the logos shown above (same
          content, accessible + indexable) — screen readers and search engines
          get the client list the sighted visitor sees. */}
      <p className="sr-only">
        Clients include {logos.map((c) => c.name).join(', ')}.
      </p>
    </>
  );
}
