import type { NounElement, NounPhrase } from '@signi/shared';
import { isNounGroup } from '@signi/shared';

/** A conjunct with its `no` given up for the definite. Any other determiner is kept. */
function withoutNo(np: NounPhrase): NounPhrase {
  return np.definiteness === 'no' ? { ...np, definiteness: 'definite' } : np;
}

/**
 * A171. The unspoken subject an infinitive complement or a clause of purpose takes from the slot that
 * controls it, with every `no` on it given up for the definite. A `no` controller negates the MATRIX
 * clause only, so the embedded clause keeps its own polarity: "no cat desires not to eat", "nessun
 * gatto desidera non mangiare", "aucun chat ne désire manger", どの猫も食べることを望んでいません. Left in, the
 * `no` reads as the embedded clause's own negative subject, which collapses its `not` against it or
 * negates it where it had none, as A167 found for a relative clause under a `no` head.
 *
 * The embedded clause never speaks this subject. It needs only the controller's person, number and
 * gender (for a predicate adjective's agreement) and its `subject_sense`, and the definite keeps them.
 * A causee Japanese speaks inside the clause is read off the matrix's own direct object instead.
 */
export function controlledSubject(controller: NounElement): NounElement {
  if (!isNounGroup(controller)) return withoutNo(controller);
  const conjuncts = controller.conjuncts.map(withoutNo);
  return conjuncts.every((np, i) => np === controller.conjuncts[i]) ? controller : { ...controller, conjuncts };
}
