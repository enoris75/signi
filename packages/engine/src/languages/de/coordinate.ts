import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';

/**
 * Render every conjunct of a noun slot and coordinate them the German way: commas between all
 * but the last pair, "und" / "oder" on the last ("der Kater, der Hund und der Fuchs").
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const word = el.conjunction === 'or' ? 'oder' : 'und';
  return joinConjuncts(el.conjuncts.map(render), ', ', () => ` ${word} `);
}
