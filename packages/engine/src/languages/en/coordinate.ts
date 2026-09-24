import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { COORD_WORDS } from './en.consts.js';

/**
 * Render every conjunct of a noun slot and join them the way English coordinates: commas between
 * all but the last pair, the conjunction word on the last ("Peter, Paul and Mary"). A slot holding
 * one phrase is just that phrase.
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const parts = el.conjuncts.map(render);
  // "both the cat and the dog" (P09-E26).
  return correlate(el, parts, ['both', 'and']) ?? joinConjuncts(parts, ', ', () => ` ${COORD_WORDS[el.conjunction ?? 'and']} `);
}
