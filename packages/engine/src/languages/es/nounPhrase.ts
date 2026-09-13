import type { EsAdjectives } from './es.types.js';
import { artFor } from './artFor.js';
import { artForms } from './artForms.js';
import { isPlural } from './isPlural.js';
import { withAdj } from './withAdj.js';

export function nounPhrase(forms: Record<string, string>, adj?: EsAdjectives, possessive?: string): string {
  const plural = isPlural(forms);
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const noun = withAdj(word, adj);
  // A pronominal possessive ("su perro") replaces the article, whatever determiner was picked.
  if (possessive) return `${possessive} ${noun}`;
  const art = artFor(artForms(forms, adj), plural); // definite / indefinite / bare
  return art ? `${art} ${noun}` : noun;
}
