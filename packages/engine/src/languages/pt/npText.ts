import type { ResolvedNounPhrase } from '../../types.js';
import { nounPhrase } from './nounPhrase.js';
import { ptAdj } from './ptAdj.js';
import { ptPossessiveWord } from './ptPossessiveWord.js';
import { withRelative } from './withRelative.js';

/** One conjunct as a plain noun phrase carrying its own determiner ("uma palavra"). */
export function npText(np: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(np.head.forms, ptAdj(np), ptPossessiveWord(np)), np);
}
