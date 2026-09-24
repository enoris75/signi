import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { artFor } from './artFor.js';
import { renderNP } from './renderNP.js';
import { withRelative } from './withRelative.js';

export function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  // An indefinite pronoun keeps its relative clause: "quelqu'un qui court voit le chat" (A309).
  if (forms['person']) return withRelative(forms['number'] === 'plural' && forms['plural'] ? forms['plural'] : forms['base'] ?? '', np);
  return renderNP(np, (plural, lead) => artFor(possessedHeadForms(np, 'bare'), plural, lead)); // noun — determiner from forms
}
