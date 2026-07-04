// ─────────────────────────────────────────────────────────────────────────────
// Admin key-value store.
// One tiny KV-like interface with two backends, chosen automatically by env:
//  · Production → Upstash Redis (Vercel KV) over its REST API, called with plain
//    fetch so we add ZERO npm dependencies.
//  · Local dev  → a gitignored JSON file (serverless prod has an ephemeral FS,
//    so the file backend is for local testing only).
// Everything the admin portal persists (password hash, signing secret, session
// token version, reset codes, case-study overrides) goes through here.
// ─────────────────────────────────────────────────────────────────────────────
import { promises as fs } from 'fs';
import path from 'path';

export interface AdminStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, opts?: { ttlSeconds?: number }): Promise<void>;
  del(key: string): Promise<void>;
}

// ── Upstash Redis REST (production) ──────────────────────────────────────────
class UpstashStore implements AdminStore {
  constructor(private url: string, private token: string) {}
  private async cmd(args: (string | number)[]): Promise<unknown> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`kv ${String(args[0])} -> ${res.status}`);
    return (await res.json() as { result: unknown }).result;
  }
  async get(key: string) {
    const r = await this.cmd(['GET', key]);
    return (r === null || r === undefined) ? null : String(r);
  }
  async set(key: string, value: string, opts?: { ttlSeconds?: number }) {
    await this.cmd(opts?.ttlSeconds ? ['SET', key, value, 'EX', opts.ttlSeconds] : ['SET', key, value]);
  }
  async del(key: string) { await this.cmd(['DEL', key]); }
}

// ── JSON file (local development only) ───────────────────────────────────────
class FileStore implements AdminStore {
  private file = path.join(process.cwd(), '.admin-data', 'store.json');
  private async read(): Promise<Record<string, { v: string; exp?: number }>> {
    try { return JSON.parse(await fs.readFile(this.file, 'utf8')); } catch { return {}; }
  }
  private async write(data: Record<string, { v: string; exp?: number }>) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(data, null, 2));
  }
  async get(key: string) {
    const data = await this.read();
    const e = data[key];
    if (!e) return null;
    if (e.exp && e.exp < Date.now()) { delete data[key]; await this.write(data); return null; }
    return e.v;
  }
  async set(key: string, value: string, opts?: { ttlSeconds?: number }) {
    const data = await this.read();
    data[key] = { v: value, ...(opts?.ttlSeconds ? { exp: Date.now() + opts.ttlSeconds * 1000 } : {}) };
    await this.write(data);
  }
  async del(key: string) {
    const data = await this.read();
    delete data[key];
    await this.write(data);
  }
}

// Vercel KV / Upstash inject these when a store is linked to the project.
// (Some integrations name them UPSTASH_REDIS_REST_* — accept both.)
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let _store: AdminStore | null = null;
export function adminStore(): AdminStore {
  if (_store) return _store;
  _store = KV_URL && KV_TOKEN ? new UpstashStore(KV_URL, KV_TOKEN) : new FileStore();
  return _store;
}
/** 'kv' once a real database is wired; 'file' during local dev. */
export function storeMode(): 'kv' | 'file' {
  return KV_URL && KV_TOKEN ? 'kv' : 'file';
}
