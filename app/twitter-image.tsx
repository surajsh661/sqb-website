// Twitter/X uses the same branded card as OpenGraph.
// runtime must be a literal in this file (Next can't read a re-exported one).
export const runtime = 'nodejs';
export { default, alt, size, contentType } from './opengraph-image';
