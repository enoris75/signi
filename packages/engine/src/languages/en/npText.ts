import type { ResolvedNounPhrase } from '../../types.js';
import { hasPartitivePossessor } from './hasPartitivePossessor.js';
import { nounMods } from './nounMods.js';
import { nounPhrase } from './nounPhrase.js';
import { npAdj } from './npAdj.js';
import { npHasSuperlative } from './npHasSuperlative.js';
import { withRelative } from './withRelative.js';

/** One conjunct as a full non-subject noun phrase: determiner, adjectives, modifiers, relative. */
export function npText(np: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(np.head.forms, npAdj(np), nounMods(np), np.possessor, npHasSuperlative(np), hasPartitivePossessor(np)), np);
}
