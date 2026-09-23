import type { ConceptForms, ResolvedNounElement, ResolvedNounPhrase } from '../types.js';

/**
 * The standard of comparison attributive adjective `a` of `np` carries — "the dog" of "bigger" in "a
 * bigger cat than the dog" (P09-E18) — or undefined for any other adjective. At most one adjective
 * of a phrase has one (`ResolvedNounPhrase.adjectiveStandard`), which each engine places inside the
 * noun phrase in its own way.
 */
export function attributiveStandard(np: ResolvedNounPhrase, a: ConceptForms): ResolvedNounElement | undefined {
  const own = np.adjectiveStandard;
  return own && np.adjectives[own.index] === a ? own.standard : undefined;
}
