import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { joinConjuncts } from '../../resolved/joinConjuncts.js';

/**
 * Render every conjunct of a noun slot and coordinate them the Italian way: commas between all
 * but the last pair, the conjunction on the last ("il gatto, il cane e la volpe"). "e" becomes
 * the euphonic "ed" before a word already starting with e- ("il cane ed il gatto" — "ed elefanti").
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const link = (next: string) =>
    el.conjunction === 'or' ? ' o ' : /^e/i.test(next) ? ' ed ' : ' e ';
  return joinConjuncts(el.conjuncts.map(render), ', ', link);
}
