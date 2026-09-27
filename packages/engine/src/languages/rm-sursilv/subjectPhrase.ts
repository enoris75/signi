import type { ResolvedNounPhrase } from '../../types.js';
import { sursilvPossessedHeadForms } from './sursilvPossessedHeadForms.js';
import { sursilvArticle } from './sursilvArticle.js';
import { renderNP } from './renderNP.js';
import { withRelative } from './withRelative.js';

export function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  // An indefinite pronoun keeps its relative clause: "enzatgi che cuora vesa il gat" (A309).
  if (forms['person']) return withRelative(forms['number'] === 'plural' && forms['plural'] ? forms['plural'] : forms['base'] ?? '', np);
  return renderNP(np, (plural, lead) => sursilvArticle(sursilvPossessedHeadForms(np), plural, lead)); // noun — determiner from forms
}
