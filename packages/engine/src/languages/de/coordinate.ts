import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { CORRELATIVE_PAIR } from './de.consts.js';

/**
 * Render every conjunct of a noun slot and coordinate them the German way: commas between all
 * but the last pair, "und" / "oder" on the last ("der Kater, der Hund und der Fuchs").
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const word = el.conjunction === 'or' ? 'oder' : 'und';
  const parts = el.conjuncts.map(render);
  // "sowohl der Kater als auch der Hund" (P09-E26).
  return correlate(el, parts, CORRELATIVE_PAIR) ?? joinConjuncts(parts, ', ', () => ` ${word} `);
}
