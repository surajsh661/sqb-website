import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin/auth';
import { getSessionToken, originAllowed, storeUnavailable } from '@/lib/admin/http';
import { adminStore } from '@/lib/admin/store';
import { SQB_FILMS } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OVERRIDES_KEY = 'content:overrides';

// Editable case-study fields. `credits` is a free list of {role,name} so the
// owner can add DIRECTOR, DOP, EDITOR, etc.
const TEXT_FIELDS = [
  'title', 'category', 'year', 'runtime', 'client', 'talent',
  'lede', 'body', 'brief', 'solution', 'timeline', 'release', 'impact',
] as const;
type TextField = typeof TEXT_FIELDS[number];
type Credit = { role: string; name: string };
type Override = Partial<Record<TextField, string>> & { credits?: Credit[] };

async function loadOverrides(): Promise<Record<string, Override>> {
  const raw = await adminStore().get(OVERRIDES_KEY);
  return raw ? (JSON.parse(raw) as Record<string, Override>) : {};
}
const authed = async (req: Request) => verifySession(getSessionToken(req));

// GET → every case study's current editable values (base data with overrides applied).
export async function GET(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!(await authed(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const overrides = await loadOverrides();
  const items = SQB_FILMS.map((f) => {
    const o = overrides[f.id] || {};
    const rec: Record<string, unknown> = { id: f.id, edited: Object.keys(o).length > 0 };
    const ff = f as unknown as Record<string, unknown>;
    for (const k of TEXT_FIELDS) rec[k] = (o[k] ?? ff[k] ?? '') as string;
    rec.credits = o.credits ?? f.credits ?? [];
    return rec;
  });
  return NextResponse.json({ items });
}

// PUT → save an override for one case study.
export async function PUT(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!(await authed(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { id?: string; fields?: Override };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }
  const film = SQB_FILMS.find((f) => f.id === body.id);
  if (!film || !body.fields) return NextResponse.json({ error: 'unknown case study' }, { status: 400 });

  // Whitelist + clamp lengths — never trust the client.
  const clean: Override = {};
  for (const k of TEXT_FIELDS) {
    const v = (body.fields as Record<string, unknown>)[k];
    if (typeof v === 'string') clean[k] = v.slice(0, 6000);
  }
  if (Array.isArray(body.fields.credits)) {
    clean.credits = body.fields.credits
      .filter((c): c is Credit => !!c && typeof c.role === 'string' && typeof c.name === 'string')
      .slice(0, 50)
      .map((c) => ({ role: c.role.slice(0, 60), name: c.name.slice(0, 140) }));
  }

  const overrides = await loadOverrides();
  overrides[film.id] = { ...overrides[film.id], ...clean };
  await adminStore().set(OVERRIDES_KEY, JSON.stringify(overrides));
  return NextResponse.json({ ok: true });
}
