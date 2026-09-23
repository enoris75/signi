import type { ResolvedNounPhrase } from '../../types.js';
import { enAdj } from './enAdj.js';
import { isPostposedEquative } from './isPostposedEquative.js';

/**
 * Join a resolved noun phrase's prenominal adjectives, each carrying its comparative degree. An
 * equative with a standard is not among them: it follows the noun with its standard ("a cat as big as
 * the dog", P09-E18; see `npStandard`).
 */
export function npAdj(np: ResolvedNounPhrase): string {
  return np.adjectives.filter((a) => !isPostposedEquative(np, a)).map(enAdj).filter(Boolean).join(' ');
}
