import type { ResolvedNounPhrase } from '../types.js';

/**
 * A shallow copy of a resolved noun phrase with its head's `definiteness` overridden — used to
 * re-render a `no` object under a non-negative determiner when the clause is negated elsewhere
 * (English "any", German the plain indefinite), so the double negative is avoided. The original
 * forms are left untouched.
 */
export function withDefiniteness(np: ResolvedNounPhrase, definiteness: string): ResolvedNounPhrase {
  return { ...np, head: { ...np.head, forms: { ...np.head.forms, definiteness } } };
}
