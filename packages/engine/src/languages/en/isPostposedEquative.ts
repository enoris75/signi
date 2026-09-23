import type { ConceptForms, ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';

/**
 * Whether attributive adjective `a` is an equative with a standard, which English cannot leave
 * before the noun — "*an as big cat as the dog" — and so moves behind it with its standard: "a cat as
 * big as the dog" (P09-E18). The article-shifting "as big a cat as the dog" is a follow-up.
 */
export function isPostposedEquative(np: ResolvedNounPhrase, a: ConceptForms): boolean {
  return adjDegree(a) === 'equally' && attributiveStandard(np, a) !== undefined;
}
