import type { ResolvedNounElement, ResolvedVerbPhrase } from '../../types.js';
import { groupHasNegativeAdverb } from '../../functions/groupHasNegativeAdverb.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import type { FiniteNegation } from './de.types.js';
import { modalAdverbs } from './modalAdverbs.js';
import { nichtSlots } from './nichtSlots.js';

/**
 * How a clause negates: the declarative, the verb-final "wenn" protasis, the relative clause, the
 * command, the instruction and the infinitive all decide it the same way, and place "nicht" by the
 * shared `nichtSlots`.
 *
 * - A negative adverb ("nie") on the main verb or any modal is itself the negator, so there is no
 *   "nicht" ("isst nie", "der nie isst").
 * - A `no` object's "kein" is too (kein = nicht + ein): "isst keine Maus", never "isst keine Maus
 *   nicht".
 * - With both, "nie keine Maus" would double the negative, so the object drops to the plain
 *   indefinite: "isst nie eine Maus".
 *
 * `predicative` is whether the clause carries a predicate complement, which "nicht" leads.
 */
export function finiteNegation(
  verbPhrase: ResolvedVerbPhrase,
  directObject: ResolvedNounElement | undefined,
  predicative: boolean,
): FiniteNegation {
  const adverbIsNegative = groupHasNegativeAdverb(verbPhrase);
  const objectIsNegative = directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no') ?? false;
  const negate = verbPhrase.negative === true && !adverbIsNegative && !objectIsNegative;
  // Any adverb in the Mittelfeld — a modal's or the main verb's — takes the "nicht immer" slot.
  const adverb = !!(modalAdverbs(verbPhrase.modals) || verbPhrase.modifier?.forms['base']);
  return {
    nicht: nichtSlots(negate, { prospective: verbPhrase.aspect === 'prospective', adverb, predicative }),
    directObject: directObject && adverbIsNegative && objectIsNegative
      ? { ...directObject, conjuncts: directObject.conjuncts.map((np) => withDefiniteness(np, 'indefinite')) }
      : directObject,
  };
}
