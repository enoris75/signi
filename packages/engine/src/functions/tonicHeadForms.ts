import type { ResolvedNounPhrase } from '../types.js';

/**
 * The forms a tonic pronoun's **adposition** is chosen from (A203). Two things differ from the bag
 * a noun hands the head builders:
 *
 * - **No determiner.** A pronoun takes no article, and a head builder fuses one in whenever it is
 *   handed the `definite` that a pronoun's forms fall back to — "al él", "im er", "no ele". `bare`
 *   makes every one of them yield its preposition alone, which is what the tonic form follows, and
 *   leaves each slot's own choice of preposition exactly where it is.
 * - **Animate**, unless the pronoun is neuter. A pronoun standing for a person *is* a person, which
 *   is the branch a goal or a source has to take: "hacia él" and not "al él", "von ihm" and not
 *   "aus ihm", the bare German dative of a recipient. Japanese's `isAnimate` already reads a
 *   `person` that way for the existential. The neuter pronoun stands for a thing, so it keeps the
 *   inanimate branch.
 */
export function tonicHeadForms(np: ResolvedNounPhrase): Record<string, string> {
  const f = np.head.forms;
  return { ...f, definiteness: 'bare', animate: f['gender'] === 'neut' ? '' : '1' };
}
