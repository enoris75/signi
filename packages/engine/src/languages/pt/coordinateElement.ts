import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { joinConjuncts } from '../../resolved/joinConjuncts.js';

/**
 * Render every conjunct of a noun slot and coordinate them the Portuguese way: commas between
 * all but the last pair, "e" / "ou" on the last ("o gato, o cão e a raposa"). Neither word has
 * a euphonic variant, so the link is invariable.
 */
export function coordinateElement(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const word = el.conjunction === 'or' ? 'ou' : 'e';
  return joinConjuncts(el.conjuncts.map(render), ', ', () => ` ${word} `);
}
