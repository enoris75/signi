import type { ResolvedNounPhrase } from '../../types.js';
import { enAdj } from './enAdj.js';

/** Join a resolved noun phrase's adjectives, each carrying its comparative degree. */
export function npAdj(np: ResolvedNounPhrase): string {
  return np.adjectives.map(enAdj).filter(Boolean).join(' ');
}
