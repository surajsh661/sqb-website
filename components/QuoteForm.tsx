'use client';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SERVICES = [
  'Film & Video Production',
  'Podcast',
  'Social Media Marketing',
  'Influencer Marketing',
  'Digital Campaign',
  'AI Films',
  'Founder-Led Personal Branding',
  'Other',
];

/**
 * Get-a-Quote modal — the "Reach Out" CTA opens this. On-brand, native form
 * (no external Google Form) that posts to /api/contact. Banner up top, then the
 * fields from the OWLED reference, adapted to S'QB.
 */
export default function QuoteForm({ open, onClose }: Props) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', company: '', website: '', brief: '',
  });
  const [services, setServices] = useState<string[]>([]);
  const [other, setOther] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Reset to a clean form whenever it re-opens.
  useEffect(() => {
    if (open) {
      setStatus('idle');
    }
  }, [open]);

  if (!open) return null;

  const toggleService = (s: string) => {
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    // Fold the "Other" free-text into the services list.
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
          website: form.website,
          services: svc,
          brief: form.brief,
        }),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('sent');
      setForm({ name: '', phone: '', email: '', company: '', website: '', brief: '' });
      setServices([]); setOther('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="qf-overlay" onClick={onClose}>
      <div className="qf-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Get a quote">
        <button className="qf-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Banner */}
        <div className="qf-banner">
          <div className="qf-banner-kicker">S'QB PICTURES</div>
          <h2 className="qf-banner-title">GET A QUOTE</h2>
          <p className="qf-banner-sub">Tell us about your project — we reply within 24 hours.</p>
        </div>

        {status === 'sent' ? (
          <div className="qf-success">
            <div className="qf-success-mark">✓</div>
            <h3>Thanks — your brief is in.</h3>
            <p>We&apos;ll get back to you within 24 hours. For anything urgent, WhatsApp +91 90130 82883.</p>
            <button className="qf-submit" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="qf-form" onSubmit={onSubmit}>
            <label className="qf-field">
              <span>Full Name <i>*</i></span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your answer" />
            </label>
            <label className="qf-field">
              <span>Phone Number</span>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your answer" />
            </label>
            <label className="qf-field">
              <span>Email ID <i>*</i></span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your answer" />
            </label>
            <label className="qf-field">
              <span>Company Name</span>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Your answer" />
            </label>
            <label className="qf-field">
              <span>Company Website</span>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Your answer" />
            </label>

            <div className="qf-field">
              <span>Service Type <i>*</i></span>
              <div className="qf-checks">
                {SERVICES.map((s) => (
                  <label key={s} className="qf-check">
                    <input
                      type="checkbox"
                      checked={services.includes(s)}
                      onChange={() => toggleService(s)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
                {services.includes('Other') && (
                  <input
                    className="qf-other"
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    placeholder="Tell us more"
                  />
                )}
              </div>
            </div>

            <label className="qf-field">
              <span>Describe your project <i>*</i></span>
              <textarea required rows={4} value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} placeholder="Your answer" />
            </label>

            {status === 'error' && (
              <p className="qf-err">Something went wrong. Email surajsharma@sqbpictures.com or WhatsApp +91 90130 82883.</p>
            )}
            <button className="qf-submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
