import type { ResolvedNounPhrase } from '../../types.js';
import { nounPhrase } from './nounPhrase.js';

export function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return nounPhrase(np, 'nom'); // noun — nominative article
}
