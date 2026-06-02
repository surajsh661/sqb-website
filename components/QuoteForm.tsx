'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Cal.com inline embed. Cal.com is used (not Calendly) because its dark theme +
// brand-colour token let it sit inside the modal without looking foreign.
const CAL_LINK = 's-qb-pictures-8a3afa/20min';
const BRAND = '#F5C518';

// Short, scannable service labels — rendered as circular multi-select chips.
const SERVICES = [
  'Film & Video',
  'Podcast',
  'Social Media',
  'Influencer',
  'Digital Campaign',
  'AI Films',
  'Personal Branding',
  'Other',
];

// Loads Cal.com's embed bootstrap exactly once (their official snippet).
function ensureCalLoaded() {
  const w = window as any;
  if (w.Cal) return;
  (function (C: any, A: string, L: string) {
    const p = (a: any, ar: any) => a.q.push(ar);
    const d = C.document;
    C.Cal =
      C.Cal ||
      function () {
        // eslint-disable-next-line prefer-rest-params
        const cal = C.Cal; const ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const ns = ar[1]; api.q = api.q || [];
          if (typeof ns === 'string') { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ['initNamespace', ns]); }
          else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
  })(w, 'https://app.cal.com/embed/embed.js', 'init');
}

/**
 * "What's Your Story?" — the Reach Out modal. A two-step flow: fill the brief,
 * then pick a time. There is exactly ONE confirming button — Cal.com's Confirm
 * on the scheduling step. The form just advances to the calendar (prefilled with
 * what you typed) and fires a lead notification in the background.
 */
export default function QuoteForm({ open, onClose }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', note: '' });
  const [services, setServices] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [step, setStep] = useState<'form' | 'cal'>('form');
  const [svcError, setSvcError] = useState(false);
  const calRef = useRef<HTMLDivElement | null>(null);
  const notified = useRef(false);

  // Mount the Cal.com inline widget, prefilled with the typed details so the
  // booking step needs no re-entry — Confirm there is the single confirmation.
  const initCal = () => {
    const el = calRef.current;
    if (!el) return;
    ensureCalLoaded();
    const w = window as any;
    const notes = [
      form.company && `Company: ${form.company}`,
      form.phone && `Phone: ${form.phone}`,
      services.length && `Services: ${services.map((s) => (s === 'Other' && other.trim() ? `Other (${other.trim()})` : s)).join(', ')}`,
      form.note && `Brief: ${form.note}`,
    ].filter(Boolean).join('\n');
    w.Cal('init', { origin: 'https://app.cal.com' });
    el.innerHTML = '';
    w.Cal('inline', {
      elementOrSelector: el,
      calLink: CAL_LINK,
      config: { layout: 'month_view', theme: 'dark', name: form.name, email: form.email, notes },
    });
    w.Cal('ui', {
      theme: 'dark',
      cssVarsPerTheme: { dark: { 'cal-brand': BRAND } },
      hideEventTypeDetails: true, // our own header covers it; keeps the calendar high up
      layout: 'month_view',
    });
  };

  // Reset to step one whenever the modal (re)opens.
  useEffect(() => {
    if (open) { setStep('form'); setSvcError(false); notified.current = false; }
  }, [open]);

  // Mount the calendar when we advance to the scheduling step.
  useEffect(() => {
    if (open && step === 'cal') initCal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const toggleService = (s: string) => {
    setSvcError(false);
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  };

  // Step one → step two. Native validation covers name/email; we check that at
  // least one service is picked, send a background lead notification, then show
  // the calendar (already prefilled with everything above).
  const goToCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (services.length === 0) { setSvcError(true); return; }
    if (!notified.current) {
      notified.current = true;
      const svc = services.map((s) => (s === 'Other' && other.trim() ? `Other: ${other.trim()}` : s));
      // fire-and-forget: capture the lead even if they don't finish booking
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          org: form.company, services: svc, brief: form.note,
        }),
      }).catch(() => { /* non-blocking */ });
    }
    setStep('cal');
  };

  return (
    <div className="qf-overlay" onClick={onClose}>
      <div className={'qf-modal step-' + step} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="What's your story">
        <button className="qf-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="qf-grid">
          {/* ── Left: brand panel (orange glow + embossed logo up top) ──── */}
          <div className="qf-left">
            <span className="qf-glow" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="qf-watermark" src="/logo-dark.png" alt="" aria-hidden="true" />
            <div className="qf-head">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="qf-logo" src="/logo-dark.png" alt="S'QB Pictures" />
              <h2 className="qf-title">WHAT&apos;S YOUR STORY?</h2>
              <p className="qf-sub">Tell us what you&apos;re making. We&apos;ll line up a call and come back within 24 hours.</p>
            </div>
          </div>

          {/* ── Right: step one (the brief) ── then step two (the calendar) ── */}
          <div className="qf-right">
            {step === 'form' ? (
              <form className="qf-form" onSubmit={goToCalendar}>
                <label className="qf-field">
                  <span>Your name <i>*</i></span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="First and last" />
                </label>
                <div className="qf-row">
                  <label className="qf-field">
                    <span>Email <i>*</i></span>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@brand.com" />
                  </label>
                  <label className="qf-field">
                    <span>Phone</span>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
                  </label>
                </div>
                <label className="qf-field">
                  <span>Company</span>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Optional" />
                </label>

                <div className="qf-field">
                  <span>What can we help with? <i>*</i></span>
                  <div className="qf-chips">
                    {SERVICES.map((s) => {
                      const on = services.includes(s);
                      return (
                        <button
                          type="button"
                          key={s}
                          className={'qf-chip' + (on ? ' on' : '')}
                          onClick={() => toggleService(s)}
                          aria-pressed={on}
                        >
                          <span className="qf-chip-dot" aria-hidden="true" />
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  {services.includes('Other') && (
                    <input
                      className="qf-other"
                      value={other}
                      onChange={(e) => setOther(e.target.value)}
                      placeholder="Tell us more"
                    />
                  )}
                  {svcError && <p className="qf-err">Pick at least one option.</p>}
                </div>

                <label className="qf-field">
                  <span>The project, in a line or two</span>
                  <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What you're making, the deadline, the vibe." />
                </label>

                <button className="qf-submit" type="submit">
                  <span>Continue</span>
                  <svg className="qf-submit-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h13" /><path d="M12 6l6 6-6 6" /></svg>
                </button>
              </form>
            ) : (
              <div className="qf-cal-step">
                <div className="qf-right-head">
                  <button type="button" className="qf-back" onClick={() => setStep('form')} aria-label="Back to the brief">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H4" /><path d="M12 6l-6 6 6 6" /></svg>
                    Back
                  </button>
                  <span className="qf-right-k">Pick a time</span>
                  <span className="qf-right-sub">20-minute intro call · then hit Confirm</span>
                </div>
                <div className="qf-cal-embed" ref={calRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
