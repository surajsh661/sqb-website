import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isValidEmail, isDisposableEmail } from '@/lib/spam';
import { domainCanReceiveMail, isUrlish } from '@/lib/email-verify';
import { roleById } from '@/lib/careers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  roleId?: string;
  name?: string;
  email?: string;
  phone?: string;
  portfolio?: string;
  resume?: string;
  note?: string;
  answers?: Record<string, string>;
  resumeFile?: { name?: string; size?: number; data?: string }; // base64 PDF
  hp?: string;   // honeypot — must stay empty
  t?: number;    // ms spent on the form
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const ALLOWED_ORIGINS = new Set([
  'https://sqbpictures.com',
  'https://www.sqbpictures.com',
  'http://localhost:3000',
]);
const originAllowed = (req: Request) => {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const h = new URL(origin).hostname;
    return h.startsWith('sqb-website') && h.endsWith('.vercel.app');
  } catch { return false; }
};

// `x-real-ip` is set by Vercel and not client-settable.
const clientIp = (req: Request) =>
  req.headers.get('x-real-ip')?.trim() ||
  (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim() ||
  'unknown';

const hits = new Map<string, { n: number; t: number }>();
const RATE_WINDOW_MS = 15 * 60 * 1000;
// Generous on purpose: applicants often share one NAT'd IP (an office, a
// college, a co-working floor). The honeypot + time-trap do the anti-bot work.
const RATE_MAX = 15;
const rateLimited = (req: Request) => {
  const ip = clientIp(req);
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.t > RATE_WINDOW_MS) { hits.set(ip, { n: 1, t: now }); return false; }
  cur.n += 1;
  if (hits.size > 5000) { for (const [k, v] of hits) if (now - v.t > RATE_WINDOW_MS) hits.delete(k); }
  return cur.n > RATE_MAX;
};

const clamp = (s: string, n: number) => s.slice(0, n);

