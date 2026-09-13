import type { ResolvedNounPhrase } from '../../types.js';
import { nounMods } from './nounMods.js';
import { nounPhrase } from './nounPhrase.js';
import { npAdj } from './npAdj.js';
import { npHasSuperlative } from './npHasSuperlative.js';

export function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(forms, npAdj(np), nounMods(np), np.possessor, npHasSuperlative(np)); // noun — determiner from forms
}
