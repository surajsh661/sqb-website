'use client';
import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactSection({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', org: '', brief: '' });
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('send failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const eyebrowNum = compact ? '★' : '11';

  return (
    <section className="contact" id="contact" data-screen-label="11 Contact">
      <div className="contact-inner">
        <div className="contact-left">
          <div className="eyebrow"><span className="num">{eyebrowNum}</span> <span>REACH OUT</span></div>
          <h2 className="contact-h">LET&apos;S MAKE <em>SOMETHING</em>.</h2>
          <p className="contact-blurb">
            Pitch us a brief, a brand, a budget — or just a feeling. We&apos;ll come back in 24 hours
            with a treatment or a &quot;this isn&apos;t us&quot;.
          </p>
          <div className="contact-rows">
            <div className="contact-row"><span className="k">EMAIL</span><span className="v">HELLO@SQBPICTURES.COM</span></div>
            <div className="contact-row"><span className="k">DELHI</span><span className="v">+91 90130 82883</span></div>
            <div className="contact-row"><span className="k">MUMBAI</span><span className="v">+91 72178 17383</span></div>
            <div className="contact-row"><span className="k">FOR</span><span className="v">ADS · DVCs · MUSIC VIDEOS · AI FILMS · VERTICALS</span></div>
          </div>
        </div>
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="cf-row">
            <label>
              <span>NAME</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </label>
            <label>
              <span>EMAIL</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@brand.com" />
            </label>
          </div>
          <label>
            <span>BRAND / ORG</span>
            <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="Brand or organization" />
          </label>
          <label>
            <span>BRIEF</span>
            <textarea required rows={4} value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} placeholder="Tell us about the film, the moment, the deadline." />
          </label>
          <button type="submit" className="cf-submit" disabled={status === 'sending' || status === 'sent'}>
            {status === 'sending' ? 'SENDING…'
              : status === 'sent' ? 'SENT — WE’LL BE IN TOUCH ↗'
              : status === 'error' ? 'TRY AGAIN'
              : 'SEND BRIEF →'}
          </button>
          <div className="cf-foot">
            {status === 'error'
              ? 'Could not send right now — email hello@sqbpictures.com directly.'
              : status === 'sent'
              ? 'Brief received. Reply within 24 hours.'
              : 'We read every brief. Replies within 24 hours.'}
          </div>
        </form>
      </div>
    </section>
  );
}
