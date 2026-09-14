import type { ElidedComplement, ResolvedPhrase } from '../../types.js';

/**
 * The subject complement a clause can hand on to a following bare copula: its predicative, failing
 * that its locative, or the one it elides itself. Only a copula has one to hand on.
 */
export function elidableComplement(antecedent: ResolvedPhrase): ElidedComplement | undefined {
  const vp = antecedent.verbPhrase;
  if (vp?.verb.forms['copula'] !== '1') return undefined;
  const { predicative, locative } = antecedent.complements ?? {};
  if (predicative) return { type: 'predicative', complement: predicative };
  if (locative) return { type: 'locative', complement: locative };
  return vp.elided;
}
