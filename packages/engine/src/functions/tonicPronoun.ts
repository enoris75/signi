import type { ResolvedNounPhrase } from '../types.js';

/**
 * The tonic (disjunctive) surface a pronoun takes behind an adposition — "with him", "con lui",
 * "avec lui", "mit ihm", "con él", "com ele" — or `undefined` where the phrase is a noun and the
 * ordinary noun-phrase renderer applies. A pronoun there takes no article and no declension of its
 * own: the adposition governs it, and `resolveNounPhrase` has already picked the `disjunctive` form
 * for the person, number and gender in hand (the German one is the dative). A pronoun with no tonic
 * form falls back to its base surface, which is then its only one.
 */
export function tonicPronoun(np: ResolvedNounPhrase): string | undefined {
  const forms = np.head.forms;
  if (!forms['person']) return undefined;
  return forms['disjunctive'] ?? forms['base'] ?? '';
}
