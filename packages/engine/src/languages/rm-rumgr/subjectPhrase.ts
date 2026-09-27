import type { ResolvedNounPhrase } from '../../types.js';
import { rgPossessedHeadForms } from './rgPossessedHeadForms.js';
import { rgArticle } from './rgArticle.js';
import { renderNP } from './renderNP.js';
import { withRelative } from './withRelative.js';

export function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  // An indefinite pronoun keeps its relative clause: "insatgi che curra vesa il giat" (A309).
  if (forms['person']) return withRelative(forms['number'] === 'plural' && forms['plural'] ? forms['plural'] : forms['base'] ?? '', np);
  return renderNP(np, (plural, lead) => rgArticle(rgPossessedHeadForms(np), plural, lead)); // noun — determiner from forms
}
