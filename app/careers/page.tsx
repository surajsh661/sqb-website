'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Topbar from '@/components/Topbar';
import Loader from '@/components/Loader';
import TicketMenu from '@/components/TicketMenu';
import QuoteForm from '@/components/QuoteForm';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { IconX } from '@/components/Icons';
import { SQB_ROLES, AI_MODELS, type Role } from '@/lib/careers';
import { isValidEmail, isDisposableEmail } from '@/lib/spam';
import { setupReveal } from '@/lib/video-utils';

type Step = 'jd' | 'brief' | 'questions' | 'details' | 'done';
const STEPS: Step[] = ['brief', 'questions', 'details'];

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Academy leader: a real 3 → 2 → 1 countdown, looping. Static under reduced motion. */
function Leader() {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (reduceMotion()) return;
    const id = setInterval(() => setN((p) => (p === 1 ? 3 : p - 1)), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="cr-leader" aria-hidden="true">
      <div className="cr-leader-ring" />
      <div className="cr-leader-cross" />
      {/* keyed so the tick animation replays on every number */}
      <span className="cr-leader-num" key={n}>{n}</span>
    </div>
  );
}

/**
 * A real clapperboard head: the striped slate edge (base) with a hinged stick
 * lying on top of it. The stick's pivot is its LEFT end, so the free RIGHT end
 * swings upward — exactly how a clapper opens.
 */
function Clapper() {
  const STRIPES = 13; // enough to read as a real clapper, not chunky blocks
  const bars = () => Array.from({ length: STRIPES }, (_, k) => <span key={k} />);
  return (
    <div className="cr-clap" aria-hidden="true">
      <div className="cr-clap-base">{bars()}</div>
      <div className="cr-clap-stick">{bars()}</div>
      <span className="cr-clap-hinge" />
    </div>
  );
}

