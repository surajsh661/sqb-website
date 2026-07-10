// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY email verification (uses node:dns — never import from a client
// component). Confirms the email's domain can actually receive mail by looking
// up its MX records. This is what stops garbage like "x@bil.com" or a typo'd
// domain from getting through, without the friction of an OTP round-trip.
// ─────────────────────────────────────────────────────────────────────────────
import { promises as dns } from 'dns';

/**
 * true  → domain has MX records (can receive mail)
 * false → domain definitively has NO mail server (reject the address)
 * null  → couldn't determine (transient DNS error) → caller should fail OPEN so
 *         a real applicant is never blocked by a DNS hiccup.
 */
export async function domainCanReceiveMail(email: string): Promise<boolean | null> {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain || !domain.includes('.')) return false;
  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.some((r) => r.exchange);
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    // No such domain / no MX records → not a real mail domain.
    if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'NXDOMAIN') return false;
    // Timeout / SERVFAIL / rate-limit → unknown; don't punish the applicant.
    return null;
  }
}

/** A plausible http(s) link with a real-looking host — rejects "21342r3". */
export function isUrlish(v: string): boolean {
  const s = v.trim();
  if (!s) return false;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return u.hostname.includes('.') && !/\s/.test(s);
  } catch {
    return false;
  }
}
