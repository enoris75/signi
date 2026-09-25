import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { CORRELATIVE_PAIR } from './it.consts.js';

/**
 * Render every conjunct of a noun slot and coordinate them the Italian way: commas between all
 * but the last pair, the conjunction on the last ("il gatto, il cane e la volpe"). "e" becomes
 * the euphonic "ed" before a word already starting with e- ("il cane ed il gatto" — "ed elefanti").
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const link = (next: string) =>
    el.conjunction === 'or' ? ' o ' : /^e/i.test(next) ? ' ed ' : ' e ';
  const parts = el.conjuncts.map(render);
  // "sia il gatto sia il cane" (P09-E26): the correlative repeats its one word.
  return correlate(el, parts, CORRELATIVE_PAIR) ?? joinConjuncts(parts, ', ', link);
}
