import { VOWEL_START } from './fr.consts.js';

/**
 * A French yes/no question: the statement it asks about, unchanged, behind "est-ce que" — "est-ce que
 * le chat mange ?", elided before a vowel as "que" always is: "est-ce qu'il mange ?", "est-ce qu'un
 * chat mange ?". The inversion "le chat mange-t-il ?" says the same in a higher register, but it moves
 * the subject clitic past the verb and needs the euphonic -t-; "est-ce que" is correct for every subject
 * in every tense, including the first singular, which does not invert.
 */
export function estCeQue(statement: string): string {
  return VOWEL_START.test(statement) ? `est-ce qu'${statement}` : `est-ce que ${statement}`;
}
