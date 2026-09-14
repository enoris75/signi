import type { ResolvedPhrase } from '../../types.js';
import { elidableComplement } from './elidableComplement.js';

/**
 * A121. A copula with no complement of its own, after a clause that has one, elides that complement:
 * "the cat is happy, but the dog is not", "if the cat were a legend, the dog would not be". The
 * ellipsis only looks back, to the clause before it: the first clause of a coordination, or the
 * protasis of a main clause. A bare copula with no such antecedent asserts existence ("the cat is"),
 * and is left alone. Returns the clause with the elided complement on its verb phrase.
 */
export function elideSubjectComplement(clause: ResolvedPhrase, antecedent: ResolvedPhrase): ResolvedPhrase {
  const vp = clause.verbPhrase;
  const bare = vp?.verb.forms['copula'] === '1' && !clause.directObject
    && Object.keys(clause.complements ?? {}).length === 0;
  const elided = bare ? elidableComplement(antecedent) : undefined;
  return elided ? { ...clause, verbPhrase: { ...vp!, elided } } : clause;
}
