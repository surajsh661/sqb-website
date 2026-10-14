// Copy fixes for case studies edited in /admin before the Oct 2026 copy pass.
// The console saves EVERY field of a case study, so untouched fields hold the old
// default text in KV and override lib/data.ts. Each entry swaps a field ONLY when
// it still equals the old default exactly; anything the owner wrote is untouched.
const CASE_COPY_FIXES: Record<string, string> = {
  "A high-velocity brand film that turned a protein launch into a national conversation.":
    "A brand film that launched Naturaltein protein with Jasprit Bumrah.",
  "Filmmaking first. We built a visual language as relentless as the bowler himself — slow-burn close-ups, sound design that hits like a yorker, every frame composed on set.":
    "We built the film around the bowler himself: slow-burn close-ups, sound design that hits like a yorker, and every frame composed on set.",
  "Launch Naturaltein with credibility — own the gym-supplement category against incumbents 10× our budget.":
    "Launch Naturaltein with credibility and take on gym-supplement brands with ten times its budget.",
  "Cast the most disciplined fast bowler on earth and shot a film about discipline.":
    "We cast Jasprit Bumrah and made a film about the discipline behind his bowling.",
  "A co-branded TVC for edtech brand Sunstone, made with IPL franchise Lucknow Super Giants — the lecture hall and the locker room in one frame.":
    "A co-branded TVC for edtech brand Sunstone, made with IPL franchise Lucknow Super Giants. The lecture hall and the locker room share one frame.",
  "Sunstone reinvents the campus experience for India's college students. We partnered them with the newly-launched Lucknow Super Giants and built the spot around that crossover energy — the discipline of a pro dressing room meeting the ambition of a campus — cut for maximum recall across the IPL window.":
    "Sunstone reinvents the campus experience for India's college students. We partnered them with the newly-launched Lucknow Super Giants and built the spot around that crossover: the discipline of a pro dressing room meets the ambition of a campus. We cut it for recall across the IPL window.",
  "Second beat in the Aparshakti × GFG campaign — same comic timing, sharper twist.":
    "The second film in the Aparshakti × GFG campaign, with the same comic timing and a sharper twist.",
  "A 12-minute short film — quiet, observational, performance-led.":
    "A quiet, observational 12-minute short film, led by its performances.",
  "A romance music video — mood-first, performance-driven.":
    "A romance music video driven by mood and performance.",
};

type Overrides = Record<string, Record<string, unknown>>;

export function applyCaseCopyFixes<T extends Overrides>(overrides: T): T {
  const out: Overrides = {};
  for (const [id, fields] of Object.entries(overrides)) {
    out[id] = Object.fromEntries(Object.entries(fields || {}).map(([k, v]) =>
      [k, typeof v === 'string' && Object.prototype.hasOwnProperty.call(CASE_COPY_FIXES, v) ? CASE_COPY_FIXES[v] : v]));
  }
  return out as T;
}
