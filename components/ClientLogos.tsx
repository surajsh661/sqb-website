'use client';
import { SQB_LOGOS } from '@/lib/data';

export default function ClientLogos() {
  const logos = SQB_LOGOS;
  const rotate = <T,>(arr: T[], n: number): T[] => arr.slice(n).concat(arr.slice(0, n));
  const logosA = logos;
  const logosB = rotate(logos, Math.floor(logos.length / 2));

  const Row = ({ reverse, list }: { reverse?: boolean; list: typeof logos }) => (
    <div className={'logo-marquee' + (reverse ? ' rev' : '')}>
      <div className="logo-track">
        {[...list, ...list].map((c, i) => (
          <div
            className={
              'client-logo' +
              (c.keepDetails ? ' keep-detail' : '') +
              (c.tone === 'original' ? ' logo-orig' : '') +
              (c.tone === 'invert' ? ' logo-inv' : '')
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
    </>
  );
}
