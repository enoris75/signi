import type { ResolvedComplement } from '../types.js';

/**
 * Whether every conjunct of a predicate complement is headed by an **adjective** rather than a
 * noun. It decides the marker an `objectPredicative` takes: the factitive link a verb names
 * introduces a noun — "transforms the house **into a prison**" — and an adjective predicate takes
 * none in any of these languages ("makes the house beautiful", "rende la casa bella"). A group
 * mixing the two keeps the link, since the noun in it needs one.
 */
export function isAdjectivePredicate(c: ResolvedComplement): boolean {
  return c.phrase.conjuncts.every((np) => np.head.forms['role'] === 'adjective');
}
