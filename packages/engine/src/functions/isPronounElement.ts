import type { ResolvedNounElement } from '../types.js';

/**
 * Whether a resolved noun slot is a single **personal** pronoun — one conjunct with a `person`, and
 * not an indefinite pronoun. This is the case that takes the pronoun-object
 * path (oblique form, no article, and a Romance clitic before the verb) and that Romance pro-drop
 * leaves unsaid; a noun object keeps the ordinary post-verbal noun-phrase rendering. A coordination
 * cannot be a clitic, so it stays post-verbal and each engine picks pronoun or noun per conjunct.
 *
 * SOMETHING and SOMEONE are pronouns by their lexicon and full phrases by their syntax (localization
 * C32, P09-E40): *qualcosa* / *qualcuno* is no clitic and is never dropped — "qualcuno corre", "vede
 * qualcuno", never "*lo vede" or a bare "corre" — so they are excluded here and render on the
 * tonic/noun path instead. They are known by the concept's `slot: 'indefinite'`, which the lexicon
 * hands over as the `indefinite` form, and not by `thing`: a person cannot carry that honestly, and
 * `thing` keeps its own jobs (no Spanish personal *a*, the Japanese animacy of `isAnimate`).
 */
export function isPronounElement(el: ResolvedNounElement): boolean {
  const head = el.conjuncts.length === 1 ? el.conjuncts[0].head.forms : undefined;
  return !!head?.['person'] && head['indefinite'] !== '1';
}