export async function POST(req: Request) {
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (rateLimited(req)) {
    return NextResponse.json({ error: 'Too many applications from this network. Try again later.' }, { status: 429 });
  }

  let payload: Body;
  try { payload = (await req.json()) as Body; } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // Honeypot + time-trap: pretend success so bots learn nothing, send nothing.
  if ((payload.hp || '').trim()) return NextResponse.json({ ok: true });
  if (typeof payload.t === 'number' && payload.t > 0 && payload.t < 2500) return NextResponse.json({ ok: true });

  const role = roleById((payload.roleId || '').trim());
  if (!role) return NextResponse.json({ error: 'Unknown role.' }, { status: 400 });

  const name = clamp((payload.name || '').trim(), 120);
  const email = clamp((payload.email || '').trim(), 160);
  const phone = clamp((payload.phone || '').trim(), 40);
  const portfolio = clamp((payload.portfolio || '').trim(), 500);
  const resume = clamp((payload.resume || '').trim(), 500);
  const note = clamp((payload.note || '').trim(), 4000);

  if (!name || !email) return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  if (name.length < 2 || !/[a-zA-Z]/.test(name)) {
    return NextResponse.json({ error: 'Please enter your real name.' }, { status: 400 });
  }
  if (!isValidEmail(email)) return NextResponse.json({ error: 'That email doesn’t look right.' }, { status: 400 });
  if (isDisposableEmail(email)) {
    return NextResponse.json({ error: 'Please use a permanent email — temporary inboxes aren’t accepted.' }, { status: 400 });
  }
  // Real-domain check: reject addresses whose domain can't receive mail (fail
  // OPEN on a transient DNS error so a genuine applicant is never blocked).
  if ((await domainCanReceiveMail(email)) === false) {
    return NextResponse.json({ error: 'That email address doesn’t look reachable — please check it.' }, { status: 400 });
  }
  // Portfolio / reel must be a real link, not free text.
  if (!portfolio) return NextResponse.json({ error: 'A portfolio or reel link is required.' }, { status: 400 });
  if (!isUrlish(portfolio)) {
    return NextResponse.json({ error: 'Please paste a valid portfolio / reel link (a full URL).' }, { status: 400 });
  }
  if (resume && !isUrlish(resume)) {
    return NextResponse.json({ error: 'The résumé link doesn’t look like a valid URL.' }, { status: 400 });
  }

  // Enforce the hiring bar: every numeric question with a `min` must be met.
  for (const q of role.questions) {
    if (q.kind !== 'number' || q.min == null) continue;
    const raw = String((payload.answers || {})[q.id] ?? '').trim();
    const n = Number(raw);
    if (raw === '' || !Number.isFinite(n) || n < q.min) {
      return NextResponse.json(
        { error: `This role needs at least ${q.min} years — ${q.label.replace(/^How many years of experience do you have with /i, '').replace(/\?$/, '')}.` },
        { status: 400 },
      );
    }
  }

  // Only answers to THIS role's questions, clamped.
  const answers = role.questions.map((q) => ({
    q: q.label,
    a: clamp(String((payload.answers || {})[q.id] ?? '').trim(), 300) || '—',
  }));

  // Optional résumé PDF upload. Validated hard: real PDF magic bytes + size cap
  // (kept under Vercel's 4.5MB request limit after base64 inflation).
  let attachment: { filename: string; content: Buffer } | null = null;
  const rf = payload.resumeFile;
  if (rf && typeof rf.data === 'string' && rf.data.trim()) {
    if (rf.data.length > 3_600_000) { // ~2.6MB decoded
      return NextResponse.json({ error: 'Résumé file is too large (max 2.5 MB).' }, { status: 400 });
    }
    let buf: Buffer;
    try { buf = Buffer.from(rf.data, 'base64'); } catch {
      return NextResponse.json({ error: 'Could not read the résumé file.' }, { status: 400 });
    }
    if (buf.length < 5 || buf.subarray(0, 4).toString('latin1') !== '%PDF') {
      return NextResponse.json({ error: 'That résumé file is not a valid PDF.' }, { status: 400 });
    }
    // Sanitise the filename; force a .pdf extension.
    const base = (rf.name || 'resume').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.pdf$/i, '').slice(0, 60) || 'resume';
    const safeName = `${name.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40) || 'applicant'}--${base}.pdf`;
    attachment = { filename: safeName, content: buf };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.CAREERS_TO || 'hr@sqbpictures.com')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const from = process.env.CONTACT_FROM || "S'QB Careers <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn('[careers] no RESEND_API_KEY — application not emailed:', role.title, email);
    return NextResponse.json({ ok: true });
  }

  const row = (k: string, v: string) =>
    `<tr><td style="padding:7px 14px 7px 0;color:#b5ae9f;font-size:12px;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td>
      <td style="padding:7px 0;color:#f4ecdb;font-size:14px">${v}</td></tr>`;

  const html = `<div style="font-family:Inter,Arial,sans-serif;background:#0E0E0E;color:#F4ECDB;padding:28px;border-radius:12px;max-width:640px">
    <div style="font-size:11px;letter-spacing:.24em;color:#B5AE9F;text-transform:uppercase">S'QB Pictures · Application</div>
    <h1 style="font-size:22px;margin:10px 0 4px;color:#F5C518">${escapeHtml(role.title)}</h1>
    <div style="color:#8d877a;font-size:13px;margin-bottom:18px">${escapeHtml(role.type)} · ${escapeHtml(role.location)}</div>
    <table style="border-collapse:collapse;width:100%">
      ${row('Name', escapeHtml(name))}
      ${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#f4ecdb">${escapeHtml(email)}</a>`)}
      ${phone ? row('Phone', escapeHtml(phone)) : ''}
      ${row('Portfolio / Reel', `<a href="${escapeHtml(portfolio)}" style="color:#f5c518">${escapeHtml(portfolio)}</a>`)}
      ${resume ? row('Résumé link', `<a href="${escapeHtml(resume)}" style="color:#f5c518">${escapeHtml(resume)}</a>`) : ''}
      ${attachment ? row('Résumé PDF', `📎 <b>Attached</b> — ${escapeHtml(attachment.filename)}`) : ''}
      ${!resume && !attachment ? row('Résumé', '<span style="color:#8d877a">Not provided</span>') : ''}
    </table>
    <div style="margin-top:22px;border-top:1px solid #2a2a2a;padding-top:16px">
      <div style="font-size:11px;letter-spacing:.2em;color:#B5AE9F;text-transform:uppercase;margin-bottom:10px">Screening</div>
      <table style="border-collapse:collapse;width:100%">
        ${answers.map((a) => row(a.q, escapeHtml(a.a))).join('')}
      </table>
    </div>
    ${note ? `<div style="margin-top:22px;border-top:1px solid #2a2a2a;padding-top:16px">
      <div style="font-size:11px;letter-spacing:.2em;color:#B5AE9F;text-transform:uppercase;margin-bottom:8px">Note</div>
      <div style="font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(note)}</div></div>` : ''}
    <div style="margin-top:24px;border-top:1px solid #2a2a2a;padding-top:14px;color:#6f6a5f;font-size:12px">
      Reply to this email to reach ${escapeHtml(name)} directly.
    </div>
  </div>`;

  try {
    const result = await new Resend(apiKey).emails.send({
      from, to, replyTo: email,
      subject: `New application · ${role.title} · ${name}`,
      html,
      ...(attachment ? { attachments: [attachment] } : {}),
    });
    if (result.error) {
      console.error('[careers] resend rejected:', JSON.stringify(result.error));
      return NextResponse.json({ error: 'Could not send. Try again in a moment.' }, { status: 502 });
    }
  } catch (e) {
    console.error('[careers] send failed:', e);
    return NextResponse.json({ error: 'Could not send. Try again in a moment.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
