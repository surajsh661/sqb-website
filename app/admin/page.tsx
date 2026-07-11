'use client';
import { useEffect, useState, useCallback } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

type View = 'loading' | 'setup' | 'login' | 'reset' | 'dash';
type Credit = { role: string; name: string };
type Item = Record<string, any> & { id: string; credits: Credit[]; edited?: boolean };

const MIN_PW = 10;
// The console's name — a director's cutting room, where everything that goes
// public gets shaped. (Rename in one place if you ever want to.)
const CONSOLE_NAME = 'The Cutting Room';

// Bright comic palette — cards cycle through these so the grid reads like a
// sticker wall of colored tiles on the dark studio backdrop.
const CARD_COLORS = ['#FFC93C', '#FF7EB6', '#A98BFF', '#2FD3B6', '#FF6A3D', '#9BE870', '#5AA9FF'];
const cardColor = (i: number) => CARD_COLORS[i % CARD_COLORS.length];

type CaseField = { key: string; label: string; area?: boolean; wide?: boolean; tall?: boolean };
const FIELD_GROUPS: { title: string; fields: CaseField[] }[] = [
  { title: 'The basics', fields: [
    { key: 'title', label: 'Title', wide: true },
    { key: 'category', label: 'Category' },
    { key: 'client', label: 'Client' },
    { key: 'talent', label: 'Talent / Cast' },
    { key: 'year', label: 'Year' },
    { key: 'runtime', label: 'Runtime' },
  ] },
  { title: 'The story', fields: [
    { key: 'lede', label: 'Lede — the one-line summary', area: true, wide: true },
    { key: 'brief', label: 'The Brief', area: true, wide: true, tall: true },
    { key: 'solution', label: 'The Solution', area: true, wide: true, tall: true },
    { key: 'body', label: 'Body / Story', area: true, wide: true, tall: true },
  ] },
  { title: 'Release & impact', fields: [
    { key: 'timeline', label: 'Timeline' },
    { key: 'release', label: 'Release' },
    { key: 'impact', label: 'Impact', area: true, wide: true },
  ] },
];

function pwScore(pw: string): number {
  let s = 0;
  if (pw.length >= MIN_PW) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function AdminPage() {
  const [view, setView] = useState<View>('loading');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const post = useCallback(async (url: string, body?: any) => {
    setBusy(true); setErr('');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || 'Something went wrong.'); return null; }
      return data;
    } catch {
      setErr('Network error. Try again.');
      return null;
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setView(!d.isSetup ? 'setup' : d.isAuthed ? 'dash' : 'login'))
      .catch(() => setView('login'));
  }, []);

  // Let the shell (logo gear) know whether we're signed in.
  useEffect(() => {
    if (view === 'loading') return;
    window.dispatchEvent(new CustomEvent('sqb-admin-auth', { detail: { authed: view === 'dash' } }));
  }, [view]);

  if (view === 'loading') {
    return <div className="adm-card"><div className="adm-brand"><b>S'QB</b> · {CONSOLE_NAME}</div><p className="adm-sub">Rolling…</p></div>;
  }
  if (view === 'dash') return <Dashboard onLogout={() => setView('login')} />;

  return (
    <div className="adm-card">
      {view === 'setup' && <Setup post={post} busy={busy} err={err} onDone={() => setView('dash')} />}
      {view === 'login' && <Login post={post} busy={busy} err={err} onDone={() => setView('dash')} onForgot={() => { setErr(''); setView('reset'); }} />}
      {view === 'reset' && <Reset post={post} busy={busy} err={err} onDone={() => setView('dash')} onBack={() => { setErr(''); setView('login'); }} />}
    </div>
  );
}

function Pips({ pw }: { pw: string }) {
  const s = pwScore(pw);
  return <div className="adm-pips">{[0, 1, 2, 3].map((i) => <div key={i} className={'adm-pip' + (i < s ? ' on' : '')} />)}</div>;
}

