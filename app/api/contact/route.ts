import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isValidEmail, isDisposableEmail } from '@/lib/spam';

export const runtime = 'nodejs';

interface Body {
  name?: string;
  email?: string;
  org?: string;
  brief?: string;
  // Get-a-Quote extras (all optional so the simple contact form still works).
  phone?: string;
  website?: string;
  services?: string[];
  // anti-spam
  hp?: string;   // honeypot — must stay empty
  t?: number;    // ms the visitor spent on the form before submitting
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LOGO_URL = process.env.CONTACT_LOGO_URL || 'https://sqbpictures.com/logo-dark.png';

// Origins allowed to call this endpoint from a browser. Anything else (another
// website cross-site-posting to burn our Resend quota / spam the inbox) is
// rejected. Requests with NO Origin header (curl, server-to-server) still pass
// the spam gauntlet below — this guard is specifically against cross-site abuse.
const ALLOWED_ORIGINS = new Set([
  'https://sqbpictures.com',
  'https://www.sqbpictures.com',
  'http://localhost:3000',
]);
const originAllowed = (req: Request) => {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // *.vercel.app preview deployments of this project
  try { return new URL(origin).hostname.endsWith('.vercel.app'); } catch { return false; }
};

// Best-effort per-IP rate limit (in-memory, per serverless instance — resets on
// cold start, which is fine: its job is blunting bursts, not perfect accounting).
const hits = new Map<string, { n: number; t: number }>();
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 8;                    // submissions per window per IP
const rateLimited = (req: Request) => {
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.t > RATE_WINDOW_MS) { hits.set(ip, { n: 1, t: now }); return false; }
  cur.n += 1;
  if (hits.size > 5000) hits.clear(); // memory cap
  return cur.n > RATE_MAX;
};

