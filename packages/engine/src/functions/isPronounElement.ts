import type { ResolvedNounElement } from '../types.js';

/**
 * Whether a resolved noun slot is a single **personal** pronoun — one conjunct with a `person`, and
 * not the indefinite pronoun that stands for a thing. This is the case that takes the pronoun-object
 * path (oblique form, no article, and a Romance clitic before the verb) and that Romance pro-drop
 * leaves unsaid; a noun object keeps the ordinary post-verbal noun-phrase rendering. A coordination
 * cannot be a clitic, so it stays post-verbal and each engine picks pronoun or noun per conjunct.
 *
 * SOMETHING is a pronoun by its lexicon and a full phrase by its syntax (`thing`, localization C32):
 * *qualcosa* is no clitic and is never dropped — "qualcosa mangia", "mangia qualcosa", never "*lo
 * mangia" or a bare "mangia" — so it is excluded here and renders on the tonic/noun path instead.
 */
export function isPronounElement(el: ResolvedNounElement): boolean {
  const head = el.conjuncts.length === 1 ? el.conjuncts[0].head.forms : undefined;
  return !!head?.['person'] && head['thing'] !== '1';
}
