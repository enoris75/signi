import type { ResolvedNounPhrase } from '../../types.js';
import { caAdj } from './caAdj.js';
import { caPossessiveWord } from './caPossessiveWord.js';
import { nounPhrase } from './nounPhrase.js';
import { withRelative } from './withRelative.js';

/** One conjunct as a plain noun phrase carrying its own determiner ("una paraula"). */
export function npText(np: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(np.head.forms, caAdj(np), caPossessiveWord(np)), np);
}
