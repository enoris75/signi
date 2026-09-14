import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessiveEs } from '../../possessive.js';
import { isPlural } from './isPlural.js';

// The prenominal possessive determiner ("su") for a pronominal possessor, agreeing with this
// possessed head in number (and, for nuestro/vuestro, gender). Empty for a genitive/absent
// possessor — that one is postnominal ("de") and handled by `possessorText`.
export function esPossessiveWord(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss || !isPronominalPossessor(poss)) return '';
  const forms = np.head.forms;
  return possessiveEs(poss, {
    gender: (forms['gender'] ?? 'masc') as 'masc' | 'fem',
    number: isPlural(forms) ? 'plural' : 'singular',
  });
}
