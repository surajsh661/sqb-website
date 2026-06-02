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

export async function POST(req: Request) {
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

  // ── Branded HTML email ──────────────────────────────────────────────
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.07);vertical-align:top;width:120px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#f5c518;">${label}</td>
      <td style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#f4ecdb;">${value}</td>
    </tr>`;
  const rows = [
    row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#f4ecdb;text-decoration:underline;">${escapeHtml(email)}</a>`),
    phone ? row('Phone', escapeHtml(phone)) : '',
    org ? row('Company', escapeHtml(org)) : '',
    website ? row('Website', escapeHtml(website)) : '',
    services.length ? row('Services', escapeHtml(services.join(' · '))) : '',
  ].join('');

  const html = `
  <div style="margin:0;padding:24px 12px;background:#0e0c0b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0c0b"><tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#161310" style="width:600px;max-width:600px;background:#161310;border:1px solid rgba(245,197,24,0.18);border-radius:14px;overflow:hidden;">
        <tr><td bgcolor="#1b1610" style="background:#1b1610;padding:20px 28px;border-bottom:1px solid rgba(245,197,24,0.16);">
          <img src="${LOGO_URL}" alt="S'QB Pictures" height="34" style="height:34px;display:block;border:0;outline:none;text-decoration:none;" />
        </td></tr>
        <tr><td style="padding:26px 28px 4px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f5c518;">New brief · sqbpictures.com</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#f4ecdb;margin-top:8px;font-weight:bold;">${escapeHtml(name)}</div>
        </td></tr>
        <tr><td style="padding:12px 28px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
        ${brief ? `<tr><td style="padding:8px 28px 24px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#f5c518;margin-bottom:8px;">The project</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#e7dfd0;white-space:pre-wrap;background:#1d1813;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;">${escapeHtml(brief)}</div>
        </td></tr>` : ''}
        <tr><td bgcolor="#120f0d" style="padding:16px 28px;background:#120f0d;border-top:1px solid rgba(255,255,255,0.06);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8278;">
          Reply to this email to reach ${escapeHtml(name)} at <a href="mailto:${escapeHtml(email)}" style="color:#f5c518;text-decoration:none;">${escapeHtml(email)}</a>.
        </td></tr>
      </table>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#5c574e;margin-top:14px;">S'QB Pictures · Delhi NCR &amp; Mumbai</div>
    </td></tr></table>
  </div>`;

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
