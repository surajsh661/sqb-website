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

/** All roles — KV if present, else the code seed (no write; safe on public paths). */
export async function getStoredRoles(): Promise<StoredRole[]> {
  try {
    const raw = await adminStore().get(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return withOpenApplication(parsed as StoredRole[]);
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
        const merged = withOpenApplication(parsed as StoredRole[]);
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
