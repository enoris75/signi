import type { ResolvedNounPhrase } from '../../types.js';
import { vlPossessedHeadForms } from './vlPossessedHeadForms.js';
import { vlArticle } from './vlArticle.js';
import { renderNP } from './renderNP.js';
import { withRelative } from './withRelative.js';

export function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  // An indefinite pronoun keeps its relative clause: "qualchün chi cuorra vezza il giat" (A309).
  if (forms['person']) return withRelative(forms['number'] === 'plural' && forms['plural'] ? forms['plural'] : forms['base'] ?? '', np);
  return renderNP(np, (plural, lead) => vlArticle(vlPossessedHeadForms(np), plural, lead)); // noun — determiner from forms
}
