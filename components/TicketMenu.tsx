'use client';
import { useRouter } from 'next/navigation';

interface Props { open: boolean; onClose: () => void }

const ITEMS: [string, string, string][] = [
  ['VIDEO',         'all',      '01'],
  ['ADS / TVC',     'ad',       '02'],
  ['FILMS & SHOWS', 'film',     '03'],
  ['AI FILMS',      'ai',       '04'],
  ['MUSIC VIDEOS',  'music',    '05'],
  ['VERTICAL',      'vertical', '06'],
  ['CONTACT',       'contact',  '07'],
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
              <div>S'QB · ADMIT ONE</div>
              <div className="big">REEL ROOM</div>
            </div>
            <button className="ticket-close" onClick={onClose}>✕</button>
          </div>
          <div className="ticket-info" style={{ marginTop: 8 }}>
            <div className="row"><span>SCREEN</span><strong>STUDIO 01</strong></div>
            <div className="row"><span>SHOW</span><strong>2026 / DAILY</strong></div>
            <div className="row"><span>SEAT</span><strong>YOU + IDEA</strong></div>
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
            <div className="row"><span>EMAIL</span><strong>SURAJSHARMA@SQBPICTURES.COM</strong></div>
            <div className="row"><span>WHATSAPP</span><strong>+91 90130 82883</strong></div>
          </div>
          <div className="ticket-foot">
            <div className="socials">
              <span>IG ↗</span>
              <span>YT ↗</span>
              <span>IN ↗</span>
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
          <div className="ticket-info">© NIYASHI MOTION PICTURES · ★★★★★</div>
        </div>
      </div>
    </div>
  );
}
