import type { ResolvedNounElement } from '../types.js';

/**
 * Whether a resolved element is the generic person (GENERIC_PERSON) in a language that gives it no
 * dative, so that a frame putting it in the dative drops it instead (A316). The generic's dative is
 * its lexeme's `disjunctive`, the form every engine already reads for a pronoun in the dative or
 * after a preposition: German *einem* ("es geht einem gut"), Spanish *uno* ("el gato le gusta a
 * uno"). Italian *si* and the others have none ("no language says *piace a si*"), and the experiencer
 * is dropped as a generic agent is under the passive.
 */
export function genericWithoutDative(el: ResolvedNounElement): boolean {
  return el.agreement['generic'] === '1' && !el.conjuncts[0]?.head.forms['disjunctive'];
}
