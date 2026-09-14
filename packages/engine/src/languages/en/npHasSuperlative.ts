import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../resolved/adjDegree.js';

/**
 * Whether the phrase carries a superlative adjective ('most'/'least'). English marks the
 * superlative with a forced definite article; comparatives ('more'/'less') do not, so
 * "a bigger cat" is fine but "a biggest cat" is not.
 */
export function npHasSuperlative(np: ResolvedNounPhrase): boolean {
  return np.adjectives.some((a) => {
    const d = adjDegree(a);
    return d === 'most' || d === 'least';
  });
}
