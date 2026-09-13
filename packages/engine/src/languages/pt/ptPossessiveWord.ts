import { isPronominalPossessor, type ResolvedNounPhrase } from '../../types.js';
import { possessivePt } from '../../possessive.js';
import { defArticle } from './defArticle.js';
import { isPlural } from './isPlural.js';

// The possessive determiner for a pronominal possessor, with its leading definite article
// ("o seu", "a sua", "os seus"), agreeing with this possessed head in gender/number. Empty for a
// genitive/absent possessor — that one is postnominal ("de") and handled by `possessorText`. A
// complement fuses its preposition with that article itself ("ao seu", "na minha"), so it asks for
// the possessive alone (`withArticle` false).
export function ptPossessiveWord(np: ResolvedNounPhrase, withArticle = true): string {
  const poss = np.possessor;
  if (!poss || !isPronominalPossessor(poss)) return '';
  const forms = np.head.forms;
  const plural = isPlural(forms);
  const agree = { gender: (forms['gender'] ?? 'masc') as 'masc' | 'fem', number: (plural ? 'plural' : 'singular') as 'singular' | 'plural' };
  return withArticle ? `${defArticle(forms, plural)} ${possessivePt(poss, agree)}` : possessivePt(poss, agree);
}
