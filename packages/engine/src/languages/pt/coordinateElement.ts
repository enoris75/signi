import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';

/**
 * Render every conjunct of a noun slot and coordinate them the Portuguese way: commas between
 * all but the last pair, "e" / "ou" on the last ("o gato, o cão e a raposa"). Neither word has
 * a euphonic variant, so the link is invariable.
 */
export function coordinateElement(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const word = el.conjunction === 'or' ? 'ou' : 'e';
  const parts = el.conjuncts.map(render);
  // "tanto o gato quanto o cão" (P09-E26).
  return correlate(el, parts, ['tanto', 'quanto']) ?? joinConjuncts(parts, ', ', () => ` ${word} `);
}