// ── First-run: set the one password ──────────────────────────────────────────
function Setup({ post, busy, err, onDone }: any) {
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState(''); const [local, setLocal] = useState('');
  const submit = async () => {
    setLocal('');
    if (pw.length < MIN_PW) return setLocal(`Use at least ${MIN_PW} characters.`);
    if (pw !== pw2) return setLocal('The two passwords don’t match.');
    if (await post('/api/admin/setup', { password: pw })) onDone();
  };
  return (
    <>
      <div className="adm-brand"><b>S'QB</b> · {CONSOLE_NAME}</div>
      <h1 className="adm-title">Set your password</h1>
      <p className="adm-sub">First time here. Choose the password you'll use to manage your case studies. There's only one account — yours.</p>
      <div className="adm-field">
        <label className="adm-label">New password</label>
        <input className="adm-input" type="password" value={pw} autoFocus onChange={(e) => setPw(e.target.value)} placeholder={`At least ${MIN_PW} characters`} />
        <Pips pw={pw} />
      </div>
      <div className="adm-field">
        <label className="adm-label">Confirm password</label>
        <input className="adm-input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      </div>
      {(local || err) && <p className="adm-msg err">{local || err}</p>}
      <div className="adm-actions">
        <button className="adm-btn" disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Create password & enter'}</button>
      </div>
      <p className="adm-note">You can reset this any time with a code sent to your email.</p>
    </>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ post, busy, err, onDone, onForgot }: any) {
  const [pw, setPw] = useState('');
  const submit = async () => { if (await post('/api/admin/login', { password: pw })) onDone(); };
  return (
    <>
      <div className="adm-brand"><b>S'QB</b> · {CONSOLE_NAME}</div>
      <h1 className="adm-title">Welcome back</h1>
      <p className="adm-sub">Enter your password to manage your case studies.</p>
      <div className="adm-field">
        <label className="adm-label">Password</label>
        <input className="adm-input" type="password" value={pw} autoFocus onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      </div>
      {err && <p className="adm-msg err">{err}</p>}
      <div className="adm-actions">
        <button className="adm-btn" disabled={busy} onClick={submit}>{busy ? 'Checking…' : 'Log in'}</button>
      </div>
      <div className="adm-foot">
        <button className="adm-link" onClick={onForgot}>Forgot password?</button>
      </div>
    </>
  );
}

// ── Reset via emailed code ────────────────────────────────────────────────────
function Reset({ post, busy, err, onDone, onBack }: any) {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [code, setCode] = useState(''); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [local, setLocal] = useState(''); const [hint, setHint] = useState('');

  const request = async () => {
    const d = await post('/api/admin/reset-request');
    if (d) { setStep('confirm'); if (d.devCode) setHint(`Dev code: ${d.devCode}`); }
  };
  const confirm = async () => {
    setLocal('');
    if (pw.length < MIN_PW) return setLocal(`Use at least ${MIN_PW} characters.`);
    if (pw !== pw2) return setLocal('The two passwords don’t match.');
    if (await post('/api/admin/reset-confirm', { code: code.trim(), password: pw })) onDone();
  };

  return (
    <>
      <div className="adm-brand"><b>S'QB</b> · {CONSOLE_NAME}</div>
      <h1 className="adm-title">Reset password</h1>
      {step === 'request' ? (
        <>
          <p className="adm-sub">We'll email a one-time 6-digit code to your address on file. It works once and expires in 15 minutes.</p>
          {err && <p className="adm-msg err">{err}</p>}
          <div className="adm-actions">
            <button className="adm-btn" disabled={busy} onClick={request}>{busy ? 'Sending…' : 'Email me a reset code'}</button>
          </div>
        </>
      ) : (
        <>
          <p className="adm-sub">Enter the 6-digit code from your email, then choose a new password.</p>
          <div className="adm-field">
            <label className="adm-label">Reset code</label>
            <input className="adm-input code" inputMode="numeric" maxLength={6} value={code} autoFocus onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••" />
            {hint && <p className="adm-msg ok">{hint}</p>}
          </div>
          <div className="adm-field">
            <label className="adm-label">New password</label>
            <input className="adm-input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Pips pw={pw} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Confirm new password</label>
            <input className="adm-input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirm()} />
          </div>
          {(local || err) && <p className="adm-msg err">{local || err}</p>}
          <div className="adm-actions">
            <button className="adm-btn" disabled={busy} onClick={confirm}>{busy ? 'Saving…' : 'Set new password & enter'}</button>
          </div>
        </>
      )}
      <div className="adm-foot"><button className="adm-link" onClick={onBack}>← Back to login</button></div>
    </>
  );
}

