import type { VerbAgr } from './lt.types.js';

/** The person-number key a stored cell is written under (`1sg` … `3pl`). */
export function pnOf(agr: VerbAgr): string {
  return `${agr.person}${agr.plural ? 'pl' : 'sg'}`;
}
