// ─────────────────────────────────────────────────────────────────────────────
// Admin auth — zero-dependency, built on Node's crypto.
//  · Passwords: scrypt with a per-password random salt; constant-time verify.
//  · Sessions:  stateless signed cookie (HMAC-SHA256). A stored token "version"
//    lets us invalidate every existing session at once (used on password reset).
//  · Reset:     a 6-digit code, stored HASHED with a 15-min TTL and a 5-try cap,
//    emailed to the owner.
// ─────────────────────────────────────────────────────────────────────────────
import { scryptSync, randomBytes, randomInt, timingSafeEqual, createHmac } from 'crypto';
import { adminStore } from './store';

const K = {
  password: 'admin:password',
  secret: 'admin:secret',
  tokenVersion: 'admin:tokenVersion',
  reset: 'admin:reset',
} as const;

export const SESSION_COOKIE = 'sqb_admin';
export const SESSION_MAX_AGE = 7 * 24 * 3600; // seconds
export const RESET_TTL = 15 * 60;             // seconds
export const MIN_PASSWORD_LEN = 10;

// ── password hashing ─────────────────────────────────────────────────────────
export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  return `${salt.toString('hex')}:${scryptSync(pw, salt, 32).toString('hex')}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(pw, Buffer.from(saltHex, 'hex'), 32);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// ── secret + token version ───────────────────────────────────────────────────
async function getSecret(): Promise<string> {
  const store = adminStore();
  let s = await store.get(K.secret);
  if (!s) { s = randomBytes(32).toString('hex'); await store.set(K.secret, s); }
  return s;
}
async function getTokenVersion(): Promise<number> {
  const v = await adminStore().get(K.tokenVersion);
  return v ? parseInt(v, 10) : 1;
}
export async function bumpTokenVersion(): Promise<void> {
  await adminStore().set(K.tokenVersion, String((await getTokenVersion()) + 1));
}

// ── signed session cookie (stateless) ────────────────────────────────────────
function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}
export async function issueSession(): Promise<string> {
  const secret = await getSecret();
  const payload = Buffer.from(JSON.stringify({ v: await getTokenVersion(), iat: Date.now() })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}
export async function verifySession(cookie: string | undefined | null): Promise<boolean> {
  if (!cookie) return false;
  const [payload, sig] = cookie.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload, await getSecret());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { v, iat } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { v: number; iat: number };
    if (v !== (await getTokenVersion())) return false;          // invalidated by a reset
    if (Date.now() - iat > SESSION_MAX_AGE * 1000) return false; // expired
    return true;
  } catch { return false; }
}

// ── setup / password ─────────────────────────────────────────────────────────
export async function isSetup(): Promise<boolean> {
  return !!(await adminStore().get(K.password));
}
export async function setPassword(pw: string): Promise<void> {
  await adminStore().set(K.password, hashPassword(pw));
}
export async function checkPassword(pw: string): Promise<boolean> {
  const stored = await adminStore().get(K.password);
  return stored ? verifyPassword(pw, stored) : false;
}

// ── reset code ───────────────────────────────────────────────────────────────
/** Create a 6-digit code, store it hashed with a TTL, return the plaintext to email. */
export async function createResetCode(): Promise<string> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await adminStore().set(K.reset, JSON.stringify({ code: hashPassword(code), attempts: 0 }), { ttlSeconds: RESET_TTL });
  return code;
}
export async function consumeResetCode(code: string): Promise<boolean> {
  const store = adminStore();
  const raw = await store.get(K.reset);
  if (!raw) return false;
  const rec = JSON.parse(raw) as { code: string; attempts: number };
  if (rec.attempts >= 5) { await store.del(K.reset); return false; }
  if (!verifyPassword(code, rec.code)) {
    await store.set(K.reset, JSON.stringify({ code: rec.code, attempts: rec.attempts + 1 }), { ttlSeconds: RESET_TTL });
    return false;
  }
  await store.del(K.reset); // single-use
  return true;
}
