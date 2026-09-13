import type { PtAdjectives } from './pt.types.js';
import { artFor } from './artFor.js';
import { isPlural } from './isPlural.js';
import { withAdj } from './withAdj.js';

export function nounPhrase(forms: Record<string, string>, adj?: PtAdjectives, possessive?: string): string {
  const plural = isPlural(forms);
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const noun = withAdj(word, adj);
  // A pronominal possessive ("o seu cão") replaces the picked determiner with the definite
  // article + possessive.
  if (possessive) return `${possessive} ${noun}`;
  const art = artFor(forms, plural); // definite / indefinite / bare
  return art ? `${art} ${noun}` : noun;
}