export async function POST(req: Request) {
  if (!originAllowed(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (rateLimited(req)) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // 1) Honeypot — real people never fill this hidden field. Pretend success so
  //    bots don't learn they were caught, but send nothing.
  if ((payload.hp || '').trim()) {
    return NextResponse.json({ ok: true });
  }
  // 2) Time trap — a genuine human takes more than ~2s to fill the form. If the
  //    client reported a sub-2s fill, silently drop it.
  if (typeof payload.t === 'number' && payload.t > 0 && payload.t < 2000) {
    return NextResponse.json({ ok: true });
  }

  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim();
  const org = (payload.org || '').trim();
  const brief = (payload.brief || '').trim();
  const phone = (payload.phone || '').trim();
  const website = (payload.website || '').trim();
  const services = Array.isArray(payload.services)
    ? payload.services.map((s) => String(s).trim()).filter(Boolean)
    : [];

  if (!name || !email) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }
  // 3) Real, non-throwaway email required.
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: 'disposable email', message: 'Please use a permanent email — temporary inboxes are not accepted.' },
      { status: 400 },
    );
  }
  // 4) Sanity caps so a bot can't paste a megabyte of junk.
  if (name.length > 120 || brief.length > 4000 || org.length > 200) {
    return NextResponse.json({ error: 'too long' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'server not configured' }, { status: 500 });
  }
  const toRaw = process.env.CONTACT_TO
    || 'surajsharma@sqbpictures.com,shubham.shah@sqbpictures.com';
  const to = toRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const from = process.env.CONTACT_FROM || "S'QB Site <onboarding@resend.dev>";

  // ── Branded HTML email (dark-mode only, site fonts) ─────────────────
  // Web fonts load in clients that allow them (Apple Mail, iOS); others fall
  // back to close web-safe stacks. Anton = the site's display face.
  const F_DISPLAY = "'Anton','Arial Narrow',Impact,sans-serif";
  const F_MONO = "'JetBrains Mono','Courier New',monospace";
  const F_BODY = "'Inter',Arial,Helvetica,sans-serif";

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.07);vertical-align:top;width:120px;font-family:${F_MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#f5c518;">${label}</td>
      <td style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-family:${F_BODY};font-size:15px;color:#f4ecdb;">${value}</td>
    </tr>`;
  const rows = [
    row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#f4ecdb;text-decoration:underline;">${escapeHtml(email)}</a>`),
    phone ? row('Phone', escapeHtml(phone)) : '',
    org ? row('Company', escapeHtml(org)) : '',
    website ? row('Website', escapeHtml(website)) : '',
    services.length ? row('Services', escapeHtml(services.join(' · '))) : '',
  ].join('');

  const html = `<!DOCTYPE html>
<html lang="en" style="color-scheme:dark;supported-color-schemes:dark;">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap');
  :root { color-scheme: dark; supported-color-schemes: dark; }
  body { margin:0; padding:0; background:#0e0c0b; }
</style>
</head>
<body style="margin:0;padding:0;background:#0e0c0b;">
  <div style="margin:0;padding:24px 12px;background:#0e0c0b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0c0b"><tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#161310" style="width:600px;max-width:600px;background:#161310;border:1px solid rgba(245,197,24,0.18);border-radius:14px;overflow:hidden;">
        <tr><td bgcolor="#1b1610" align="center" style="background:#1b1610;padding:26px 28px;border-bottom:1px solid rgba(245,197,24,0.16);">
          <img src="${LOGO_URL}" alt="S'QB Pictures" height="100" style="height:100px;width:auto;display:block;border:0;outline:none;text-decoration:none;margin:0 auto;" />
        </td></tr>
        <tr><td bgcolor="#161310" style="padding:28px 28px 4px;">
          <div style="font-family:${F_MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f5c518;">New brief · sqbpictures.com</div>
          <div style="font-family:${F_DISPLAY};font-size:30px;letter-spacing:0.01em;color:#f4ecdb;margin-top:10px;">${escapeHtml(name)}</div>
        </td></tr>
        <tr><td bgcolor="#161310" style="padding:12px 28px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
        ${brief ? `<tr><td bgcolor="#161310" style="padding:8px 28px 24px;">
          <div style="font-family:${F_MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#f5c518;margin-bottom:8px;">The project</div>
          <div style="font-family:${F_BODY};font-size:15px;line-height:1.55;color:#e7dfd0;white-space:pre-wrap;background:#1d1813;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;">${escapeHtml(brief)}</div>
        </td></tr>` : ''}
        <tr><td bgcolor="#120f0d" style="padding:16px 28px;background:#120f0d;border-top:1px solid rgba(255,255,255,0.06);font-family:${F_BODY};font-size:12px;color:#8a8278;">
          Reply to this email to reach ${escapeHtml(name)} at <a href="mailto:${escapeHtml(email)}" style="color:#f5c518;text-decoration:none;">${escapeHtml(email)}</a>.
        </td></tr>
      </table>
      <div style="font-family:${F_MONO};font-size:11px;letter-spacing:1px;color:#5c574e;margin-top:14px;">S'QB PICTURES · DELHI NCR &amp; MUMBAI</div>
    </td></tr></table>
  </div>
</body>
</html>`;

  // Plain-text fallback (helps deliverability / non-HTML clients).
  const text = [
    `New brief from sqbpictures.com`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : '',
    org ? `Company: ${org}` : '',
    website ? `Website: ${website}` : '',
    services.length ? `Services: ${services.join(', ')}` : '',
    brief ? `\nProject:\n${brief}` : '',
  ].filter(Boolean).join('\n');

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New brief — ${name}${org ? ' (' + org + ')' : ''}`,
      html,
      text,
    });
    if ((result as any).error) {
      const reason = (result as any).error;
      console.error('[contact] resend rejected:', JSON.stringify(reason));
      return NextResponse.json(
        { error: 'send failed', detail: reason?.message || reason?.name || 'unknown' },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[contact] threw:', err?.message || err);
    return NextResponse.json({ error: 'send failed', detail: err?.message }, { status: 502 });
  }
}
