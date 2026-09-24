import type { ResolvedNounPhrase } from '../../types.js';
import { relativeText } from './relativeText.js';

/**
 * A pronoun's surface with the relative clause it carries, where it carries one. Only an indefinite
 * pronoun does, a phrase by its syntax: "vede qualcuno che corre", "con qualcuno che corre" (A309). A
 * noun's relative is `renderNP`'s.
 */
export function withRelative(text: string, np: ResolvedNounPhrase): string {
  const rel = relativeText(np);
  return rel ? `${text} ${rel}` : text;
}
