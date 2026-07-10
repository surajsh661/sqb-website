// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY. Budgets live here, away from lib/careers.ts, because that file is
// imported by the client page — anything in it ships in the JS bundle and would
// be readable straight from the listing. These are served by
// /api/careers/brief only once a candidate proceeds to apply, so the budget is
// never in the page HTML, the client bundle, or the search index.
//
// `null` = no fixed band; discussed on the first call.
// ─────────────────────────────────────────────────────────────────────────────

export interface RoleBrief {
  salary: string | null;
  note: string;
}

export const ROLE_BRIEF: Record<string, RoleBrief> = {
  'ai-video-editor': {
    salary: '₹25,000 – ₹30,000 / month',
    note: 'Contract engagement, paid monthly.',
  },
  'ai-visual-artist': {
    salary: '₹25,000 – ₹30,000 / month',
    note: 'Contract engagement, paid monthly.',
  },
  'ai-creative-director': {
    // No band was set for this role — surfaced honestly rather than invented.
    salary: null,
    note: 'Budget is set against experience — we discuss it on the first call.',
  },
  'hr-executive': {
    salary: '₹3,00,000 – ₹4,20,000 / year',
    note: 'No equity. Full-time role.',
  },
};
