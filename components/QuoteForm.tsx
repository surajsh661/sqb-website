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
 * "What's Your Story?" — the Reach Out modal. One flow: the visitor leaves their
 * details and arranges a meeting. Cal.com is embedded inline as part of the same
 * surface (a time-picker), not a separate mode. No tabs, no page leave.
 */
export default function QuoteForm({ open, onClose }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', note: '' });
  const [services, setServices] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [showCal, setShowCal] = useState(false);
  const calRef = useRef<HTMLDivElement | null>(null);

  // On desktop the scheduler sits in its own column, always visible. On mobile
  // it stays collapsed behind a tap so the form + CTA fit the screen first.
  useEffect(() => {
    if (!open) { setShowCal(false); return; }
    if (window.matchMedia('(min-width: 900px)').matches) setShowCal(true);
  }, [open]);

  // Mount the Cal.com inline widget once the scheduler is meant to be visible.
  // Prefills whatever the visitor has already typed so they don't retype it.
  useEffect(() => {
    if (!open || !showCal) return;
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
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
    // form values intentionally read at reveal time, not on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, showCal]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  useEffect(() => { if (open) setStatus('idle'); }, [open]);

  if (!open) return null;

  const toggleService = (s: string) =>
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const svc = services.map((s) => (s === 'Other' && other.trim() ? `Other: ${other.trim()}` : s));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          org: form.company,
          services: svc,
          brief: form.note,
        }),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', company: '', note: '' });
      setServices([]); setOther('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="qf-overlay" onClick={onClose}>
      <div className="qf-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="What's your story">
        <button className="qf-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="qf-grid">
          {/* ── Left: tell us about it ─────────────────────────────────── */}
          <div className="qf-left">
            <div className="qf-head">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="qf-logo" src="/logo-dark.png" alt="S'QB Pictures" />
              <h2 className="qf-title">WHAT&apos;S YOUR STORY?</h2>
              <p className="qf-sub">Tell us what you&apos;re making. We&apos;ll line up a call and come back within 24 hours.</p>
            </div>

            {status === 'sent' ? (
              <div className="qf-success">
                <div className="qf-success-mark">✓</div>
                <h3>Got it.</h3>
                <p>We&apos;ll be in touch within 24 hours. For anything urgent, WhatsApp +91 90130 82883.</p>
                <button className="qf-submit" onClick={onClose}>Done</button>
              </div>
            ) : (
              <form className="qf-form" onSubmit={onSubmit}>
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
                </div>

                <label className="qf-field">
                  <span>The project, in a line or two</span>
                  <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What you're making, the deadline, the vibe." />
                </label>

                {status === 'error' && (
                  <p className="qf-err">Could not send. Email surajsharma@sqbpictures.com or WhatsApp +91 90130 82883.</p>
                )}

                <button className="qf-submit" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Request a meeting'}
                </button>

                {/* On mobile the calendar is collapsed; this reveals it inline. */}
                {!showCal && (
                  <button type="button" className="qf-cal-toggle" onClick={() => setShowCal(true)}>
                    Or pick a time now
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                )}
              </form>
            )}
          </div>

          {/* ── Right: pick a time (Cal.com inline) ────────────────────── */}
          <div className={'qf-right' + (showCal ? ' show' : '')}>
            <div className="qf-right-head">
              <span className="qf-right-k">Pick a time</span>
              <span className="qf-right-sub">20-minute intro call</span>
            </div>
            <div className="qf-cal-embed" ref={calRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
