import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { correlate } from '../../functions/correlate.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';

/**
 * Render every conjunct of a noun slot and coordinate them the French way: commas between all
 * but the last pair, "et" / "ou" on the last ("le chat, le chien et le renard"). Neither word
 * has a euphonic variant, so the link is invariable.
 */
export function coordinate(el: ResolvedNounElement, render: (np: ResolvedNounPhrase) => string): string {
  const word = el.conjunction === 'or' ? 'ou' : 'et';
  const parts = el.conjuncts.map(render);
  // "et le chat et le chien" (P09-E26).
  return correlate(el, parts, ['et', 'et']) ?? joinConjuncts(parts, ', ', () => ` ${word} `);
}
