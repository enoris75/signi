import type { ResolvedNounElement } from '../types.js';

/**
 * Whether a resolved subject is the generic / impersonal pronoun ("one eats" — the seeded
 * GENERIC_PERSON, flagged `generic`). It is a 3rd-person-singular pronoun for agreement, but its
 * surface differs by language: a placed subject word in en/de/fr ("one"/"man"/"on"), a preverbal
 * impersonal clitic in the Romance clitic languages (it "si", es/pt "se"), and dropped in ja. The
 * clitic engines read this to suppress the subject word and emit the clitic instead (see each
 * `predicateText`); ja reads it to drop the clause subject entirely.
 */
export function isGenericSubject(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].head.forms['generic'] === '1';
}
