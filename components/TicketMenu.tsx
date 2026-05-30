'use client';
import { useRouter } from 'next/navigation';
import { COPY } from '@/lib/copy';

interface Props { open: boolean; onClose: () => void }

const ITEMS: [string, string, string][] = [
  [COPY.menu.itemAll,      'all',      '01'],
  [COPY.menu.itemAd,       'ad',       '02'],
  [COPY.menu.itemFilm,     'film',     '03'],
  [COPY.menu.itemAi,       'ai',       '04'],
  [COPY.menu.itemMusic,    'music',    '05'],
  [COPY.menu.itemVertical, 'vertical', '06'],
  [COPY.menu.itemContact,  'contact',  '07'],
];

export default function TicketMenu({ open, onClose }: Props) {
  const router = useRouter();
  const onPick = (key: string) => {
    if (key === 'contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onClose();
    } else {
      router.push(`/work?filter=${encodeURIComponent(key)}`);
      onClose();
    }
  };
  return (
    <div className={'ticket-overlay' + (open ? ' open' : '')} onClick={onClose}>
      <div className="ticket" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-section">
          <div className="ticket-header">
            <div className="stub">
              <div>{COPY.menu.stubLine}</div>
              <div className="big">{COPY.menu.stubBig}</div>
            </div>
            <button className="ticket-close" onClick={onClose} aria-label="Close menu">✕</button>
          </div>
          <div className="ticket-info" style={{ marginTop: 8 }}>
            <div className="row"><span>{COPY.menu.screenLabel}</span><strong>{COPY.menu.screenValue}</strong></div>
            <div className="row"><span>{COPY.menu.showLabel}</span><strong>{COPY.menu.showValue}</strong></div>
            <div className="row"><span>{COPY.menu.seatLabel}</span><strong>{COPY.menu.seatValue}</strong></div>
          </div>
        </div>

        <div className="perf" />

        <div className="ticket-section fold-1">
          <ul className="ticket-menu">
            {ITEMS.map(([name, key, num]) => (
              <li key={num} onClick={() => onPick(key)}>
                <span className="num">{num}</span>
                <span className="name">{name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="perf" />

        <div className="ticket-section fold-2">
          <div className="ticket-info" style={{ marginBottom: 16 }}>
            <div className="row"><span>{COPY.menu.emailLabel}</span><strong>SURAJSHARMA@SQBPICTURES.COM</strong></div>
            <div className="row"><span>{COPY.menu.whatsappLabel}</span><strong>+91 90130 82883</strong></div>
          </div>
          <div className="ticket-foot">
            <div className="socials">
              <a href="https://www.instagram.com/sqbpictures/" target="_blank" rel="noopener noreferrer">IG ↗</a>
              <a href="https://www.linkedin.com/company/sqbpictures/" target="_blank" rel="noopener noreferrer">IN ↗</a>
              <a href="https://wa.me/919013082883" target="_blank" rel="noopener noreferrer">WA ↗</a>
            </div>
            <div className="barcode">
              {Array.from({ length: 22 }).map((_, i) => (
                <i key={i} style={{ height: 22 + (i % 3) * 4, width: i % 4 === 0 ? 3 : 2 }} />
              ))}
            </div>
          </div>
        </div>

        <div className="perf" />

        <div className="ticket-section fold-3" style={{ padding: '14px 30px', textAlign: 'center' }}>
          <div className="ticket-info">{COPY.menu.copyright}</div>
        </div>
      </div>
    </div>
  );
}
