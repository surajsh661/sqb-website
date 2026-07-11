'use client';
import { useEffect, useState, useCallback } from 'react';

/* Dark studio shell: the S'QB logo, a settings gear badge over it, and a
   self-contained Settings sheet. The gear only appears once you're signed in.
   AdminPage broadcasts a `sqb-admin-auth` event whenever auth changes so the
   gear can show/hide without a reload. */

const MIN_PW = 10;

function Gear() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function ThemeShell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [store, setStore] = useState('');
  const [open, setOpen] = useState(false);

  const refresh = useCallback(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => { setAuthed(!!d.isAuthed); setStore(d.store || ''); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const onAuth = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d && typeof d.authed === 'boolean') { setAuthed(d.authed); if (!d.authed) setOpen(false); }
      refresh();
    };
    window.addEventListener('sqb-admin-auth', onAuth as EventListener);
    return () => window.removeEventListener('sqb-admin-auth', onAuth as EventListener);
  }, [refresh]);

  return (
    <div className="adm-root">
      <div className="adm-stack">
        <div className="adm-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="adm-logo" src="/logo-admin-dark.png" alt="S'QB Pictures" />
          {authed && (
            <button className="adm-gear" onClick={() => setOpen(true)} aria-label="Settings" title="Settings">
              <Gear />
            </button>
          )}
        </div>
        {children}
      </div>
      {open && <SettingsSheet store={store} onClose={() => setOpen(false)} />}
    </div>
  );
}

/* ── Settings sheet ─────────────────────────────────────────────────────── */
function SettingsSheet({ store, onClose }: { store: string; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pwOpen, setPwOpen] = useState(false);
  const [step, setStep] = useState<'idle' | 'code'>('idle');
  const [hint, setHint] = useState('');
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const post = async (url: string, body?: unknown) => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(d.error || 'Something went wrong.'); return null; }
      return d;
    } catch { setErr('Network error.'); return null; }
    finally { setBusy(false); }
  };

  const requestCode = async () => {
    const d = await post('/api/admin/reset-request');
    if (d) { setStep('code'); setMsg('We emailed a 6-digit code to your address on file.'); if (d.devCode) setHint(`Dev code: ${d.devCode}`); }
  };
  const confirmChange = async () => {
    setErr('');
    if (pw.length < MIN_PW) { setErr(`Use at least ${MIN_PW} characters.`); return; }
    if (pw !== pw2) { setErr('The two passwords don’t match.'); return; }
    const d = await post('/api/admin/reset-confirm', { code: code.trim(), password: pw });
    if (d) { setMsg('Password updated ✓'); setPwOpen(false); setStep('idle'); setCode(''); setPw(''); setPw2(''); setHint(''); }
  };
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    window.dispatchEvent(new CustomEvent('sqb-admin-auth', { detail: { authed: false } }));
    window.location.reload();
  };

  return (
    <div className="adm-modal-scrim" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="adm-modal-head">
          <div>
            <div className="adm-brand"><b>S&apos;QB</b> · Settings</div>
            <h2 className="adm-modal-title">The Cutting <em>Room</em></h2>
          </div>
          <button className="adm-modal-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="adm-set-row">
          <span className="adm-set-k">Publishing</span>
          <span className={'adm-badge ' + (store === 'kv' ? 'live' : 'draft')}>{store === 'kv' ? 'Live DB' : 'Local draft'}</span>
        </div>
        <div className="adm-set-row">
          <span className="adm-set-k">Your pages</span>
          <span className="adm-set-links">
            <a className="adm-link" href="/" target="_blank" rel="noopener noreferrer">Live site ↗</a>
            <a className="adm-link" href="/careers" target="_blank" rel="noopener noreferrer">Careers ↗</a>
          </span>
        </div>

        <div className="adm-divider" />

        {!pwOpen ? (
          <button className="adm-btn ghost" onClick={() => { setPwOpen(true); setMsg(''); setErr(''); }}>Change password</button>
        ) : (
          <div className="adm-set-pw">
            <div className="adm-set-k" style={{ marginBottom: 10 }}>Change password</div>
            {step === 'idle' ? (
              <>
                <p className="adm-hint">We&apos;ll email a one-time 6-digit code to your address on file.</p>
                <button className="adm-btn" disabled={busy} onClick={requestCode}>{busy ? 'Sending…' : 'Email me a code'}</button>
              </>
            ) : (
              <>
                <div className="adm-field">
                  <label className="adm-label">Reset code</label>
                  <input className="adm-input code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••" />
                  {hint && <p className="adm-msg ok">{hint}</p>}
                </div>
                <div className="adm-field">
                  <label className="adm-label">New password</label>
                  <input className="adm-input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={`At least ${MIN_PW} characters`} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Confirm new password</label>
                  <input className="adm-input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmChange()} />
                </div>
                <button className="adm-btn" disabled={busy} onClick={confirmChange}>{busy ? 'Saving…' : 'Set new password'}</button>
              </>
            )}
            <button className="adm-link" style={{ marginTop: 10 }} onClick={() => { setPwOpen(false); setStep('idle'); setErr(''); }}>Cancel</button>
          </div>
        )}

        {(msg || err) && <p className={'adm-msg ' + (err ? 'err' : 'ok')} style={{ marginTop: 12 }}>{err || msg}</p>}

        <div className="adm-divider" />
        <button className="adm-btn" style={{ background: '#2a2a32', color: 'var(--fg)' }} onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
