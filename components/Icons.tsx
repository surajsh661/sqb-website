// Crisp inline SVG icons — used instead of typed glyphs (✕ ▶ ← →) so controls
// render as drawn marks, not font characters (sharper at every size/zoom).
// Colour follows the parent's `color` via currentColor.

export function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"
      aria-hidden="true" style={{ display: 'block' }}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconArrow({ size = 18, dir = 'right' }: { size?: number; dir?: 'left' | 'right' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block', transform: dir === 'left' ? 'scaleX(-1)' : undefined }}
    >
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconPlay({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="currentColor" aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M8.5 5.5v13l10-6.5z" />
    </svg>
  );
}