export default function CareersPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<Step>('jd');
  const [filter, setFilter] = useState<'all' | 'creative' | 'operations'>('all');
  // Live roles from the admin-managed store. Seeded with the code roles so the
  // page renders instantly and never breaks if the store is unavailable.
  const [roles, setRoles] = useState<Role[]>(SQB_ROLES);

  useEffect(() => {
    let alive = true;
    fetch('/api/careers/roles')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && Array.isArray(d?.roles)) setRoles(d.roles); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const TABS: { key: 'all' | 'creative' | 'operations'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'creative', label: 'Creative' },
    { key: 'operations', label: 'Operations' },
  ];
  const shownRoles = filter === 'all' ? roles : roles.filter((r) => r.category === filter);

  useEffect(() => { setupReveal(); }, [roles]);

  const openRole = (r: Role) => {
    setRole(r); setStep('jd');
    document.body.style.overflow = 'hidden';
  };
  const closeRole = () => {
    setRole(null); setStep('jd');
    document.body.style.overflow = '';
  };

  useEffect(() => {
    if (!role) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRole(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [role]);

  return (
    <div className="page-shell">
      <Loader />
      <Topbar active="careers" variant="nav" onOpenMenu={() => setMenuOpen(true)} onReachOut={() => setQuoteOpen(true)} />

      {/* ── Hero: a countdown leader ─────────────────────────────────────── */}
      <section className="cr-hero">
        <Leader />
        <div className="cr-rec"><span className="cr-rec-dot" />REC · NOW CASTING</div>
        <h1 className="cr-title">JOIN THE <em>CREW</em></h1>
        <p className="cr-blurb">
          We&apos;re an AI-first film house in Delhi NCR. Filmmakers who happen to be very good with AI —
          generating and cutting at a pace the old pipeline can&apos;t hold.
          We hire on the work, not the r&eacute;sum&eacute;.
        </p>
      </section>

      {/* ── The slates ───────────────────────────────────────────────────── */}
      <section className="cr-roles" id="roles">
        <div className="cr-roles-head">
          <h2>OPEN <em>ROLES</em></h2>
          <span className="cr-count">{String(shownRoles.length).padStart(2, '0')} {shownRoles.length === 1 ? 'POSITION' : 'POSITIONS'}</span>
        </div>

        <div className="cr-filter" role="tablist" aria-label="Filter roles">
          {TABS.map((t) => {
            const n = t.key === 'all' ? roles.length : roles.filter((r) => r.category === t.key).length;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={filter === t.key}
                className={'cr-filter-tab' + (filter === t.key ? ' on' : '')}
                onClick={() => setFilter(t.key)}
              >
                {t.label} <span className="cr-filter-n">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="cr-grid">
          {shownRoles.map((r, i) => (
            <article
              className="cr-slate"
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => openRole(r)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRole(r); } }}
              aria-label={`${r.title} — view role and apply`}
            >
              <Clapper />
              <div className="cr-slate-body">
                <div className="cr-slate-top">
                  <span className="cr-scene">SCENE {String(i + 1).padStart(2, '0')}</span>
                  <span className="cr-dept">{r.dept}</span>
                </div>
                <h3 className="cr-role-title">{r.title}</h3>
                {r.subtitle && <div className="cr-role-sub">{r.subtitle}</div>}
                <p className="cr-lede">{r.lede}</p>
                <dl className="cr-facts">
                  <div><dt>Type</dt><dd>{r.type}</dd></div>
                  <div><dt>Location</dt><dd>{r.location}</dd></div>
                  <div><dt>Experience</dt><dd>{r.experience}</dd></div>
                </dl>
                <span className="cr-open">
                  View role &amp; apply <span aria-hidden="true">→</span>
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className="cr-nofit">
          Don&apos;t see your seat? Send your reel to{' '}
          <a href="mailto:hr@sqbpictures.com?subject=Open%20application">hr@sqbpictures.com</a> anyway.
        </p>
      </section>

      <ContactSection compact />
      <Footer />

      <TicketMenu open={menuOpen} onClose={() => setMenuOpen(false)} onReachOut={() => setQuoteOpen(true)} />
      <QuoteForm open={quoteOpen} onClose={() => setQuoteOpen(false)} />

      {role && typeof document !== 'undefined' &&
        createPortal(
          <RoleSheet role={role} step={step} setStep={setStep} onClose={closeRole} />,
          document.body,
        )}
    </div>
  );
}

/* ── Full-screen role takeover: JD → apply flow ───────────────────────────── */
function RoleSheet({ role, step, setStep, onClose }: {
  role: Role; step: Step; setStep: (s: Step) => void; onClose: () => void;
}) {
  const openedAt = useRef(Date.now());
  const [hp, setHp] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', portfolio: '', resume: '', note: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  // Uploaded résumé PDF (base64). Capped below Vercel's 4.5MB request limit
  // once base64 inflation (~33%) is accounted for.
  const MAX_PDF = 2.5 * 1024 * 1024;
  const [file, setFile] = useState<{ name: string; size: number; data: string } | null>(null);
  const [fileErr, setFileErr] = useState('');
  const [drag, setDrag] = useState(false);

  const takeFile = (f: File | null | undefined) => {
    setFileErr('');
    if (!f) return;
    const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    if (!isPdf) { setFileErr('PDF files only.'); return; }
    if (f.size > MAX_PDF) { setFileErr('That file is over 2.5 MB — compress it, or use a link instead.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result);
      setFile({ name: f.name, size: f.size, data: res.slice(res.indexOf(',') + 1) });
    };
    reader.onerror = () => setFileErr('Could not read that file. Try again.');
    reader.readAsDataURL(f);
  };
  const prettySize = (b: number) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
  // Budget is fetched only once the candidate proceeds to apply — it never ships
  // with the page. `undefined` = not fetched yet.
  const [brief, setBrief] = useState<{ salary: string | null; note: string } | undefined>();

  useEffect(() => {
    if (step !== 'brief' || brief !== undefined) return;
    let alive = true;
    fetch(`/api/careers/brief?role=${encodeURIComponent(role.id)}`)
      .then((r) => (r.ok ? r.json() : { salary: null, note: 'Discussed on the first call.' }))
      .then((b) => { if (alive) setBrief(b); })
      .catch(() => { if (alive) setBrief({ salary: null, note: 'Discussed on the first call.' }); });
    return () => { alive = false; };
  }, [step, brief, role.id]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const answer = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));

  // Client-safe URL check (mirrors the server's isUrlish — no node:dns here).
  const isUrlish = (v: string) => {
    const s = v.trim();
    if (!s || /\s/.test(s)) return false;
    try { const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`); return u.hostname.includes('.'); }
    catch { return false; }
  };
  // Per-question hiring-bar message (numeric `min`). Null while empty.
  const belowBar = (q: (typeof role.questions)[number]) => {
    if (q.kind !== 'number' || q.min == null) return null;
    const raw = (answers[q.id] || '').trim();
    if (raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n < q.min ? `This role is looking for ${q.min}+ years.` : null;
  };
  const questionsOk = role.questions.every((q) => {
    const raw = (answers[q.id] || '').trim();
    if (q.required && raw === '') return false;
    if (q.kind === 'number' && q.min != null && raw !== '' && Number(raw) < q.min) return false;
    return true;
  });

  const submit = async () => {
    setErr('');
    if (!form.name.trim() || !form.email.trim()) return setErr('Name and email are required.');
    if (form.name.trim().length < 2 || !/[a-zA-Z]/.test(form.name)) return setErr('Please enter your real name.');
    if (!isValidEmail(form.email.trim())) return setErr('That email doesn’t look right.');
    if (isDisposableEmail(form.email.trim())) return setErr('Please use a permanent email — temporary inboxes aren’t accepted.');
    if (!form.portfolio.trim()) return setErr('A portfolio or reel link is required — we hire on the work.');
    if (!isUrlish(form.portfolio)) return setErr('Please paste a valid portfolio / reel link (a full URL).');
    if (form.resume.trim() && !isUrlish(form.resume)) return setErr('The résumé link doesn’t look like a valid URL.');

    setBusy(true);
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: role.id, ...form, answers, hp, t: Date.now() - openedAt.current,
          resumeFile: file ? { name: file.name, size: file.size, data: file.data } : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || 'Could not send. Try again in a moment.'); return; }
      setStep('done');
    } catch {
      setErr('Network error. Try again.');
    } finally { setBusy(false); }
  };

  const idx = STEPS.indexOf(step);

  return (
    <div className="cr-sheet" role="dialog" aria-modal="true" aria-label={role.title}>
      <div className="cr-sheet-grain" aria-hidden="true" />
      <button className="cr-sheet-close" onClick={onClose} aria-label="Close"><IconX size={15} /></button>

      {/* timeline scrubber — only during the apply flow */}
      {step !== 'jd' && step !== 'done' && (
        <div className="cr-timeline" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s} className={'cr-tl-frame' + (i <= idx ? ' on' : '')} />
          ))}
          <span className="cr-tc">{`0${idx + 1}:0${STEPS.length}`}</span>
        </div>
      )}

      <div className="cr-sheet-inner">
        {step === 'jd' && (
          <>
            <div className="cr-jd-head">
              <span className="cr-dept">{role.dept}</span>
              <h2 className="cr-jd-title">{role.title}</h2>
              {role.subtitle && <div className="cr-role-sub">{role.subtitle}</div>}
              <div className="cr-jd-facts">
                <span>{role.type}</span><i /><span>{role.location}</span><i /><span>{role.onsite}</span><i /><span>{role.experience}</span>
              </div>
            </div>

            <p className="cr-jd-desc">{role.description}</p>

            {role.responsibilities && (
              <section className="cr-jd-block">
                <h3>What you&apos;ll do</h3>
                <ul>{role.responsibilities.map((x) => <li key={x}>{x}</li>)}</ul>
              </section>
            )}

            <section className="cr-jd-block">
              <h3>{role.responsibilities ? 'What we need' : 'Qualifications'}</h3>
              <ul>{role.qualifications.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>

            {role.bonus && (
              <section className="cr-jd-block">
                <h3>Bonus points</h3>
                <ul>{role.bonus.map((x) => <li key={x}>{x}</li>)}</ul>
              </section>
            )}

            {role.tools && (
              <section className="cr-jd-block">
                <h3>The stack you&apos;ll shoot on</h3>
                <div className="cr-stack tight">
                  {AI_MODELS.map((m) => <span className="cr-chip" key={m}>{m}</span>)}
                </div>
              </section>
            )}

            <div className="cr-cta-row">
              <button className="cr-btn" onClick={() => setStep('brief')}>
                Apply for this role <span aria-hidden="true">→</span>
              </button>
              <span className="cr-cta-hint">Budget is revealed on the next screen.</span>
            </div>
          </>
        )}

        {/* ── Step 1: the clapboard reveals the budget ─────────────────── */}
        {step === 'brief' && (
          <div className="cr-step">
            <div className="cr-step-eyebrow">Step 01 · The brief</div>
            <div className="cr-board">
              <div className="cr-board-clap"><Clapper /></div>
              <div className="cr-board-face">
                <div className="cr-board-row"><span>ROLE</span><b>{role.title}</b></div>
                <div className="cr-board-row"><span>TYPE</span><b>{role.type}</b></div>
                <div className="cr-board-row"><span>UNIT</span><b>{role.location}</b></div>
                <div className="cr-board-row budget">
                  <span>BUDGET</span>
                  {brief === undefined
                    ? <b className="cr-budget loading">— — —</b>
                    : <b className="cr-budget">{brief.salary ?? 'On discussion'}</b>}
                </div>
              </div>
            </div>
            <p className="cr-note">{brief?.note ?? ' '}</p>
            <div className="cr-cta-row">
              <button className="cr-btn ghost" onClick={() => setStep('jd')}>← Back to role</button>
              <button className="cr-btn" onClick={() => setStep('questions')}>Continue <span aria-hidden="true">→</span></button>
            </div>
          </div>
        )}

        {/* ── Step 2: screening questions ──────────────────────────────── */}
        {step === 'questions' && (
          <div className="cr-step">
            <div className="cr-step-eyebrow">Step 02 · A few questions</div>
            <h2 className="cr-step-title">Before we roll</h2>
            <div className="cr-qs">
              {role.questions.map((q) => (
                <div className="cr-q" key={q.id}>
                  <label className="cr-q-label">
                    {q.label}{q.required && <i aria-hidden="true"> *</i>}
                  </label>
                  {q.kind === 'boolean' ? (
                    <div className="cr-pills">
                      {['Yes', 'No'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={'cr-pill' + (answers[q.id] === v ? ' on' : '')}
                          onClick={() => answer(q.id, v)}
                        >{v}</button>
                      ))}
                    </div>
                  ) : q.kind === 'number' ? (
                    <>
                      <div className="cr-num">
                        <input
                          className={'cr-input' + (belowBar(q) ? ' bad' : '')}
                          type="number" min={0} max={50} inputMode="numeric"
                          placeholder={q.placeholder}
                          value={answers[q.id] || ''}
                          onChange={(e) => answer(q.id, e.target.value)}
                        />
                        <span>{q.suffix}</span>
                      </div>
                      {belowBar(q) && <p className="cr-q-bar">{belowBar(q)}</p>}
                    </>
                  ) : (
                    <input
                      className="cr-input"
                      placeholder={q.placeholder}
                      value={answers[q.id] || ''}
                      onChange={(e) => answer(q.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="cr-cta-row">
              <button className="cr-btn ghost" onClick={() => setStep('brief')}>← Back</button>
              <button className="cr-btn" disabled={!questionsOk} onClick={() => setStep('details')}>
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: your details ─────────────────────────────────────── */}
        {step === 'details' && (
          <div className="cr-step">
            <div className="cr-step-eyebrow">Step 03 · Your slate</div>
            <h2 className="cr-step-title">Show us the work</h2>
            <div className="cr-fields">
              <div className="cr-field"><label>Name *</label>
                <input className="cr-input" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
              <div className="cr-field"><label>Email *</label>
                <input className="cr-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
              <div className="cr-field"><label>Phone</label>
                <input className="cr-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
              <div className="cr-field"><label>Portfolio / reel link *</label>
                <input className="cr-input" placeholder="Vimeo, YouTube, Drive, Behance…" value={form.portfolio} onChange={(e) => set('portfolio', e.target.value)} /></div>
              <div className="cr-field wide">
                <label>Résumé <span className="cr-opt">— link or PDF, optional</span></label>
                <input className="cr-input" placeholder="Paste a Drive / Dropbox link…" value={form.resume} onChange={(e) => set('resume', e.target.value)} />
                {!file ? (
                  <label
                    className={'cr-drop' + (drag ? ' over' : '')}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); takeFile(e.dataTransfer.files?.[0]); }}
                  >
                    <input type="file" accept="application/pdf,.pdf" hidden
                      onChange={(e) => { takeFile(e.target.files?.[0]); e.target.value = ''; }} />
                    <svg className="cr-drop-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 16V4M12 4l-4 4M12 4l4 4" /><path d="M5 20h14" />
                    </svg>
                    <span className="cr-drop-t">…or drop your résumé PDF here</span>
                    <span className="cr-drop-s">PDF · up to 2.5 MB</span>
                  </label>
                ) : (
                  <div className="cr-file">
                    <svg className="cr-file-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                    </svg>
                    <span className="cr-file-name">{file.name}</span>
                    <span className="cr-file-size">{prettySize(file.size)}</span>
                    <button type="button" className="cr-file-x" onClick={() => setFile(null)} aria-label="Remove file"><IconX size={13} /></button>
                  </div>
                )}
                {fileErr && <p className="cr-err sm">{fileErr}</p>}
              </div>
              <div className="cr-field wide"><label>Anything else?</label>
                <textarea className="cr-input" rows={4} value={form.note} onChange={(e) => set('note', e.target.value)} /></div>
            </div>

            {/* honeypot — real people never fill this */}
            <input className="cr-hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
              value={hp} onChange={(e) => setHp(e.target.value)} />

            {err && <p className="cr-err">{err}</p>}
            <div className="cr-cta-row">
              <button className="cr-btn ghost" onClick={() => setStep('questions')}>← Back</button>
              <button className="cr-btn" disabled={busy} onClick={submit}>
                {busy ? 'Sending…' : 'Submit application'} <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Done ────────────────────────────────────────────────────── */}
        {step === 'done' && (
          <div className="cr-step cr-done">
            <div className="cr-done-mark" aria-hidden="true">
              <div className="cr-leader-ring" /><div className="cr-leader-cross" />
            </div>
            <div className="cr-step-eyebrow">That&apos;s a take</div>
            <h2 className="cr-step-title">Application received</h2>
            <p className="cr-note">
              Thanks {form.name.split(' ')[0] || 'for applying'} — your application for <b>{role.title}</b> is with us.
              We watch every reel. If it fits, you&apos;ll hear from us within a week.
            </p>
            <div className="cr-cta-row"><button className="cr-btn" onClick={onClose}>Back to roles</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
