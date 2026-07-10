import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createResetCode, isSetup } from '@/lib/admin/auth';
import { originAllowed, rateLimited, storeUnavailable } from '@/lib/admin/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_RESET_EMAIL || 'surajsharma@sqbpictures.com';

// Emails a one-time 6-digit reset code to the owner. Always responds { ok: true }
// (never reveals whether a password is set) and only truly sends when set up.
export async function POST(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (rateLimited(req, 'reset', 4, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }
  if (!(await isSetup())) return NextResponse.json({ ok: true });

  const code = await createResetCode();
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const from = process.env.CONTACT_FROM || "S'QB Site <onboarding@resend.dev>";
      // Resend RETURNS { error } on failure (e.g. a bad API key) rather than
      // throwing — without this check a dead key silently swallows the reset
      // code and the owner waits forever for an email that never left.
      const result = await new Resend(apiKey).emails.send({
        from,
        to: ADMIN_EMAIL,
        subject: `S'QB Admin — password reset code ${code}`,
        html: `<div style="font-family:Inter,Arial,sans-serif;background:#0E0E0E;color:#F4ECDB;padding:32px;border-radius:12px;max-width:480px">
          <div style="font-size:12px;letter-spacing:.2em;color:#B5AE9F;text-transform:uppercase">S'QB Pictures · Admin</div>
          <h1 style="font-size:20px;margin:12px 0 8px">Password reset code</h1>
          <p style="color:#B5AE9F;font-size:14px;line-height:1.5;margin:0 0 20px">Enter this code in the admin portal to set a new password. It expires in 15 minutes and can be used once.</p>
          <div style="font-family:'JetBrains Mono',monospace;font-size:34px;font-weight:700;letter-spacing:.35em;color:#F5C518;background:#151515;border:1px solid #2a2a2a;border-radius:10px;padding:18px 12px;text-align:center">${code}</div>
          <p style="color:#6f6a5f;font-size:12px;margin:20px 0 0">If you didn't request this, ignore this email — your password is unchanged.</p>
        </div>`,
      });
      if (result.error) {
        console.error('[admin reset] resend rejected:', JSON.stringify(result.error));
        return NextResponse.json(
          { error: 'Could not send the reset email. Check the mail configuration.' },
          { status: 502 },
        );
      }
    } catch (e) {
      console.error('[admin reset] email send failed:', e);
      return NextResponse.json(
        { error: 'Could not send the reset email. Try again in a moment.' },
        { status: 502 },
      );
    }
  } else {
    console.warn('[admin reset] no RESEND_API_KEY set — reset code:', code);
  }

  // Dev-only convenience so the flow is testable without opening the inbox.
  return NextResponse.json({ ok: true, ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}) });
}
