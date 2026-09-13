import { isPronominalPossessor, type ResolvedNounPhrase } from '../../types.js';
import { possessivePt } from '../../possessive.js';
import { defArticle } from './defArticle.js';
import { isPlural } from './isPlural.js';

// The possessive determiner for a pronominal possessor, with its leading definite article
// ("o seu", "a sua", "os seus"), agreeing with this possessed head in gender/number. Empty for a
// genitive/absent possessor — that one is postnominal ("de") and handled by `possessorText`.
export function ptPossessiveWord(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss || !isPronominalPossessor(poss)) return '';
  const forms = np.head.forms;
  const plural = isPlural(forms);
  const agree = { gender: (forms['gender'] ?? 'masc') as 'masc' | 'fem', number: (plural ? 'plural' : 'singular') as 'singular' | 'plural' };
  return `${defArticle(forms, plural)} ${possessivePt(poss, agree)}`;
}
