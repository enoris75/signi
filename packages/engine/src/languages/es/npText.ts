import type { ResolvedNounPhrase } from '../../types.js';
import { esAdj } from './esAdj.js';
import { esPossessiveWord } from './esPossessiveWord.js';
import { nounPhrase } from './nounPhrase.js';
import { withRelative } from './withRelative.js';

/** One conjunct as a plain noun phrase carrying its own determiner ("una palabra"). */
export function npText(np: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(np.head.forms, esAdj(np), esPossessiveWord(np)), np);
}
