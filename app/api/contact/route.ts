import { NextResponse } from 'next/server';
import { Resend } from 'resend';

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
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function POST(req: Request) {
  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
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
  if (!name || !email || !brief) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'server not configured' }, { status: 500 });
  }
  // Recipients — comma-separated CONTACT_TO env var, defaulting to both founders.
  // Resend accepts an array of addresses in the `to` field.
  const toRaw = process.env.CONTACT_TO
    || 'surajsharma@sqbpictures.com,shubham.shah@sqbpictures.com';
  const to = toRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const from = process.env.CONTACT_FROM || "S'QB Site <onboarding@resend.dev>";

  const html = `
    <h2>New brief from sqbpictures.com</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
    <p><strong>Company / Org:</strong> ${escapeHtml(org || '—')}</p>
    ${website ? `<p><strong>Website:</strong> ${escapeHtml(website)}</p>` : ''}
    ${services.length ? `<p><strong>Service type:</strong> ${escapeHtml(services.join(', '))}</p>` : ''}
    <p><strong>Project:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(brief)}</p>
  `;

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New brief — ${name}${org ? ' (' + org + ')' : ''}`,
      html,
    });
    if ((result as any).error) {
      // Surface Resend's actual reason in Vercel logs so the cause is debuggable.
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
