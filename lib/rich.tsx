import React from 'react';

/**
 * Turns a plain copy string from lib/copy.ts into styled text on the page.
 *
 * Two simple rules an editor can use inside lib/copy.ts:
 *   *word*        →  shows "word" in the gold / italic accent style
 *   (new line)    →  pressing Enter inside the back-ticks becomes a line break
 *
 * Everything else is shown exactly as typed. No HTML, no code needed.
 */
export function rich(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, li) => (
    <React.Fragment key={li}>
      {li > 0 && <br />}
      {line.split(/(\*[^*]+\*)/g).map((part, pi) =>
        part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
          <em key={pi}>{part.slice(1, -1)}</em>
        ) : (
          <React.Fragment key={pi}>{part}</React.Fragment>
        ),
      )}
    </React.Fragment>
  ));
}
