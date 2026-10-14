// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY. The editable source of truth for careers roles.
//
// Roles live in the KV database so the owner can add / edit / delete them from
// the admin console. The hardcoded SQB_ROLES (lib/careers.ts) + ROLE_BRIEF
// (lib/careers-salary.ts) are the SEED and the FALLBACK — if KV is empty or
// unreachable, the public site still shows those, so careers can never break.
//
// A StoredRole extends the public Role with the fields only the owner sees:
// the budget (salary/note) and whether the listing is open. `toPublic()` strips
// those, so salary never leaves the server except through /api/careers/brief.
// ─────────────────────────────────────────────────────────────────────────────
import { adminStore } from './admin/store';
import { SQB_ROLES, OPEN_APPLICATION_ROLE, OPEN_APPLICATION_ID, type Role } from './careers';
import { ROLE_BRIEF } from './careers-salary';

export interface StoredRole extends Role {
  salary: string | null;
  salaryNote: string;
  open: boolean;
}

const KEY = 'careers:roles';

const withBudget = (r: Role): StoredRole => ({
  ...r,
  salary: ROLE_BRIEF[r.id]?.salary ?? null,
  salaryNote: ROLE_BRIEF[r.id]?.note ?? 'Discussed on the first call.',
  open: true,
});

/** The code roles, enriched with their budget + open flag — the initial seed. */
function seed(): StoredRole[] {
  return [...SQB_ROLES, OPEN_APPLICATION_ROLE].map(withBudget);
}

/**
 * The open application is a permanent fixture, not a rotating vacancy, so it is
 * merged in whenever the store doesn't already carry it. That means it appears
 * the moment this deploys — without it, a KV that was seeded before this role
 * existed would never show it. Presence is checked by id, so once it IS in KV
 * the owner stays in control: closing it in the admin sticks.
 */
function withOpenApplication(roles: StoredRole[]): StoredRole[] {
  if (roles.some((r) => r.id === OPEN_APPLICATION_ID)) return roles;
  return [...roles, withBudget(OPEN_APPLICATION_ROLE)];
}

/**
 * Copy fixes for listings already seeded into KV. The seed is copied into KV
 * once, so later wording changes in lib/careers.ts never reach the live site on
 * their own. These swap ONLY the exact old default phrases; any field the owner
 * has edited in /admin no longer contains them and is left untouched.
 */
const COPY_FIXES: [string, string][] = [
  ['Cut raw footage — and raw generation — into films that hold.', 'Cut raw footage and AI generations into films that hold together.'],
  ['Generate worlds that look shot, not rendered.', 'Generate AI footage that looks like it was shot on a real set.'],
  ['Own the vision. Direct the machine.', 'Own the creative vision and direct the AI pipeline.'],
  ["This is not a traditional HR desk role. You'll actively handle", "You'll handle"],
  ['across a whole film — art-directing prompts, references and passes until the frame is indistinguishable from a shot one, then finishing it with motion graphics and design.',
   'across a whole film. You will art-direct prompts, references and passes until the frame looks shot, then finish it with motion graphics and design.'],
  ['We hire on the work, not the résumé.', 'We judge you on the work you show us.'],
  ['A body of work you can show — reel, portfolio, credits or shipped projects', 'A body of work you can show: reel, portfolio, credits or released projects'],
  ['In a line — what would you bring to S’QB?', 'In one line, what would you bring to S’QB?'],
];
function fixCopy<T>(v: T): T {
  if (typeof v === 'string') {
    let out: string = v;
    for (const [from, to] of COPY_FIXES) if (out.includes(from)) out = out.split(from).join(to);
    return out as T;
  }
  if (Array.isArray(v)) return v.map(fixCopy) as T;
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, fixCopy(x)])) as T;
  }
  return v;
}

/** All roles — KV if present, else the code seed (no write; safe on public paths). */
export async function getStoredRoles(): Promise<StoredRole[]> {
  try {
    const raw = await adminStore().get(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return withOpenApplication(fixCopy(parsed as StoredRole[]));
    }
  } catch { /* KV down → fall back to seed */ }
  return seed();
}

export async function saveStoredRoles(roles: StoredRole[]): Promise<void> {
  await adminStore().set(KEY, JSON.stringify(roles));
}

/** For the admin: ensure KV holds a copy so every role is editable from the start. */
export async function seedIfEmpty(): Promise<StoredRole[]> {
  try {
    const raw = await adminStore().get(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        // Persist the merged list so the open application becomes editable
        // (and closable) from the admin like any other listing.
        const merged = withOpenApplication(fixCopy(parsed as StoredRole[]));
        if (merged.length !== parsed.length) {
          try { await saveStoredRoles(merged); } catch { /* best effort */ }
        }
        return merged;
      }
    }
  } catch { /* fall through to seed */ }
  const s = seed();
  try { await saveStoredRoles(s); } catch { /* best effort */ }
  return s;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toPublic({ salary, salaryNote, open, ...pub }: StoredRole): Role {
  return pub;
}

/** Open roles, salary stripped — what the public listing + JSON-LD use. */
export async function getPublicRoles(): Promise<Role[]> {
  return (await getStoredRoles()).filter((r) => r.open).map(toPublic);
}

/** Budget for the reveal step (server → client only after "Apply"). */
export async function getRoleBrief(id: string): Promise<{ salary: string | null; note: string } | null> {
  const r = (await getStoredRoles()).find((x) => x.id === id);
  return r ? { salary: r.salary, note: r.salaryNote } : null;
}

/** The role an application targets — only OPEN roles accept applications. */
export async function roleForApplication(id: string): Promise<Role | null> {
  const r = (await getStoredRoles()).find((x) => x.id === id && x.open);
  return r ? toPublic(r) : null;
}