// ── Dashboard / case-study editor ─────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<Item | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [store, setStore] = useState<string>('');
  const [section, setSection] = useState<'overview' | 'cases' | 'careers'>('overview');
  const [caseView, setCaseView] = useState<'grid' | 'edit'>('grid');

  useEffect(() => {
    fetch('/api/admin/session').then((r) => r.json()).then((d) => setStore(d.store || ''));
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((d) => { setItems(d.items || []); });
  }, []);

  const pick = (id: string) => {
    setStatus('');
    const it = items.find((x) => x.id === id);
    setForm(it ? structuredClone(it) : null);
  };
  const setField = (k: string, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const setCredit = (i: number, k: 'role' | 'name', v: string) =>
    setForm((f) => { if (!f) return f; const credits = [...f.credits]; credits[i] = { ...credits[i], [k]: v }; return { ...f, credits }; });
  const addCredit = () => setForm((f) => (f ? { ...f, credits: [...f.credits, { role: '', name: '' }] } : f));
  const rmCredit = (i: number) => setForm((f) => (f ? { ...f, credits: f.credits.filter((_, j) => j !== i) } : f));

  const save = async () => {
    if (!form) return;
    setBusy(true); setStatus('');
    const { id, edited, ...fields } = form;
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, fields }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setStatus('Saved ✓'); setItems((xs) => xs.map((x) => (x.id === id ? { ...form, edited: true } : x))); }
      else setStatus(d.error || 'Save failed');
    } catch { setStatus('Network error'); }
    finally { setBusy(false); }
  };

  const logout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); onLogout(); };

  // Entering a section always lands on its card grid, not a stale open editor.
  const go = (s: 'overview' | 'cases' | 'careers') => { if (s === 'cases') setCaseView('grid'); setSection(s); };

  return (
    <div className="adm-card wide">
      <div className="adm-head">
        <div className="adm-nav">
          <button className={'adm-tab' + (section === 'overview' ? ' on' : '')} onClick={() => go('overview')}>Overview</button>
          <button className={'adm-tab' + (section === 'cases' ? ' on' : '')} onClick={() => go('cases')}>Case Studies</button>
          <button className={'adm-tab' + (section === 'careers' ? ' on' : '')} onClick={() => go('careers')}>Careers</button>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className={'adm-badge ' + (store === 'kv' ? 'live' : 'draft')}>{store === 'kv' ? 'Live DB' : 'Local draft'}</span>
          <button className="adm-btn ghost" style={{ width: 'auto', padding: '9px 16px' }} onClick={logout}>Log out</button>
        </div>
      </div>

      {section === 'overview' && <Overview items={items} store={store} onGo={go} />}
      {section === 'careers' && <CareersAdmin />}
      {section === 'cases' && (caseView === 'grid' ? (
        <>
          <div className="adm-sechead">
            <h2 className="adm-sechead-t">Case <em>studies</em></h2>
            <span className="adm-sechead-c">{items.length} in the reel · tap one to edit</span>
          </div>
          {items.length === 0
            ? <p className="adm-sub">No case studies loaded yet.</p>
            : (
              <div className="adm-grid">
                {items.map((it, i) => (
                  <button className="adm-pick" key={it.id} style={{ '--c': cardColor(i) } as React.CSSProperties}
                    onClick={() => { pick(it.id); setCaseView('edit'); }}>
                    <span className="adm-pick-tag">{it.category || 'Case study'}</span>
                    <span className="adm-pick-title">{it.title}</span>
                    {it.edited && <span className="adm-pick-badge edited">edited</span>}
                  </button>
                ))}
              </div>
            )}
        </>
      ) : form && (
        <>
          <button className="adm-back" onClick={() => setCaseView('grid')}>← All case studies</button>
          <h2 className="adm-editing-title">Editing <em>{form.title || 'case study'}</em></h2>

          {FIELD_GROUPS.map((g) => (
            <section key={g.title}>
              <div className="adm-subhead">{g.title}</div>
              <div className="adm-fieldgrid">
                {g.fields.map((f) => (
                  <div className={'adm-field' + (f.wide ? ' wide' : '')} key={f.key}>
                    <label className="adm-label">{f.label}</label>
                    {f.area
                      ? <textarea className={'adm-textarea' + (f.tall ? ' tall' : '')} value={form[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} />
                      : <input className="adm-input" value={form[f.key] || ''} onChange={(e) => setField(f.key, e.target.value)} />}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="adm-subhead">Credits</div>
          <p className="adm-hint">Add a row for each role — Director, DOP, Editor, and so on.</p>
          <div className="adm-credits">
            {form.credits.map((c, i) => (
              <div className="adm-credit-row" key={i}>
                <input className="adm-input" placeholder="ROLE (e.g. DIRECTOR)" value={c.role} onChange={(e) => setCredit(i, 'role', e.target.value)} />
                <input className="adm-input" placeholder="Name" value={c.name} onChange={(e) => setCredit(i, 'name', e.target.value)} />
                <button className="adm-icon-btn" title="Remove" onClick={() => rmCredit(i)}>×</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}><button className="adm-btn ghost" style={{ width: 'auto', padding: '9px 16px' }} onClick={addCredit}>+ Add credit</button></div>

          <div className="adm-divider" />
          <div className="adm-row">
            <button className="adm-btn" style={{ flex: '0 0 auto', minWidth: 200 }} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
            {status && <span className={'adm-msg ' + (status.includes('✓') ? 'ok' : 'err')} style={{ marginLeft: 4 }}>{status}</span>}
          </div>
        </>
      ))}
    </div>
  );
}

/* ── Overview: the control-room landing ───────────────────────────────────── */
function Overview({ items, store, onGo }: { items: Item[]; store: string; onGo: (s: 'cases' | 'careers') => void }) {
  const [roles, setRoles] = useState<any[]>([]);
  useEffect(() => { fetch('/api/admin/careers').then((r) => r.json()).then((d) => setRoles(d.roles || [])).catch(() => {}); }, []);

  const openRoles = roles.filter((r) => r.open);
  const editedN = items.filter((i) => i.edited).length;
  const stats: { k: string; v: React.ReactNode; sub: string; small?: boolean }[] = [
    { k: 'Case studies', v: items.length, sub: editedN ? `${editedN} edited by you` : 'in the reel' },
    { k: 'Open roles', v: openRoles.length, sub: 'live & hiring' },
    { k: 'Closed roles', v: roles.length - openRoles.length, sub: 'paused' },
    { k: 'Publishing', v: store === 'kv' ? 'LIVE' : 'DRAFT', sub: store === 'kv' ? 'database connected' : 'local only', small: true },
  ];

  return (
    <div className="adm-over">
      <div className="adm-over-hero">
        <div className="adm-over-eyebrow"><span className="adm-rec" />Studio online</div>
        <h2 className="adm-over-title">Roll <em>camera</em>.</h2>
        <p className="adm-over-sub">Everything the world sees, you shape from here — and it goes live the moment you save.</p>
      </div>

      <div className="adm-stats">
        {stats.map((s) => (
          <div className={'adm-stat' + (s.small ? ' sm' : '')} key={s.k}>
            <div className="adm-stat-v">{s.v}</div>
            <div className="adm-stat-k">{s.k}</div>
            <div className="adm-stat-s">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="adm-quick">
        <button className="adm-action" onClick={() => onGo('careers')}>
          <span className="adm-action-ic">＋</span>
          <span className="adm-action-t"><b>Post / manage a job</b><i>Open, close, edit listings</i></span>
        </button>
        <button className="adm-action" onClick={() => onGo('cases')}>
          <span className="adm-action-ic">✎</span>
          <span className="adm-action-t"><b>Edit a case study</b><i>Copy, credits, impact</i></span>
        </button>
        <a className="adm-action" href="/careers" target="_blank" rel="noopener noreferrer">
          <span className="adm-action-ic">↗</span>
          <span className="adm-action-t"><b>View careers page</b><i>See it as the world does</i></span>
        </a>
        <a className="adm-action" href="/" target="_blank" rel="noopener noreferrer">
          <span className="adm-action-ic">↗</span>
          <span className="adm-action-t"><b>View live site</b><i>sqbpictures.com</i></span>
        </a>
      </div>

      {openRoles.length > 0 && (
        <div className="adm-live">
          <div className="adm-live-head"><span className="adm-rec" />Now casting</div>
          <div className="adm-live-list">
            {openRoles.map((r) => (
              <button key={r.id} className="adm-live-chip" onClick={() => onGo('careers')}>{r.title}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Careers manager: add / edit / delete job listings ────────────────────── */
type QKind = 'boolean' | 'number' | 'text';
interface AdminQ { id: string; label: string; kind: QKind; required?: boolean; min?: number; placeholder?: string }
interface AdminRole {
  id: string; title: string; subtitle?: string; category: 'creative' | 'operations';
  dept: string; type: string; location: string; onsite: string; experience: string;
  lede: string; description: string;
  responsibilities?: string[]; qualifications: string[]; bonus?: string[];
  tools: boolean; questions: AdminQ[];
  datePosted: string; validThrough: string;
  salary: string | null; salaryNote: string; open: boolean;
}

const blankRole = (): AdminRole => ({
  id: '', title: '', category: 'creative', dept: 'Team', type: 'Full Time',
  location: 'Delhi NCR', onsite: 'On-site', experience: '', lede: '', description: '',
  qualifications: [''], tools: false, questions: [], datePosted: '2026-07-01', validThrough: '2027-06-30',
  salary: '', salaryNote: '', open: true,
});

const TEXT_ROWS: [keyof AdminRole, string][] = [
  ['title', 'Job title'], ['subtitle', 'Subtitle (optional)'], ['dept', 'Department'],
  ['type', 'Type — Contract / Full Time'], ['location', 'Location'],
  ['onsite', 'On-site / remote line'], ['experience', 'Experience line'],
  ['lede', 'One-line hook (lede)'],
];
const LIST_ROWS: [keyof AdminRole, string][] = [
  ['qualifications', 'Requirements — one per line'],
  ['responsibilities', 'Responsibilities — one per line (optional)'],
  ['bonus', 'Bonus points — one per line (optional)'],
];

function CareersAdmin() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [form, setForm] = useState<AdminRole | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'grid' | 'edit'>('grid');

  const load = async () => {
    const d = await fetch('/api/admin/careers').then((r) => r.json()).catch(() => ({}));
    const rs: AdminRole[] = (d.roles || []).map((r: any) => ({ ...r, salary: r.salary ?? '' }));
    setRoles(rs);
  };
  useEffect(() => { load(); }, []);

  const openRole = (id: string) => {
    setStatus('');
    if (id === '__new__') { setForm(blankRole()); setIsNew(true); setView('edit'); return; }
    const r = roles.find((x) => x.id === id);
    setForm(r ? structuredClone(r) : null); setIsNew(false); setView('edit');
  };
  const backToGrid = () => { setView('grid'); setStatus(''); load(); };
  const set = (k: keyof AdminRole, v: any) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const listVal = (arr?: string[]) => (arr || []).join('\n');
  const setList = (k: keyof AdminRole, text: string) =>
    set(k, text.split('\n').map((s) => s.replace(/\s+$/, '')).filter((s, i, a) => s.trim() !== '' || i < a.length));

  const setQ = (i: number, patch: Partial<AdminQ>) =>
    setForm((f) => { if (!f) return f; const questions = [...f.questions]; questions[i] = { ...questions[i], ...patch }; return { ...f, questions }; });
  const addQ = () => setForm((f) => (f ? { ...f, questions: [...f.questions, { id: `q${f.questions.length + 1}`, label: '', kind: 'boolean', required: true }] } : f));
  const rmQ = (i: number) => setForm((f) => (f ? { ...f, questions: f.questions.filter((_, j) => j !== i) } : f));

  const save = async () => {
    if (!form) return;
    setBusy(true); setStatus('');
    const role = { ...form, salary: (form.salary || '').trim() || null };
    try {
      const res = await fetch('/api/admin/careers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, isNew }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setStatus('Saved ✓'); await load(); if (d.role) { setForm(structuredClone({ ...d.role, salary: d.role.salary ?? '' })); setIsNew(false); } }
      else setStatus(d.error || 'Save failed');
    } catch { setStatus('Network error'); }
    finally { setBusy(false); }
  };
  const del = async () => {
    if (!form || isNew) { backToGrid(); return; }
    if (!window.confirm(`Delete “${form.title}”? This removes the listing from the site for good.`)) return;
    setBusy(true); setStatus('');
    try {
      const res = await fetch('/api/admin/careers?id=' + encodeURIComponent(form.id), { method: 'DELETE' });
      if (res.ok) { await load(); setView('grid'); } else setStatus('Delete failed');
    } catch { setStatus('Network error'); }
    finally { setBusy(false); }
  };

  if (view === 'grid') {
    const openN = roles.filter((r) => r.open).length;
    return (
      <>
        <div className="adm-sechead">
          <h2 className="adm-sechead-t">Job <em>listings</em></h2>
          <span className="adm-sechead-c">{openN} open · {roles.length} total</span>
        </div>
        <div className="adm-grid">
          {roles.map((r, i) => (
            <button className="adm-pick" key={r.id} style={{ '--c': cardColor(i) } as React.CSSProperties} onClick={() => openRole(r.id)}>
              <span className="adm-pick-tag">{r.category}</span>
              <span className="adm-pick-title">{r.title}</span>
              <span className={'adm-pick-badge ' + (r.open ? 'open' : 'closed')}>{r.open ? 'Open' : 'Closed'}</span>
            </button>
          ))}
          <button className="adm-pick new" onClick={() => openRole('__new__')}>
            <span className="adm-pick-title">＋ New job</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <button className="adm-back" onClick={backToGrid}>← All jobs</button>
      <h2 className="adm-editing-title">{isNew ? <>New <em>job</em></> : <>Editing <em>{form?.title || 'job'}</em></>}</h2>

      {form && (
        <>
          <div className="adm-subhead">Status &amp; category</div>
          <div className="adm-fieldgrid">
            <div className="adm-field">
              <label className="adm-label">Status</label>
              <div className="cr-adm-pills">
                <button type="button" className={'adm-pill' + (form.open ? ' on' : '')} onClick={() => set('open', true)}>Open</button>
                <button type="button" className={'adm-pill' + (!form.open ? ' off' : '')} onClick={() => set('open', false)}>Closed</button>
              </div>
            </div>
            <div className="adm-field">
              <label className="adm-label">Category</label>
              <select className="adm-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="creative">Creative</option>
                <option value="operations">Operations</option>
              </select>
            </div>
          </div>
          <p className="adm-hint">Closed listings drop off the careers page and stop accepting applications.</p>

          <div className="adm-subhead">The basics</div>
          <div className="adm-fieldgrid">
            {TEXT_ROWS.map(([k, l]) => (
              <div className={'adm-field' + (k === 'lede' ? ' wide' : '')} key={k}>
                <label className="adm-label">{l}</label>
                <input className="adm-input" value={(form[k] as string) || ''} onChange={(e) => set(k, e.target.value)} />
              </div>
            ))}
          </div>

          <div className="adm-subhead">The role</div>
          <div className="adm-field wide">
            <label className="adm-label">Description</label>
            <textarea className="adm-textarea tall" rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="adm-fieldgrid">
            {LIST_ROWS.map(([k, l]) => (
              <div className="adm-field" key={k}>
                <label className="adm-label">{l}</label>
                <textarea className="adm-textarea" rows={4} value={listVal(form[k] as string[])} onChange={(e) => setList(k, e.target.value)} />
              </div>
            ))}
          </div>
          <div className="adm-field" style={{ marginTop: 14 }}>
            <label className="adm-label" style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 14 }}>
              <input type="checkbox" checked={form.tools} onChange={(e) => set('tools', e.target.checked)} />
              Show the AI-model stack chips on this role
            </label>
          </div>

          <div className="adm-subhead">Budget</div>
          <div className="adm-fieldgrid">
            <div className="adm-field">
              <label className="adm-label">Revealed only when someone applies</label>
              <input className="adm-input" placeholder="₹25,000 – ₹30,000 / month   (blank = “on discussion”)" value={form.salary || ''} onChange={(e) => set('salary', e.target.value)} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Budget note</label>
              <input className="adm-input" placeholder="Contract engagement, paid monthly." value={form.salaryNote} onChange={(e) => set('salaryNote', e.target.value)} />
            </div>
          </div>

          <div className="adm-subhead">Screening questions</div>
          <p className="adm-hint">Asked as the candidate applies. “Years” questions can set a minimum bar that blocks under-qualified applicants.</p>
          <div className="cr-adm-qs">
              {form.questions.map((q, i) => (
                <div className="cr-adm-q" key={i}>
                  <input className="adm-input" placeholder="Question…" value={q.label} onChange={(e) => setQ(i, { label: e.target.value })} />
                  <div className="cr-adm-qrow">
                    <select className="adm-select" value={q.kind} onChange={(e) => setQ(i, { kind: e.target.value as QKind })}>
                      <option value="boolean">Yes / No</option>
                      <option value="number">Years</option>
                      <option value="text">Text</option>
                    </select>
                    {q.kind === 'number' && (
                      <label className="cr-adm-min">min&nbsp;<input className="adm-input" type="number" min={0} max={50} value={q.min ?? ''} onChange={(e) => setQ(i, { min: e.target.value === '' ? undefined : Number(e.target.value) })} />&nbsp;yrs</label>
                    )}
                    <label className="cr-adm-req"><input type="checkbox" checked={!!q.required} onChange={(e) => setQ(i, { required: e.target.checked })} />&nbsp;required</label>
                    <button type="button" className="adm-icon-btn" title="Remove" onClick={() => rmQ(i)}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}><button type="button" className="adm-btn ghost" style={{ width: 'auto', padding: '9px 16px' }} onClick={addQ}>+ Add question</button></div>

          <div className="adm-divider" />
          <div className="adm-row" style={{ justifyContent: 'space-between' }}>
            <button className="adm-btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : (isNew ? 'Create job' : 'Save changes')}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {status && <span className={'adm-msg ' + (status.includes('✓') || status === 'Deleted' ? 'ok' : 'err')}>{status}</span>}
              {!isNew && <button className="adm-btn ghost" style={{ width: 'auto', padding: '9px 16px', color: '#ff8a6a' }} disabled={busy} onClick={del}>Delete job</button>}
            </div>
          </div>
        </>
      )}
    </>
  );
}
