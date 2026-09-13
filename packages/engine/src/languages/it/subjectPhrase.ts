import type { ResolvedNounPhrase } from '../../types.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { artFor } from './artFor.js';
import { renderNP } from './renderNP.js';

export function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  if (forms['person']) {
    if (forms['number'] === 'plural' && forms['plural']) return forms['plural'];
    return forms['base'] ?? '';
  }
  return renderNP(np, (plural, lead) => artFor(itPossessedHeadForms(np), plural, lead)); // noun — determiner from forms
}
