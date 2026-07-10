'use client';
import Link from 'next/link';
import { COPY } from '@/lib/copy';
import { IconX } from './Icons';

interface Props { open: boolean; onClose: () => void; onReachOut?: () => void }

// Mobile menu — the four nav destinations, social links, then Reach Out.
const NAV: [string, string][] = [
  ['HOME', '/'],
  ['VIDEO', '/work'],
  ['AI LAB', '/ai-lab'],
  ['SOCIAL', '/social'],
  ['CAREERS', '/careers'],
];

export default function TicketMenu({ open, onClose, onReachOut }: Props) {
  const reachOut = () => {
    onClose();
    if (onReachOut) { setTimeout(onReachOut, 180); return; }
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
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
            <button className="ticket-close" onClick={onClose} aria-label="Close menu"><IconX size={13} /></button>
          </div>

          <nav className="ticket-menu">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} onClick={onClose}>{label}</Link>
            ))}
          </nav>

          <div className="ticket-perf" />

          <div className="ticket-socials">
            <a href="https://www.instagram.com/sqbpictures/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://www.linkedin.com/company/sqbpictures/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.3 9h3.4v11.5H3.3zM9.2 9h3.26v1.57h.05c.45-.86 1.56-1.77 3.2-1.77 3.43 0 4.06 2.26 4.06 5.2v6.5h-3.4v-5.76c0-1.37-.02-3.14-1.91-3.14-1.92 0-2.21 1.5-2.21 3.04v5.86H9.2z" /></svg>
            </a>
            <a href="https://wa.me/919013082883" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.92-.2-.31A8.2 8.2 0 1 1 12 20.2zm4.5-6.16c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42l-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.16 1.78 2.72 4.3 3.81 1.6.69 2.23.75 3.03.63.49-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" /></svg>
            </a>
          </div>

          <button className="ticket-reach" onClick={reachOut}>
            {COPY.nav.reachOut} <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
