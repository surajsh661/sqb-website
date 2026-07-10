import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin/auth';
import { getSessionToken, originAllowed, storeUnavailable } from '@/lib/admin/http';
import { getStoredRoles, saveStoredRoles, seedIfEmpty, type StoredRole } from '@/lib/careers-store';
import type { ScreeningQuestion } from '@/lib/careers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authed = async (req: Request) => verifySession(getSessionToken(req));
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '');
const lines = (v: unknown, n: number, cap = 40) =>
  Array.isArray(v) ? v.map((x) => str(x, n).trim()).filter(Boolean).slice(0, cap) : [];
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'role';

function sanitizeQuestion(q: unknown, i: number): ScreeningQuestion | null {
  if (!q || typeof q !== 'object') return null;
  const o = q as Record<string, unknown>;
  const label = str(o.label, 200).trim();
  if (!label) return null;
  const kind = o.kind === 'number' || o.kind === 'text' ? o.kind : 'boolean';
  const id = (str(o.id, 40).replace(/[^a-zA-Z0-9_-]/g, '') || `q${i}`).slice(0, 40);
  const out: ScreeningQuestion = { id, label, kind, required: !!o.required };
  if (kind === 'number') {
    out.suffix = 'years';
    out.placeholder = '0';
    const m = Number(o.min);
    if (Number.isFinite(m)) out.min = Math.max(0, Math.min(50, Math.floor(m)));
  } else if (kind === 'text') {
    out.placeholder = str(o.placeholder, 80);
  }
  return out;
}

// Never trust the client, even when authed — clamp + shape everything.
function sanitizeRole(input: unknown, existingIds: string[], isNew: boolean): StoredRole | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'Bad role.' };
  const o = input as Record<string, unknown>;

  const title = str(o.title, 120).trim();
  if (!title) return { error: 'A job title is required.' };
  const description = str(o.description, 6000).trim();
  if (!description) return { error: 'A description is required.' };
  const qualifications = lines(o.qualifications, 300);
  if (!qualifications.length) return { error: 'Add at least one requirement.' };

  let id = str(o.id, 60).trim();
  if (!id || isNew) {
    id = slug(title);
    let n = 2;
    while (existingIds.includes(id)) id = `${slug(title)}-${n++}`;
  }

  const questions = (Array.isArray(o.questions) ? o.questions : [])
    .slice(0, 12)
    .map(sanitizeQuestion)
    .filter((q): q is ScreeningQuestion => q !== null);

  const salaryRaw = str(o.salary, 80).trim();

  return {
    id,
    title,
    subtitle: str(o.subtitle, 80).trim() || undefined,
    category: o.category === 'operations' ? 'operations' : 'creative',
    dept: str(o.dept, 60).trim() || 'Team',
    type: str(o.type, 40).trim() || 'Full Time',
    location: str(o.location, 100).trim() || 'Delhi NCR',
    onsite: str(o.onsite, 80).trim() || 'On-site',
    experience: str(o.experience, 80).trim(),
    lede: str(o.lede, 200).trim(),
    description,
    responsibilities: lines(o.responsibilities, 300).length ? lines(o.responsibilities, 300) : undefined,
    qualifications,
    bonus: lines(o.bonus, 300).length ? lines(o.bonus, 300) : undefined,
    tools: !!o.tools,
    questions,
    datePosted: /^\d{4}-\d{2}-\d{2}$/.test(str(o.datePosted, 10)) ? str(o.datePosted, 10) : '2026-07-01',
    validThrough: /^\d{4}-\d{2}-\d{2}$/.test(str(o.validThrough, 10)) ? str(o.validThrough, 10) : '2027-06-30',
    salary: salaryRaw || null,
    salaryNote: str(o.salaryNote, 200).trim() || 'Discussed on the first call.',
    open: o.open !== false,
  };
}

// GET → every role (full, incl. budget). Seeds the store on first open.
export async function GET(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!(await authed(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const roles = await seedIfEmpty();
  return NextResponse.json({ roles });
}

// PUT → create or update one role.
export async function PUT(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!(await authed(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { role?: unknown; isNew?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }

  const roles = await getStoredRoles();
  const ids = roles.map((r) => r.id);
  const result = sanitizeRole(body.role, ids, !!body.isNew);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const idx = roles.findIndex((r) => r.id === result.id);
  if (idx >= 0) roles[idx] = result;
  else roles.push(result);
  await saveStoredRoles(roles);
  return NextResponse.json({ ok: true, role: result });
}

// DELETE ?id= → remove a role.
export async function DELETE(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!(await authed(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id') || '';
  const roles = await getStoredRoles();
  const next = roles.filter((r) => r.id !== id);
  if (next.length === roles.length) return NextResponse.json({ error: 'Unknown role.' }, { status: 404 });
  await saveStoredRoles(next);
  return NextResponse.json({ ok: true });
}
