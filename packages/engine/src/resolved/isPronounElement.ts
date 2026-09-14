import type { ResolvedNounElement } from '../types.js';

/**
 * Whether a resolved noun slot is a single pronoun — one conjunct with a `person`. This is the case
 * that takes the pronoun-object path (oblique form, no article, and a Romance clitic before the
 * verb); a noun object keeps the ordinary post-verbal noun-phrase rendering. A coordination cannot
 * be a clitic, so it stays post-verbal and each engine picks pronoun or noun per conjunct.
 */
export function isPronounElement(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && !!el.conjuncts[0].head.forms['person'];
}
