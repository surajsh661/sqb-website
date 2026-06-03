'use client';
import { useState } from 'react';
import { COPY } from '@/lib/copy';
import { rich } from '@/lib/rich';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactSection({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', org: '', brief: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [hp, setHp] = useState(''); // honeypot — stays empty for humans
  const [openedAt] = useState(() => Date.now());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hp, t: Date.now() - openedAt }),
      });
      if (!res.ok) throw new Error('send failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="contact" id="contact" data-screen-label="11 Contact">
      <div className="contact-inner">
        <div className="contact-left">
          <div className="eyebrow"><span>{COPY.contact.eyebrowLabel}</span></div>
          <h2 className="contact-h">{rich(COPY.contact.heading)}</h2>
          <p className="contact-blurb">{rich(COPY.contact.blurb)}</p>
          <div className="contact-rows">
            <div className="contact-row">
              <span className="k">SURAJ</span>
              <a className="v" href="mailto:surajsharma@sqbpictures.com">SURAJSHARMA@SQBPICTURES.COM</a>
            </div>
            <div className="contact-row">
              <span className="k">SHUBHAM</span>
              <a className="v" href="mailto:shubham.shah@sqbpictures.com">SHUBHAM.SHAH@SQBPICTURES.COM</a>
            </div>
            <div className="contact-row">
              <span className="k">CONTACT</span>
              <a className="v" href="https://wa.me/919013082883" target="_blank" rel="noopener noreferrer">
                +91 90130 82883 · WHATSAPP
              </a>
            </div>
            <div className="contact-row">
              <span className="k">CONTACT</span>
              <a className="v" href="https://wa.me/917217817383" target="_blank" rel="noopener noreferrer">
                +91 72178 17383 · WHATSAPP
              </a>
            </div>
            <div className="contact-row"><span className="k">STUDIOS</span><span className="v">{COPY.contact.studiosValue}</span></div>
          </div>
        </div>
        <form className="contact-form" onSubmit={onSubmit}>
          {/* honeypot — hidden from people, bait for bots */}
          <input
            type="text" name="company_url" tabIndex={-1} autoComplete="off"
            aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)}
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          />
          <div className="cf-row">
            <label>
              <span>{COPY.contact.form.nameLabel}</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={COPY.contact.form.namePlaceholder} />
            </label>
            <label>
              <span>{COPY.contact.form.emailLabel}</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={COPY.contact.form.emailPlaceholder} />
            </label>
          </div>
          <label>
            <span>{COPY.contact.form.orgLabel}</span>
            <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder={COPY.contact.form.orgPlaceholder} />
          </label>
          <label>
            <span>{COPY.contact.form.briefLabel}</span>
            <textarea required rows={4} value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })} placeholder={COPY.contact.form.briefPlaceholder} />
          </label>
          <button type="submit" className="cf-submit" disabled={status === 'sending' || status === 'sent'}>
            {status === 'sending' ? COPY.contact.form.sending
              : status === 'sent' ? COPY.contact.form.sent
              : status === 'error' ? COPY.contact.form.tryAgain
              : COPY.contact.form.submit}
          </button>
          <div className="cf-foot">
            {status === 'error'
              ? COPY.contact.form.footError
              : status === 'sent'
              ? COPY.contact.form.footSent
              : COPY.contact.form.footIdle}
          </div>
        </form>
      </div>
    </section>
  );
}
